import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
    asString,
    badOrigin,
    clientIp,
    deliver,
    EMAIL,
    MAX_BODY_BYTES,
    rateLimited,
} from "@/app/core/intake";
import { QUESTION_IDS } from "@/app/features/feedback/questions";
import { appendSubmission } from "@/app/core/feedback-store";
import { line, sendSubmission } from "@/app/core/mailer";

/**
 * Prospect feedback and discovery intake.
 *
 * Separate from /api/enquiry on purpose: that one is a patient asking for an
 * appointment and is shaped and rate-limited for that. This is a prospective
 * client telling us how to build their site. Same delivery plumbing, different
 * validation, different limits — a prospect filling in six groups of questions
 * is not abusing anything, and should not share a budget with a booking form.
 */

const MAX_PER_WINDOW = 30;

interface CleanRating {
    readonly path: string;
    readonly rating: number;
    readonly note: string;
}

/**
 * Answers are validated against the known question ids rather than passed
 * through. The panel is public, so the body is attacker-controlled: without
 * this an unbounded map of arbitrary keys would be forwarded straight into
 * whatever CRM sits behind the sink.
 */
function cleanAnswers(input: unknown): Record<string, string | string[]> {
    if (typeof input !== "object" || input === null) return {};
    const known = new Set(QUESTION_IDS);
    const out: Record<string, string | string[]> = {};

    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
        if (!known.has(key)) continue;
        if (typeof value === "string") {
            const text = value.trim().slice(0, 1_000);
            if (text !== "") out[key] = text;
        } else if (Array.isArray(value)) {
            const list = value
                .filter((item): item is string => typeof item === "string")
                .slice(0, 20)
                .map((item) => item.trim().slice(0, 200))
                .filter((item) => item !== "");
            if (list.length > 0) out[key] = list;
        }
    }
    return out;
}

function cleanRatings(input: unknown): CleanRating[] {
    if (typeof input !== "object" || input === null) return [];
    const out: CleanRating[] = [];

    for (const value of Object.values(input as Record<string, unknown>)) {
        if (typeof value !== "object" || value === null) continue;
        const row = value as Record<string, unknown>;
        // Only same-site paths, so a rating cannot smuggle a URL into the CRM.
        const path = asString(row.path, 200);
        if (!path.startsWith("/")) continue;
        const rating = typeof row.rating === "number" ? Math.round(row.rating) : 0;
        if (rating < 1 || rating > 5) continue;
        out.push({ path, rating, note: asString(row.note, 1_000) });
        if (out.length >= 40) break;
    }
    return out;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    if (badOrigin(request)) {
        return NextResponse.json({ error: "Bad origin." }, { status: 403 });
    }

    const ip = clientIp(request.headers);
    if (rateLimited("feedback", ip, MAX_PER_WINDOW)) {
        return NextResponse.json(
            { error: "Too many submissions. Please email us instead." },
            { status: 429, headers: { "Retry-After": "600" } },
        );
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
        return NextResponse.json({ error: "That is too large to send." }, { status: 413 });
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return NextResponse.json({ error: "Malformed request." }, { status: 400 });
    }
    if (typeof parsed !== "object" || parsed === null) {
        return NextResponse.json({ error: "Malformed request." }, { status: 400 });
    }

    const body = parsed as Record<string, unknown>;
    const email = asString(body.email, 160);
    const phone = asString(body.phone, 40);

    // One way to reply is the only hard requirement. Everything else is
    // optional by design: a panel that refuses to submit until twenty
    // questions are answered collects nothing at all.
    if (!EMAIL.test(email) && phone.replace(/\D/g, "").length < 7) {
        return NextResponse.json(
            { error: "We need an email address or a phone number to reply to." },
            { status: 422 },
        );
    }

    const reference = crypto.randomUUID().slice(0, 8).toUpperCase();
    const payload = {
        kind: "prospect-feedback",
        reference,
        receivedAt: new Date().toISOString(),
        name: asString(body.name, 120),
        practice: asString(body.practice, 160),
        email,
        phone,
        // What they were looking at when they said it — the whole point of
        // capturing this from inside the demo rather than in a form.
        template: asString(body.template, 40),
        theme: asString(body.theme, 40),
        host: asString(request.headers.get("host"), 120),
        ratings: cleanRatings(body.ratings),
        answers: cleanAnswers(body.answers),
    };

    // Stored before delivery, and never conditionally: if the webhook is down
    // or unset, the answers still have to survive somewhere readable.
    await appendSubmission(payload);

    /* Email is the real destination here: there is no CRM behind this
       deployment, so a webhook alone would mean nobody ever reads this. */
    const mail = await sendSubmission(
        `Website feedback — ${payload.practice || payload.name || "a prospect"} (${reference})`,
        [
            `A prospect submitted feedback from the demo site.`,
            ``,
            line("Reference", reference),
            line("Name", payload.name),
            line("Practice", payload.practice),
            line("Email", payload.email),
            line("Phone", payload.phone),
            ``,
            `They were looking at:`,
            line("  Layout", payload.template),
            line("  Colours", payload.theme),
            line("  Site", payload.host),
            ``,
            `Page ratings:`,
            ...payload.ratings.map(
                (r) => `  ${r.path} — ${r.rating}/5${r.note === "" ? "" : ` — ${r.note}`}`,
            ),
            ``,
            `Answers:`,
            ...Object.entries(payload.answers).map(([key, value]) => `  ${line(key, value)}`),
            ``,
            `Received ${payload.receivedAt}`,
        ].filter((row) => row !== undefined),
    );

    const sink = process.env.FEEDBACK_WEBHOOK_URL ?? process.env.ENQUIRY_WEBHOOK_URL;
    if (sink === undefined || sink === "") {
        // Accept so the journey is testable, and say plainly that nothing was
        // delivered — never imply it arrived.
        if (!mail.sent) {
            console.warn(`[feedback ${reference}] no webhook and no mail — stored only`);
        }
        return NextResponse.json(
            { ok: true, delivered: mail.sent, reference },
            { status: mail.sent ? 200 : 202 },
        );
    }

    const posted = await deliver(sink, JSON.stringify(payload), reference, "feedback");
    // Delivered if it reached anyone at all — the webhook or the inbox.
    const delivered = posted || mail.sent;
    return NextResponse.json({ ok: true, delivered, reference }, { status: delivered ? 200 : 202 });
}

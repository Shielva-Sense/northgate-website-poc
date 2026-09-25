import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Appointment enquiry intake.
 *
 * This is the endpoint the whole site exists to feed, so it is written as if it
 * were live rather than as a demo stub:
 *
 * - Everything is validated again here. The client-side checks are there to be
 *   helpful; they are not a control, because anyone can POST this directly.
 * - Rate limited per IP, because an unauthenticated public form is spam bait.
 * - Same-origin only, so a third-party page cannot post through a visitor.
 * - Health details are special category data. They are forwarded to the
 *   configured sink and never written to our own logs.
 */

export const runtime = "nodejs";

const MAX_BODY_BYTES = 8_000;
const WINDOW_MS = 10 * 60 * 1000;
/**
 * Deliberately not tight. The limit is checked before validation, so a typo
 * costs an attempt — five would lock out a patient who fumbles the form a few
 * times, which is a far more common event than an attack. This still stops a
 * bot cold, and the number must go up, not down, if the practice ever sits
 * behind NAT where many genuine patients share one address.
 */
const MAX_PER_WINDOW = 12;

/**
 * In-process counter. Correct for a single instance, which is what this
 * deployment is. Behind more than one replica this must move to Redis or the
 * limit is silently multiplied by the replica count.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || now > entry.resetAt) {
        hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        // Opportunistic sweep so the map cannot grow without bound.
        if (hits.size > 5_000) {
            for (const [key, value] of hits) if (now > value.resetAt) hits.delete(key);
        }
        return false;
    }

    entry.count += 1;
    return entry.count > MAX_PER_WINDOW;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const DELIVERY_ATTEMPTS = 3;

/**
 * POST the enquiry to a sink, retrying transient failures.
 *
 * A 4xx is the sink telling us the request is wrong — retrying cannot help and
 * only doubles the load, so only 5xx and network faults are retried. Backoff is
 * short because a patient is watching a spinner.
 */
async function deliver(url: string, payload: string, reference: string): Promise<boolean> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    // Most CRMs want a key. The header name is configurable because they do not
    // agree on one: GoHighLevel and HubSpot want Authorization, others use their
    // own, and a few want it as a query string already baked into the URL.
    const token = process.env.ENQUIRY_WEBHOOK_TOKEN;
    if (token !== undefined && token !== "") {
        const header = process.env.ENQUIRY_WEBHOOK_AUTH_HEADER ?? "Authorization";
        headers[header] = header.toLowerCase() === "authorization" ? `Bearer ${token}` : token;
    }

    for (let attempt = 1; attempt <= DELIVERY_ATTEMPTS; attempt += 1) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers,
                body: payload,
                signal: AbortSignal.timeout(8_000),
            });
            if (response.ok) return true;

            if (response.status < 500) {
                // Our fault or theirs, but not transient. Never log the URL.
                console.error(
                    `[enquiry ${reference}] sink rejected it: ${response.status} — not retrying`,
                );
                return false;
            }
            console.warn(
                `[enquiry ${reference}] sink returned ${response.status}, attempt ${attempt}`,
            );
        } catch {
            console.warn(`[enquiry ${reference}] sink unreachable, attempt ${attempt}`);
        }

        if (attempt < DELIVERY_ATTEMPTS) {
            await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** (attempt - 1)));
        }
    }

    return false;
}

function asString(value: unknown, max: number): string {
    return typeof value === "string" ? value.trim().slice(0, max) : "";
}

type Validated = {
    readonly fullName: string;
    readonly phone: string;
    readonly email: string;
    readonly service: string;
    readonly clinician: string;
    readonly window: string;
    readonly urgency: string;
    readonly notes: string;
    readonly consent: boolean;
};

function validate(input: Record<string, unknown>): { ok: true; data: Validated } | {
    ok: false;
    error: string;
} {
    const fullName = asString(input.fullName, 120);
    const phone = asString(input.phone, 40);
    const email = asString(input.email, 160);

    if (fullName.length < 2) return { ok: false, error: "Please tell us your name." };

    const digits = phone.replace(/\D/g, "").length;
    const hasPhone = digits >= 7;
    const hasEmail = EMAIL.test(email);
    if (!hasPhone && !hasEmail) {
        return { ok: false, error: "We need a phone number or an email address to reply to." };
    }

    // Consent to be contacted is the lawful basis for holding any of this.
    if (input.consent !== true) {
        return { ok: false, error: "We need your permission to contact you about this request." };
    }

    return {
        ok: true,
        data: {
            fullName,
            phone,
            email,
            service: asString(input.service, 80),
            clinician: asString(input.clinician, 120),
            window: asString(input.window, 40),
            urgency: asString(input.urgency, 40),
            notes: asString(input.notes, 2_000),
            consent: true,
        },
    };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    // A cross-site page must not be able to post through a signed-in visitor.
    const origin = request.headers.get("origin");
    if (origin !== null && origin !== new URL(request.url).origin) {
        return NextResponse.json({ error: "Bad origin." }, { status: 403 });
    }

    const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        request.headers.get("x-real-ip") ??
        "unknown";

    if (rateLimited(ip)) {
        return NextResponse.json(
            { error: "Too many requests. Please ring us instead." },
            { status: 429, headers: { "Retry-After": "600" } },
        );
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
        return NextResponse.json({ error: "That request is too large." }, { status: 413 });
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

    const result = validate(parsed as Record<string, unknown>);
    if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 422 });
    }

    const sink = process.env.ENQUIRY_WEBHOOK_URL;
    // Every enquiry gets an id. It is returned to the patient and printed in
    // our logs, so "I submitted something on Tuesday" becomes traceable without
    // any of the answers ever being logged.
    const reference = crypto.randomUUID().slice(0, 8).toUpperCase();

    if (sink === undefined || sink === "") {
        // No sink wired yet. Accept so the journey is testable, and say plainly
        // that nothing was delivered — never pretend it arrived.
        console.warn(
            `[enquiry ${reference}] ENQUIRY_WEBHOOK_URL is not set — accepted but NOT delivered`,
        );
        return NextResponse.json({ ok: true, delivered: false, reference }, { status: 202 });
    }

    const payload = JSON.stringify({
        ...result.data,
        reference,
        receivedAt: new Date().toISOString(),
    });

    const delivered = await deliver(sink, payload, reference);
    if (delivered) {
        return NextResponse.json({ ok: true, delivered: true, reference });
    }

    // Primary sink is down. A lost enquiry is lost revenue for the practice and
    // an unanswered patient, so try a second destination before giving up.
    const fallback = process.env.ENQUIRY_FALLBACK_URL;
    if (fallback !== undefined && fallback !== "") {
        const rescued = await deliver(fallback, payload, reference);
        if (rescued) {
            console.warn(`[enquiry ${reference}] primary sink failed, fallback accepted it`);
            return NextResponse.json({ ok: true, delivered: true, reference });
        }
    }

    // Both gone. Tell the patient honestly and give them the reference and the
    // phone number rather than a cheerful confirmation of nothing.
    console.error(
        `[enquiry ${reference}] NOT DELIVERED — every sink failed. This enquiry is lost.`,
    );
    return NextResponse.json(
        {
            error: "We could not log that just now. Please ring us so you are not left waiting.",
            reference,
        },
        { status: 502 },
    );
}

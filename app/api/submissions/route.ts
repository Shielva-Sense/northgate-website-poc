import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyBasic } from "@/app/core/admin-auth";
import { readSubmissions } from "@/app/core/feedback-store";
import { clientIp, rateLimited } from "@/app/core/intake";

/**
 * Read back what prospects have submitted.
 *
 * Protected by its own credentials rather than the site's invite session: the
 * invite is shared with every prospect being shown the demo, so anything gated
 * only by it is effectively public to all of them. This holds other people's
 * contact details and their answers about their own business, and must not be
 * readable by the next prospect who is given the preview login.
 *
 * Credentials are stored as hashes — SHA-256 for the username, scrypt for the
 * password — and compared in constant time. See app/core/admin-auth.ts.
 */

/** Tighter than the public forms: a failed guess here is worth more. */
const MAX_ATTEMPTS_PER_WINDOW = 10;

const DENY_HEADERS = {
    // Prompts a credential box in a browser, and tells curl what to send.
    "WWW-Authenticate": 'Basic realm="Shielva submissions", charset="UTF-8"',
    "Cache-Control": "no-store",
} as const;

export async function GET(request: NextRequest): Promise<NextResponse> {
    const ip = clientIp(request.headers);

    // Rate limit before checking the credentials, so an attacker cannot use
    // this endpoint as a fast oracle for guessing them.
    if (rateLimited("submissions", ip, MAX_ATTEMPTS_PER_WINDOW)) {
        return NextResponse.json(
            { error: "Too many attempts." },
            { status: 429, headers: { ...DENY_HEADERS, "Retry-After": "600" } },
        );
    }

    const auth = verifyBasic(request.headers.get("authorization"));

    if (auth === "not-configured") {
        // Say so plainly rather than returning an empty list, which would look
        // like "no submissions yet" and hide a misconfigured deployment.
        return NextResponse.json(
            { error: "The submissions API is not configured on this deployment." },
            { status: 503, headers: { "Cache-Control": "no-store" } },
        );
    }

    if (auth !== "ok") {
        // Deliberately vague, and never logs what was attempted.
        return NextResponse.json(
            { error: "Not authorised." },
            { status: 401, headers: DENY_HEADERS },
        );
    }

    const submissions = await readSubmissions();

    return NextResponse.json(
        {
            count: submissions.length,
            // Each row carries the layout and palette the prospect was actually
            // looking at, which is the point of capturing it from the demo.
            submissions,
        },
        { headers: { "Cache-Control": "no-store" } },
    );
}

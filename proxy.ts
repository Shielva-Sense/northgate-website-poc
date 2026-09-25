import { NextResponse } from "next/server";

/**
 * Pass-through.
 *
 * This used to be an invite gate: one shared username and password in front of
 * a single demo. The site farm has no use for it — every prospect gets their
 * own address and is sent the link directly, and a shared password handed to
 * dozens of people protects nothing anyway.
 *
 * What still protects these pages:
 *
 * - `X-Robots-Tag: noindex, nofollow` on every response, set in next.config.ts,
 *   so none of them reach a search result.
 * - An address nobody can guess: the identifier is chosen per client.
 * - A visible demo ribbon on the page itself, so a site carrying a real
 *   clinic's name can never be mistaken for that clinic's own.
 *
 * The one thing that is still gated is /api/submissions, which holds other
 * people's contact details and enforces its own credentials.
 */

export default function proxy(): NextResponse {
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

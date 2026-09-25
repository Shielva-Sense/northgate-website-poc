import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/app/core/session";

/**
 * Invite-only gate for the preview subdomain.
 *
 * A signed session cookie rather than HTTP Basic: Basic pops the browser's own
 * credential box, which cannot be branded, cannot show an error, and cannot be
 * signed out of without closing the browser. This redirects to a real page.
 *
 * Credentials come from the environment, never source.
 */

/**
 * Paths served without a session.
 *
 * The icons and the manifest are here because a browser fetches a favicon in
 * contexts that do not carry the session cookie — and on the sign-in page there
 * is no cookie yet — so gating them just means a blank tab icon. None of them
 * reveal anything: they are a logo and a colour.
 */
const PUBLIC_PATHS = [
    "/login",
    "/api/login",
    "/icon.svg",
    "/apple-icon",
    "/manifest.webmanifest",
];

export default async function proxy(request: NextRequest): Promise<NextResponse> {
    const { pathname, search } = request.nextUrl;

    // Fail closed: an unconfigured gate must not silently publish the site.
    const secret = process.env.POC_PASSWORD;
    if (!secret || !process.env.POC_USER) {
        return new NextResponse("Preview is not configured.", {
            status: 503,
            headers: { "Cache-Control": "no-store" },
        });
    }

    const authorised = await verifyToken(request.cookies.get(SESSION_COOKIE)?.value, secret);

    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
        // Already signed in? Skip the form.
        if (authorised && pathname === "/login") {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    if (!authorised) {
        const url = new URL("/login", request.url);
        // Send them where they were heading once they are through.
        if (pathname !== "/") url.searchParams.set("next", `${pathname}${search}`);
        const response = NextResponse.redirect(url);
        response.headers.set("Cache-Control", "no-store");
        return response;
    }

    const response = NextResponse.next();
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
}

export const config = {
    // Gate everything except Next's own build output.
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

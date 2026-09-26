import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Sends every bare path to a language.
 *
 * Routes live under `app/[locale]`, so the language is a static route param
 * and no page has to read the request to know it. That matters: an earlier
 * version rewrote `/ar/services` to `/services` and passed the language in a
 * request header, and the rewritten request lost both the header and the
 * original Host — every Arabic page then rendered under the default brand
 * instead of the tenant's.
 *
 * The cost of that design is that `/services` is no longer a route, so this
 * redirects it to `/en/services`. A redirect rather than a rewrite, because
 * every demo link already sent to a prospect, every proposal PDF and the
 * sitemap point at bare paths: they have to keep working, and they should end
 * up at a real address rather than silently rendering a page whose URL says
 * nothing about which language it is in.
 *
 * This file used to be an invite gate: one shared username and password in
 * front of a single demo. The farm has no use for that — every prospect gets
 * their own address and is sent the link directly. What protects these pages
 * now is `X-Robots-Tag: noindex` from next.config.ts, an address nobody can
 * guess, and the visible demo ribbon that stops a site carrying a real
 * clinic's name from being mistaken for that clinic's own. /api/sites and
 * /api/submissions enforce their own credentials.
 *
 * Anything added here gates every prospect site at once, so it should stay
 * this small.
 */

/** Not pages: assets, API routes and the metadata files Next serves at root. */
const PASS_THROUGH =
    /^\/(api|_next|img|video|favicon|robots\.txt|sitemap\.xml|manifest\.webmanifest|icon|apple-icon)/;

const LOCALE_PREFIX = /^\/(en|ar)(?=\/|$)/;

export function proxy(request: NextRequest): NextResponse {
    const { pathname } = request.nextUrl;

    if (PASS_THROUGH.test(pathname) || LOCALE_PREFIX.test(pathname)) {
        return NextResponse.next();
    }

    const target = request.nextUrl.clone();
    target.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
    return NextResponse.redirect(target);
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyBasic } from "@/app/core/admin-auth";
import { clientIp, rateLimited } from "@/app/core/intake";
import { ensureIndexes, listSites, upsertSite } from "@/app/core/site-store";
import { iconPrefix } from "@/app/core/site";
import { PRACTICE_KINDS } from "@/app/features/clinic/practice-kinds";
import type { SiteRecord } from "@/app/core/site-store";

/**
 * The site registry API.
 *
 * GET  — list every configured site.
 * POST — create or update one. A new prospect site is this call plus a link;
 *        no build, no deploy, no DNS beyond the wildcard.
 *
 * Credentialed with the same hashed username and scrypt password as
 * /api/submissions. This is the one part of the farm that must stay shut: it
 * decides what every public page says, so an open version would let anyone put
 * words under a real clinic's name on a site that carries their address.
 */

const MAX_ATTEMPTS = 10;
const DENY = {
    "WWW-Authenticate": 'Basic realm="Shielva sites", charset="UTF-8"',
    "Cache-Control": "no-store",
} as const;

/** Subdomain-safe: this becomes a host label, so it cannot carry a dot. */
const IDENTIFIER = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

function str(v: unknown, max: number): string | undefined {
    if (typeof v !== "string") return undefined;
    const t = v.trim().slice(0, max);
    return t === "" ? undefined : t;
}

function guard(request: NextRequest): NextResponse | null {
    if (rateLimited("sites", clientIp(request.headers), MAX_ATTEMPTS)) {
        return NextResponse.json({ error: "Too many attempts." }, { status: 429, headers: DENY });
    }
    const auth = verifyBasic(request.headers.get("authorization"));
    if (auth === "not-configured") {
        return NextResponse.json(
            { error: "The sites API is not configured on this deployment." },
            { status: 503, headers: { "Cache-Control": "no-store" } },
        );
    }
    if (auth !== "ok") {
        return NextResponse.json({ error: "Not authorised." }, { status: 401, headers: DENY });
    }
    return null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
    const denied = guard(request);
    if (denied !== null) return denied;

    const sites = await listSites();
    return NextResponse.json(
        {
            count: sites.length,
            sites: sites.map((s) => ({
                ...s,
                url: `https://app.${s.identifier}.shielva.ai`,
                iconPrefix: iconPrefix(s.identifier),
            })),
        },
        { headers: { "Cache-Control": "no-store" } },
    );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    const denied = guard(request);
    if (denied !== null) return denied;

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Malformed request." }, { status: 400 });
    }
    if (typeof body !== "object" || body === null) {
        return NextResponse.json({ error: "Malformed request." }, { status: 400 });
    }

    const b = body as Record<string, unknown>;
    const identifier = (str(b.identifier, 40) ?? "").toLowerCase();
    if (!IDENTIFIER.test(identifier)) {
        return NextResponse.json(
            { error: "identifier must be 3-40 chars, a-z 0-9 and hyphens, and is used as a subdomain." },
            { status: 422 },
        );
    }
    const kind = str(b.kind, 40);
    if (kind !== undefined && !PRACTICE_KINDS.includes(kind as never)) {
        return NextResponse.json(
            { error: `kind must be one of: ${PRACTICE_KINDS.join(", ")}` },
            { status: 422 },
        );
    }

    const businessName = str(b.businessName, 160);
    if (businessName === undefined) {
        return NextResponse.json({ error: "businessName is required." }, { status: 422 });
    }

    /* Assembled by assignment rather than conditional spread: under
       exactOptionalPropertyTypes a spread still widens each field to
       `string | undefined`, and the point of the flag is that an absent field
       and a field set to undefined are different things in the stored row. */
    const record: Record<string, string> = { identifier, businessName };
    const optional: readonly [string, number][] = [
        ["kind", 40], ["short", 60], ["kicker", 60], ["country", 4], ["city", 80],
        ["address", 200], ["phone", 40], ["aeLine", 40], ["emergencyNumber", 10],
        ["email", 160], ["currency", 4], ["theme", 40], ["template", 40],
        ["iconPath", 200], ["leadSource", 200], ["currentSiteProblem", 300],
        ["notes", 1000],
    ];
    for (const [key, max] of optional) {
        const value = str(b[key], max);
        if (value !== undefined) record[key] = value;
    }

    await ensureIndexes();
    const ok = await upsertSite(record as unknown as SiteRecord);
    if (!ok) {
        return NextResponse.json(
            { error: "No site registry is configured (MONGODB_URL is unset)." },
            { status: 503 },
        );
    }

    return NextResponse.json({
        ok: true,
        identifier,
        url: `https://app.${identifier}.shielva.ai`,
        iconPrefix: iconPrefix(identifier),
    });
}

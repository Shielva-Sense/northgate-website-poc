import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyBasic } from "@/app/core/admin-auth";
import { clientIp, rateLimited } from "@/app/core/intake";
import { ensureIndexes, listSites, upsertSite } from "@/app/core/site-store";
import { iconPrefix } from "@/app/core/site";
import { PRACTICE_KINDS } from "@/app/features/clinic/practice-kinds";
import { CATALOGUE_ICONS } from "@/app/features/clinic/catalogue";
import { RESERVED_SLUGS, SLUG_PATTERN } from "@/app/features/clinic/pages";
import type { SiteRecord } from "@/app/core/site-store";

/**
 * The site registry API.
 *
 * GET  — list every configured site.
 * POST — create or update one, or a batch of them. A new prospect site is
 *        this call plus a link; no build, no deploy, no DNS beyond the
 *        wildcard.
 *
 * The batch form exists because the rate limit counts REQUESTS, and building
 * a hundred prospect sites one POST at a time means ten sites then a
 * ten-minute wait, repeatedly -- about twenty minutes per twenty-three sites.
 * Raising the limit would be the wrong fix: it is low on purpose, because
 * this route decides what a page carrying a real clinic's name says. So one
 * request may now carry many sites and is charged as one.
 *
 * A batch is partially applied on purpose. One malformed identifier in
 * twenty-five should reject that row and create the other twenty-four, not
 * fail the lot -- the caller gets a per-row result and can fix just the one.
 *
 * Credentialed with the same hashed username and scrypt password as
 * /api/submissions. This is the one part of the farm that must stay shut: it
 * decides what every public page says, so an open version would let anyone put
 * words under a real clinic's name on a site that carries their address.
 */

const MAX_ATTEMPTS = 10;
/** Sites per batched request. Bounded so one call cannot be unlimited work. */
const MAX_BATCH = 25;
const DENY = {
    "WWW-Authenticate": 'Basic realm="Shielva sites", charset="UTF-8"',
    "Cache-Control": "no-store",
} as const;

/** Subdomain-safe: this becomes a host label, so it cannot carry a dot. */
const IDENTIFIER = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

/** Department and appointment ids: same alphabet, no length floor. */
const IDENTIFIER_LOOSE = /^[a-z0-9][a-z0-9-]*$/;

/** Rotated through when a row gives departments but no photographs. */
const DEPT_IMAGES: readonly string[] = [
    "/img/dept/general.jpg",
    "/img/dept/cardiometabolic.jpg",
    "/img/dept/womens.jpg",
    "/img/dept/skin.jpg",
    "/img/dept/travel.jpg",
    "/img/dept/mental-health.jpg",
    "/img/dept/paediatrics.jpg",
];

/**
 * Labels a prospect site may not take.
 *
 * A site lives at `<identifier>.shielva.ai`, the same namespace the platform's
 * own hostnames use. An explicit DNS record always beats the wildcard, so a
 * site named "api" could not actually intercept traffic — but it would be a row
 * promising a URL that will never reach it, and the confusion is worth more
 * than the twelve lines it costs to refuse.
 */
const RESERVED = new Set([
    "www", "api", "app", "arc", "login", "signin", "auth", "identity", "gateway",
    "vault", "speech", "voice", "sip", "livekit", "presence", "cms", "cdn",
    "mail", "smtp", "notifications", "billing", "docs", "status", "admin",
    "grafana", "prometheus", "sonarqube", "nexus", "argocd", "devops", "sales",
    "company", "shielva", "northgate-website-poc",
]);

function str(v: unknown, max: number): string | undefined {
    if (typeof v !== "string") return undefined;
    const t = v.trim().slice(0, max);
    return t === "" ? undefined : t;
}

/** An array of plain objects, or a message saying why it is not. */
function readArray(value: unknown, field: string, max: number): readonly Record<string, unknown>[] | string | null {
    if (value === undefined || value === null) return null;
    if (!Array.isArray(value)) return `${field} must be an array.`;
    if (value.length > max) return `${field} may hold at most ${max} entries.`;
    for (const entry of value) {
        if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
            return `${field} entries must be objects.`;
        }
    }
    return value as readonly Record<string, unknown>[];
}

function strings(value: unknown, max: number): readonly string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((v): v is string => typeof v === "string").slice(0, max).map((v) => v.slice(0, 600));
}

/**
 * This clinic's own services, departments, prices and team.
 *
 * Each list is optional and replaces the trade default wholesale. Unknown
 * fields are dropped rather than stored: the row decides what a public page
 * says, so it holds only what the renderer reads.
 */
function readContent(value: unknown): Record<string, unknown> | string | null {
    if (value === undefined || value === null) return null;
    if (typeof value !== "object" || Array.isArray(value)) return "content must be an object.";
    const v = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};

    const services = readArray(v.services, "content.services", 24);
    if (typeof services === "string") return services;
    if (services !== null) {
        out.services = services.map((x) => ({
            slug: str(x.slug, 60) ?? "",
            name: str(x.name, 140) ?? "",
            blurb: str(x.blurb, 400) ?? "",
        }));
    }

    const departments = readArray(v.departments, "content.departments", 24);
    if (typeof departments === "string") return departments;
    if (departments !== null) {
        /* A row that supplies no photograph gets a different one per
           department rather than the same default repeated. Two cards side by
           side showing the same room is the thing a prospect notices first. */
        out.departments = departments.map((d, i) => ({
            id: str(d.id, 60) ?? "",
            name: str(d.name, 120) ?? "",
            summary: str(d.summary, 400) ?? "",
            image: str(d.image, 300) ?? (DEPT_IMAGES[i % DEPT_IMAGES.length] ?? DEPT_IMAGES[0]),
            imageAlt: str(d.imageAlt, 300) ?? "A treatment room at this practice",
            services: strings(d.services, 20),
        }));
        if ((out.departments as { id: string }[]).some((d) => d.id === "" || !IDENTIFIER_LOOSE.test(d.id))) {
            return "Each department needs an id of lowercase letters, digits and hyphens.";
        }
    }

    const appointmentTypes = readArray(v.appointmentTypes, "content.appointmentTypes", 60);
    if (typeof appointmentTypes === "string") return appointmentTypes;
    if (appointmentTypes !== null) {
        out.appointmentTypes = appointmentTypes.map((a) => ({
            id: str(a.id, 60) ?? "",
            name: str(a.name, 140) ?? "",
            department: str(a.department, 60) ?? "",
            minutes: Math.max(5, Math.min(480, Number(a.minutes) || 20)),
            /* Zero is meaningful — it renders "No charge" — so it is kept,
               and only a negative or non-numeric price is corrected. */
            price: Math.max(0, Number(a.price) || 0),
            ...(str(a.note, 200) === undefined ? {} : { note: str(a.note, 200) }),
        }));
    }

    const treatments = readArray(v.treatments, "content.treatments", 60);
    if (typeof treatments === "string") return treatments;
    if (treatments !== null) {
        out.treatments = treatments.map((t) => ({
            slug: str(t.slug, 60) ?? "",
            name: str(t.name, 140) ?? "",
            icon: CATALOGUE_ICONS.includes(t.icon as never) ? t.icon : "clipboard",
            department: str(t.department, 60) ?? "",
            summary: str(t.summary, 400) ?? "",
        }));
    }

    const additional = readArray(v.additionalServices, "content.additionalServices", 40);
    if (typeof additional === "string") return additional;
    if (additional !== null) {
        out.additionalServices = additional.map((a) => ({
            slug: str(a.slug, 60) ?? "",
            name: str(a.name, 140) ?? "",
            icon: CATALOGUE_ICONS.includes(a.icon as never) ? a.icon : "clipboard",
            summary: str(a.summary, 400) ?? "",
            bookable: a.bookable !== false,
        }));
    }

    return Object.keys(out).length === 0 ? null : out;
}

/** Extra pages, each rendered at its own path. */
function readPages(value: unknown): readonly Record<string, unknown>[] | string | null {
    const pages = readArray(value, "pages", 30);
    if (typeof pages === "string" || pages === null) return pages;

    const seen = new Set<string>();
    const out: Record<string, unknown>[] = [];
    for (const page of pages) {
        const slug = (str(page.slug, 60) ?? "").toLowerCase();
        if (!SLUG_PATTERN.test(slug)) {
            return `"${slug}" is not a valid page slug: lowercase letters, digits and hyphens.`;
        }
        if (RESERVED_SLUGS.has(slug)) {
            return `"${slug}" is a page this site already has, so a custom page there would never be reached.`;
        }
        if (seen.has(slug)) return `"${slug}" appears twice in pages.`;
        seen.add(slug);

        const blocks = readArray(page.blocks, `pages.${slug}.blocks`, 40);
        if (typeof blocks === "string") return blocks;

        const cta = page.cta;
        const ctaLabel = typeof cta === "object" && cta !== null ? str((cta as Record<string, unknown>).label, 60) : undefined;
        const ctaHref = typeof cta === "object" && cta !== null ? str((cta as Record<string, unknown>).href, 200) : undefined;
        /* Relative links only. An absolute URL here would let the registry
           put an off-site link, styled as this clinic's own button, on a page
           that carries their name. */
        if (ctaHref !== undefined && !ctaHref.startsWith("/")) {
            return "A page's cta.href must be a path on this site, beginning with /.";
        }

        out.push({
            slug,
            title: str(page.title, 160) ?? slug,
            ...(str(page.kicker, 60) === undefined ? {} : { kicker: str(page.kicker, 60) }),
            ...(str(page.lede, 300) === undefined ? {} : { lede: str(page.lede, 300) }),
            blocks: (blocks ?? []).map((block) => ({
                ...(str(block.heading, 160) === undefined ? {} : { heading: str(block.heading, 160) }),
                body: strings(block.body, 30),
                bullets: strings(block.bullets, 40),
            })),
            ...(ctaLabel === undefined || ctaHref === undefined
                ? {}
                : { cta: { label: ctaLabel, href: ctaHref } }),
        });
    }
    return out;
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
                url: `https://${s.identifier}.shielva.ai`,
                iconPrefix: iconPrefix(s.identifier),
            })),
        },
        { headers: { "Cache-Control": "no-store" } },
    );
}

/** One site's outcome: what to return, and the status it would have had alone. */
interface SiteResult {
    readonly status: number;
    readonly body: Record<string, unknown>;
}

function fail(status: number, error: string): SiteResult {
    return { status, body: { error } };
}

/**
 * Validate and upsert a single site payload.
 *
 * Lifted out of POST unchanged so the single and batched forms cannot drift:
 * a rule enforced for one caller and not the other is how a malformed row
 * reaches a page carrying a real clinic's name.
 */
async function applySite(b: Record<string, unknown>): Promise<SiteResult> {
    const identifier = (str(b.identifier, 40) ?? "").toLowerCase();
    if (!IDENTIFIER.test(identifier)) {
        return fail(422, "identifier must be 3-40 chars, a-z 0-9 and hyphens, and is used as a subdomain.");
    }
    if (RESERVED.has(identifier)) {
        return fail(422, `"${identifier}" is a reserved hostname and cannot be used as a site identifier.`);
    }
    const kind = str(b.kind, 40);
    if (kind !== undefined && !PRACTICE_KINDS.includes(kind as never)) {
        return fail(422, `kind must be one of: ${PRACTICE_KINDS.join(", ")}`);
    }

    const businessName = str(b.businessName, 160);
    if (businessName === undefined) {
        return fail(422, "businessName is required.");
    }

    /* Assembled by assignment rather than conditional spread: under
       exactOptionalPropertyTypes a spread still widens each field to
       `string | undefined`, and the point of the flag is that an absent field
       and a field set to undefined are different things in the stored row. */
    const record: Record<string, unknown> = { identifier, businessName };
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

    /* Content, pages and the claim flags. Validated rather than trusted: this
       API decides what a page carrying a real clinic's name says, so a
       malformed department list should be a 422 here and not a broken render
       in front of a prospect. */
    const content = readContent(b.content);
    if (typeof content === "string") {
        return fail(422, content);
    }
    if (content !== null) record.content = content as never;

    const pages = readPages(b.pages);
    if (typeof pages === "string") {
        return fail(422, pages);
    }
    if (pages !== null) record.pages = pages as never;

    for (const flag of ["hasEmergency", "hasDepartments", "hasHealthLibrary"] as const) {
        if (typeof b[flag] === "boolean") record[flag] = b[flag] as never;
    }

    const ok = await upsertSite(record as unknown as SiteRecord);
    if (!ok) {
        return fail(503, "No site registry is configured (MONGODB_URL is unset).");
    }

    return {
        status: 200,
        body: {
            ok: true,
            identifier,
            url: `https://${identifier}.shielva.ai`,
            iconPrefix: iconPrefix(identifier),
        },
    };
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

    await ensureIndexes();
    const b = body as Record<string, unknown>;

    /* Single site: the original shape, unchanged. Every existing caller posts
       this and must keep getting the same body and status back. */
    if (!Array.isArray(b.sites)) {
        const result = await applySite(b);
        return NextResponse.json(result.body, { status: result.status });
    }

    const sites = b.sites;
    if (sites.length === 0) {
        return NextResponse.json({ error: "sites was empty." }, { status: 422 });
    }
    if (sites.length > MAX_BATCH) {
        return NextResponse.json(
            { error: `A batch carries at most ${MAX_BATCH} sites; got ${sites.length}.` },
            { status: 422 },
        );
    }

    /* Sequential rather than Promise.all: these all write to one registry, so
       parallelism buys nothing here and makes a partial failure harder to
       reason about. */
    const results: Record<string, unknown>[] = [];
    let created = 0;
    for (const [index, site] of sites.entries()) {
        if (typeof site !== "object" || site === null) {
            results.push({ index, ok: false, error: "Not an object." });
            continue;
        }
        const result = await applySite(site as Record<string, unknown>);
        if (result.body.ok === true) {
            created += 1;
            results.push({ index, ...result.body });
        } else {
            results.push({ index, ok: false, status: result.status, ...result.body });
        }
    }

    /* 207 when some rows were rejected: a flat 200 would have the caller
       record a failed row as a live site. */
    return NextResponse.json(
        { ok: created === sites.length, created, failed: sites.length - created, results },
        { status: created === sites.length ? 200 : 207 },
    );
}

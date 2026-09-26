import "server-only";
import { brandFromRecord, identifierFromHost } from "@/app/features/clinic/brands";
import type { Brand } from "@/app/features/clinic/brands";
import { profileFor } from "@/app/features/clinic/practice-kinds";
import type { ContentOverrides } from "@/app/features/clinic/content";
import type { Locale } from "./locale";
import type { CustomPage } from "@/app/features/clinic/pages";
import type { KindProfile } from "@/app/features/clinic/practice-kinds";
import { siteByIdentifier } from "./site-store";
import type { SiteRecord } from "./site-store";

/**
 * Everything one request needs to know about which client's site this is.
 *
 * The single entry point: a page resolves this once from the Host header and
 * passes it down. Adding a client is an insert into the registry — no build,
 * no deploy, no DNS beyond the wildcard.
 */
export interface Site {
    readonly identifier: string;
    readonly brand: Brand;
    /** Null when no row exists: the site still renders on derived defaults. */
    readonly record: SiteRecord | null;
    /** The template to render, from the record or the default running order. */
    readonly template: string | null;
    /** Absolute icon URL on the CDN, when the client has a custom one. */
    readonly iconUrl: string | null;
    /** What this practice actually is, and therefore what the site may claim. */
    readonly profile: KindProfile;
    /** This clinic's own content in the default language, where supplied. */
    readonly overrides: ContentOverrides | null;
    /**
     * The same content per language, for `overridesFor` to choose from.
     *
     * Resolution cannot happen here: this object is built once per host and
     * the language is a route param, so picking one now would bake the wrong
     * language into a cached render.
     */
    readonly overridesByLocale: Readonly<Partial<Record<Locale, ContentOverrides>>>;
    /** Extra pages this clinic has been given. */
    readonly pages: readonly CustomPage[];
}

/**
 * Public CDN base for client assets.
 *
 * Icons live at `website_builder/<identifier>/…` and must be fetchable by a
 * browser with no credentials — they are referenced from a public page, and a
 * favicon request never carries one.
 */
const CDN_BASE = (process.env.CDN_PUBLIC_BASE_URL ?? "https://cdn.shielva.ai").replace(/\/+$/, "");

export function cdnUrl(path: string): string {
    return `${CDN_BASE}/${path.replace(/^\/+/, "")}`;
}

/** Where a client's icons live, whether or not they have uploaded one yet. */
export function iconPrefix(identifier: string): string {
    return `website_builder/${identifier}`;
}

export async function siteFromHost(host: string | null | undefined): Promise<Site> {
    const identifier = identifierFromHost(host);
    const record = await siteByIdentifier(identifier);

    /* Decided once, then handed to everything that depends on it.
       Resolving it twice let the two answers drift: the profile special-cased
       the Northgate demo to a hospital while the brand fell back to a general
       practice, so the site offered an emergency department under a logo drawn
       for a GP surgery.

       No record means we do not know what this practice is, and the safe
       unknown is one without an emergency department — a site that wrongly
       offers A&E is far worse than one that wrongly omits it. */
    const base = profileFor(record?.kind ?? (identifier === "northgate" ? "hospital" : undefined));

    /* A row may contradict its own trade — a dental practice that really does
       run an out-of-hours emergency service, a clinic that wants its health
       library off. The trade is the default, not the ceiling. `hasEmergency`
       is the one worth reading twice: turning it on is a claim that somebody
       answers at three in the morning. */
    const profile: KindProfile = {
        ...base,
        hasEmergency: record?.hasEmergency ?? base.hasEmergency,
        hasDepartments: record?.hasDepartments ?? base.hasDepartments,
        hasHealthLibrary: record?.hasHealthLibrary ?? base.hasHealthLibrary,
        strapline: record?.strapline ?? base.strapline,
        /* The footer and the structured data read the profile's service list,
           so a clinic's own services have to land here rather than only in
           the content object. */
        services: record?.content?.services ?? base.services,
    };

    return {
        identifier,
        record,
        brand: brandFromRecord(identifier, record, profile.kind),
        template: record?.template ?? null,
        profile,
        overrides: record?.content ?? null,
        overridesByLocale: record?.contentByLocale ?? {},
        pages: record?.pages ?? [],
        iconUrl: record?.iconPath ? cdnUrl(record.iconPath) : null,
    };
}

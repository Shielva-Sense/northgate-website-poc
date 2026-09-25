import "server-only";
import { brandFromRecord, identifierFromHost } from "@/app/features/clinic/brands";
import type { Brand } from "@/app/features/clinic/brands";
import { profileFor } from "@/app/features/clinic/practice-kinds";
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

    return {
        identifier,
        record,
        brand: brandFromRecord(identifier, record),
        template: record?.template ?? null,
        /* No record means we do not know what this practice is, and the safe
           unknown is one without an emergency department — a site that wrongly
           offers A&E is far worse than one that wrongly omits it. The original
           Northgate demo is a hospital and keeps its A&E. */
        profile: profileFor(record?.kind ?? (identifier === "northgate" ? "hospital" : undefined)),
        iconUrl: record?.iconPath ? cdnUrl(record.iconPath) : null,
    };
}

import "server-only";
import { brandFromRecord, identifierFromHost } from "@/app/features/clinic/brands";
import type { Brand } from "@/app/features/clinic/brands";
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
        iconUrl: record?.iconPath ? cdnUrl(record.iconPath) : null,
    };
}

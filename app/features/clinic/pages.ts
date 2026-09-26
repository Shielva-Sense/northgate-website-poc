/**
 * Pages created from outside.
 *
 * The template has the pages a clinic usually needs. A given clinic needs one
 * it does not — a fees page, a new-patient guide, an insurers list — and the
 * whole point of the registry is that this should not require a build. So a
 * row may carry extra pages, each rendered at its own path by a catch-all
 * route.
 *
 * Deliberately a small shape. This is content, not a page builder: headings,
 * prose, lists and a call to action cover what a clinic actually asks for, and
 * anything richer would be markup arriving from a database, which is a far
 * larger decision than it looks.
 */

export interface PageBlock {
    readonly heading?: string;
    /** Paragraphs. Plain text — rendered as text, never as markup. */
    readonly body?: readonly string[];
    /** A bulleted list under the prose. */
    readonly bullets?: readonly string[];
}

export interface CustomPage {
    /** URL path segment. Lowercase, hyphens; never collides with a real route. */
    readonly slug: string;
    readonly title: string;
    readonly kicker?: string;
    /** One sentence under the title, and the meta description. */
    readonly lede?: string;
    readonly blocks: readonly PageBlock[];
    /** Optional call to action at the foot of the page. */
    readonly cta?: { readonly label: string; readonly href: string };
}

/**
 * Paths the template already owns.
 *
 * A custom page at one of these would be unreachable — the real route wins —
 * so the API refuses it rather than storing a page nobody can open.
 */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
    "services", "find-a-doctor", "health-library", "appointments", "contact",
    "urgent-care", "refer", "privacy", "templates", "login", "api",
    "icon", "apple-icon", "manifest.webmanifest", "robots.txt", "sitemap.xml",
]);

/** Slug rules: a path segment, not a path. */
export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

export function pageBySlug(
    pages: readonly CustomPage[] | undefined,
    slug: string,
): CustomPage | undefined {
    return (pages ?? []).find((page) => page.slug === slug);
}


/**
 * Which language a page is being served in.
 *
 * The farm already resolves the tenant from the `host` header rather than from
 * the path, so locale follows the same shape: middleware rewrites `/ar/...` to
 * `/...` and states the locale in a header. Every route keeps its own address —
 * `/services` stays `/services` — and nothing had to move into an `[locale]`
 * segment, which would have meant relocating sixteen route folders and
 * rewriting every internal link in the site.
 *
 * The cost of that choice is that locale, like host, is request state: anything
 * cached with `"use cache"` has to take it as an argument so the cache key
 * includes it. Caching an Arabic render under an English key would serve the
 * wrong language to the next visitor, which is worse than not caching at all.
 */

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string | null | undefined): value is Locale {
    return value === "en" || value === "ar";
}

/**
 * Arabic is written right to left.
 *
 * Kept as a function of the locale rather than a flag passed around, so a new
 * RTL language (Hebrew, Urdu, Farsi) is one line here and not a hunt through
 * the components.
 */
export function isRtl(locale: Locale): boolean {
    return locale === "ar";
}

export function dirFor(locale: Locale): "ltr" | "rtl" {
    return isRtl(locale) ? "rtl" : "ltr";
}


/**
 * The same path under a different language.
 *
 * `/en/services` ↔ `/ar/services`. Both languages are named explicitly: this
 * returned the bare path for English when English lived at the root, and
 * since routes moved under `app/[locale]` that answer costs a redirect on
 * every switch back to English — correct, but a wasted round trip on a link
 * the visitor clicks precisely because they could not read the page.
 */
export function pathForLocale(pathname: string, locale: Locale): string {
    const bare = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
    return bare === "/" ? `/${locale}` : `/${locale}${bare}`;
}

/**
 * A clinic's own content in the language being read.
 *
 * Falls back to the default-language row rather than to nothing: a practice
 * that has supplied English copy and no Arabic should show its own English
 * on the Arabic page, not the generic trade content. Half their own words
 * beats none of them.
 */
export function overridesFor<T>(
    base: T | null,
    byLocale: Readonly<Partial<Record<Locale, T>>>,
    locale: Locale,
): T | null {
    return byLocale[locale] ?? base;
}

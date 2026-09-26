
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
 * `/services` → `/ar/services`, and back again. English is the bare path
 * rather than `/en/...` so existing links, the sitemap and anything a prospect
 * has already been sent keep working untouched.
 */
export function pathForLocale(pathname: string, locale: Locale): string {
    const bare = pathname.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
    if (locale === DEFAULT_LOCALE) return bare;
    return bare === "/" ? "/ar" : `/ar${bare}`;
}

/**
 * This clinic's content in the language being served.
 *
 * Falls back to the default-language content rather than to nothing: a
 * practice that has translated its departments but not its treatments should
 * get Arabic departments and English treatments, not an empty page. Half
 * translated is a visible, fixable state; empty is neither.
 */
export function overridesFor<T>(
    base: T | null,
    byLocale: Readonly<Partial<Record<Locale, T>>>,
    locale: Locale,
): T | null {
    return byLocale[locale] ?? base;
}

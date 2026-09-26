"use client";

import { createContext, useContext, useMemo } from "react";
import { DEFAULT_LOCALE } from "@/app/core/locale";
import type { Locale } from "@/app/core/locale";
import { stringsFor } from "@/app/core/strings";
import type { UiKey } from "@/app/core/strings";

/**
 * The language, for the parts of the tree that are client components.
 *
 * Server components take the locale from the route param, but the header, the
 * booking panel and the footer are all client components several levels down,
 * and threading a prop through every one of them is a prop that will
 * eventually be forgotten on one of them. The path already states the
 * language, so it is read from there — the same source `LocaleLink` uses, so
 * the two can never disagree about which language the page is in.
 */

interface LocaleApi {
    readonly locale: Locale;
    readonly t: (key: UiKey) => string;
}

const LocaleCtx = createContext<LocaleApi | null>(null);

/* The fallback for a component rendered with no provider above it — a test,
   a preview, a fragment. It reads the default language rather than the path:
   an earlier version derived the locale from `usePathname()`, which makes
   every consumer depend on request URL data, and Next refuses to prerender a
   client component that does so outside a Suspense boundary. The whole point
   of moving routes under `app/[locale]` was that the language is known
   statically, so reading it back off the URL at runtime was both redundant
   and the thing that broke the build. */
const FALLBACK: LocaleApi = {
    locale: DEFAULT_LOCALE,
    t: (key) => stringsFor(DEFAULT_LOCALE)[key],
};

export function useLocale(): LocaleApi {
    return useContext(LocaleCtx) ?? FALLBACK;
}

export function LocaleProvider({
    locale,
    children,
}: {
    readonly locale: Locale;
    readonly children: React.ReactNode;
}): React.JSX.Element {
    const value = useMemo<LocaleApi>(() => {
        const table = stringsFor(locale);
        return { locale, t: (key) => table[key] };
    }, [locale]);
    return <LocaleCtx.Provider value={value}>{children}</LocaleCtx.Provider>;
}

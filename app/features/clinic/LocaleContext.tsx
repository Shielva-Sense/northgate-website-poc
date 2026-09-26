"use client";

import { createContext, useContext, useMemo } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, isLocale } from "@/app/core/locale";
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

export function useLocale(): LocaleApi {
    const fromContext = useContext(LocaleCtx);
    /* Deliberately not throwing when there is no provider. Every route sits
       under one, but a component rendered in isolation — a test, a preview —
       should show English rather than crash the page. */
    const pathname = usePathname();
    const derived = useMemo<LocaleApi>(() => {
        const segment = /^\/(ar|en)(?=\/|$)/.exec(pathname)?.[1];
        const locale = isLocale(segment) ? segment : DEFAULT_LOCALE;
        const table = stringsFor(locale);
        return { locale, t: (key) => table[key] };
    }, [pathname]);
    return fromContext ?? derived;
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

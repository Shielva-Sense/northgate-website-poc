"use client";

import { createContext, useContext, useEffect } from "react";
import type { Brand } from "./brands";
import { paletteVarsFor, THEMES } from "./brands";

/**
 * The brand is resolved once on the server from the Host header and handed
 * down, rather than each component re-deriving it. A context rather than prop
 * drilling because almost every component needs the name or the phone number,
 * and threading it through six layers would be noise.
 */
const BrandCtx = createContext<Brand | null>(null);

export function BrandProvider({
    brand,
    children,
}: {
    readonly brand: Brand;
    readonly children: React.ReactNode;
}): React.JSX.Element {
    return (
        <BrandCtx.Provider value={brand}>
            <ThemeMemory />
            {children}
        </BrandCtx.Provider>
    );
}

const THEME_KEY = "northgate:theme";

/**
 * Re-applies a theme chosen on /templates to every other page.
 *
 * The picker alone was not enough: it writes the variables onto the document
 * it is mounted in, and a navigation throws that away. Every page already goes
 * through BrandProvider, so this is the one place that covers all of them.
 *
 * Deliberately after paint rather than in a blocking inline script — this is a
 * demo affordance for a prospect clicking through colours, not a user theme
 * preference, so a one-frame flash of the tenant's real palette is the correct
 * trade against blocking first paint on every page for every visitor.
 */
function ThemeMemory(): null {
    useEffect(() => {
        let stored: string | null = null;
        try {
            stored = window.localStorage.getItem(THEME_KEY);
        } catch {
            return;
        }
        if (stored === null) return;
        const theme = THEMES.find((t) => t.id === stored);
        if (theme === undefined) return;
        const root = document.documentElement;
        for (const [name, value] of Object.entries(paletteVarsFor(theme.palette))) {
            root.style.setProperty(name, value);
        }
    }, []);
    return null;
}

export function useBrand(): Brand {
    const brand = useContext(BrandCtx);
    // Throwing beats a silent default: a missing provider would otherwise ship
    // the wrong clinic's name to a prospect, which is the one failure that
    // matters here.
    if (brand === null) {
        throw new Error("useBrand must be used inside <BrandProvider>");
    }
    return brand;
}

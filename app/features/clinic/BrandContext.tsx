"use client";

import { createContext, useContext, useEffect } from "react";
import type { Brand } from "./brands";
import type { ClinicContent } from "./content";
import type { KindProfile } from "./practice-kinds";
import { applyTheme, readStoredTheme } from "./theme";

/**
 * The brand is resolved once on the server from the Host header and handed
 * down, rather than each component re-deriving it. A context rather than prop
 * drilling because almost every component needs the name or the phone number,
 * and threading it through six layers would be noise.
 */
const BrandCtx = createContext<Brand | null>(null);

/**
 * What this practice is and what it offers.
 *
 * Alongside the brand rather than inside it: the brand is who they are — name,
 * colours, phone number — and this is what they do. A dozen client components
 * need the department list or the price of an appointment, and every one of
 * them used to import a module constant holding one general practice's, which
 * is how a dental site came to advertise travel vaccinations.
 */
const ContentCtx = createContext<{
    readonly profile: KindProfile;
    readonly content: ClinicContent;
} | null>(null);

export function BrandProvider({
    brand,
    profile,
    content,
    children,
}: {
    readonly brand: Brand;
    readonly profile: KindProfile;
    readonly content: ClinicContent;
    readonly children: React.ReactNode;
}): React.JSX.Element {
    return (
        <BrandCtx.Provider value={brand}>
            {/* Not memoised on a literal: both halves are resolved once on the
                server per host and are referentially stable for the life of
                the tree, so there is nothing here to re-render on. */}
            <ContentCtx.Provider value={{ profile, content }}>
                <ThemeMemory />
                {children}
            </ContentCtx.Provider>
        </BrandCtx.Provider>
    );
}

/**
 * Re-applies a theme chosen anywhere to every other page.
 *
 * A picker writes the variables onto the document it is mounted in, and a
 * navigation throws that away. Every page goes through BrandProvider, so this
 * is the one place that covers all of them.
 *
 * Deliberately after paint rather than in a blocking inline script — this is a
 * demo affordance for a prospect clicking through colours, not a user theme
 * preference, so a one-frame flash of the tenant's real palette is the correct
 * trade against blocking first paint for every visitor.
 */
function ThemeMemory(): null {
    useEffect(() => {
        const stored = readStoredTheme();
        if (stored !== null) applyTheme(stored, false);
    }, []);
    return null;
}

/** What this practice is: its trade, and what that trade may claim. */
export function useProfile(): KindProfile {
    const value = useContext(ContentCtx);
    if (value === null) {
        throw new Error("useProfile must be used inside <BrandProvider>");
    }
    return value.profile;
}

/** This practice's departments, treatments and appointment types. */
export function useContent(): ClinicContent {
    const value = useContext(ContentCtx);
    if (value === null) {
        throw new Error("useContent must be used inside <BrandProvider>");
    }
    return value.content;
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

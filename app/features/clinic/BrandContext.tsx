"use client";

import { createContext, useContext } from "react";
import type { Brand } from "./brands";

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
    return <BrandCtx.Provider value={brand}>{children}</BrandCtx.Provider>;
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

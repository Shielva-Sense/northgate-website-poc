import type { Brand } from "./brands";

/**
 * The gateway mark as a standalone SVG string, for places that cannot use CSS
 * variables — the favicon and the touch icon are fetched outside the document,
 * so they have no access to the page's custom properties.
 *
 * Single source of geometry with the Logo component. `radius` is 0 for the
 * Apple icon, which iOS masks itself, and 15 everywhere else.
 */
/**
 * Six marks, chosen by the identifier's hash.
 *
 * One shape for every client made a hundred prospect sites look like a hundred
 * copies of the same template, which is exactly the impression these are
 * supposed to avoid. Shape and palette are both derived from the identifier,
 * so a client's icon is stable — the same address always draws the same mark —
 * but their neighbour's is different.
 *
 * All six are built from the same geometry and stroke weight, so the set reads
 * as one family rather than six clip-art choices.
 */
const MARKS: readonly ((a: string, b: string) => string)[] = [
    // Gateway arch with a care cross — the original.
    (a, b) =>
        `<path d="M19 48V31a13 13 0 0 1 26 0v17" fill="none" stroke="${a}" stroke-width="5.5" stroke-linecap="round"/>` +
        `<path d="M32 29v10M27 34h10" fill="none" stroke="${b}" stroke-width="4.5" stroke-linecap="round"/>`,
    // Shield.
    (a, b) =>
        `<path d="M32 16l14 5v13c0 9-6 15-14 18-8-3-14-9-14-18V21z" fill="none" stroke="${a}" stroke-width="5"/>` +
        `<path d="M32 28v11M26.5 33.5h11" fill="none" stroke="${b}" stroke-width="4.5" stroke-linecap="round"/>`,
    // Pulse line through a rounded square.
    (a, b) =>
        `<rect x="16" y="20" width="32" height="26" rx="6" fill="none" stroke="${a}" stroke-width="5"/>` +
        `<path d="M21 33h6l4-7 5 14 4-7h5" fill="none" stroke="${b}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`,
    // Open book / folded leaf.
    (a, b) =>
        `<path d="M32 22c-5-4-11-4-15-3v24c4-1 10-1 15 3 5-4 11-4 15-3V19c-4-1-10-1-15 3z" fill="none" stroke="${a}" stroke-width="5" stroke-linejoin="round"/>` +
        `<path d="M32 22v24" fill="none" stroke="${b}" stroke-width="4"/>`,
    // Two arcs, a hand over a shoulder.
    (a, b) =>
        `<path d="M18 44a14 14 0 0 1 28 0" fill="none" stroke="${a}" stroke-width="5.5" stroke-linecap="round"/>` +
        `<circle cx="32" cy="24" r="7" fill="none" stroke="${b}" stroke-width="4.5"/>`,
    // Cross in a ring.
    (a, b) =>
        `<circle cx="32" cy="32" r="15" fill="none" stroke="${a}" stroke-width="5"/>` +
        `<path d="M32 25v14M25 32h14" fill="none" stroke="${b}" stroke-width="4.5" stroke-linecap="round"/>`,
];

/** Same hash as the palette picker, so a mark is stable for an identifier. */
function markHash(value: string): number {
    let h = 0;
    for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) | 0;
    return Math.abs(h);
}

/**
 * The mark as a standalone SVG string, for places that cannot use CSS
 * variables — the favicon and the touch icon are fetched outside the document,
 * so they have no access to the page's custom properties.
 *
 * Single source of geometry with the Logo component. `radius` is 0 for the
 * Apple icon, which iOS masks itself, and 15 everywhere else.
 */
export function markSvg(brand: Brand, radius: number): string {
    const { brand900, brand500 } = brand.palette;
    const draw = MARKS[markHash(brand.slug) % MARKS.length] ?? MARKS[0];
    return [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
        `<rect width="64" height="64" rx="${radius}" fill="${brand900}"/>`,
        draw === undefined ? "" : draw("#ffffff", brand500),
        "</svg>",
    ].join("");
}

import type { Brand } from "./brands";

/**
 * The gateway mark as a standalone SVG string, for places that cannot use CSS
 * variables — the favicon and the touch icon are fetched outside the document,
 * so they have no access to the page's custom properties.
 *
 * Single source of geometry with the Logo component. `radius` is 0 for the
 * Apple icon, which iOS masks itself, and 15 everywhere else.
 */
export function markSvg(brand: Brand, radius: number): string {
    const { brand900, brand500 } = brand.palette;
    return [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
        `<rect width="64" height="64" rx="${radius}" fill="${brand900}"/>`,
        '<path d="M19 48V31a13 13 0 0 1 26 0v17" fill="none" stroke="#ffffff"',
        ' stroke-width="5.5" stroke-linecap="round"/>',
        `<path d="M32 29v10M27 34h10" fill="none" stroke="${brand500}"`,
        ' stroke-width="4.5" stroke-linecap="round"/>',
        "</svg>",
    ].join("");
}

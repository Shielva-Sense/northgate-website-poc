import type { Brand } from "./brands";
import type { PracticeKind } from "./practice-kinds";

/**
 * The mark, drawn from the trade and then from the identifier.
 *
 * Two things were wrong. The header drew one hardcoded gateway arch for every
 * client, so a hundred prospect sites opened with the same icon — the single
 * loudest tell that a site is a template. And the shapes the favicon did vary
 * over were all generic health marks, so a dental practice could be given a
 * shield and an optometrist a book.
 *
 * So the kind picks the candidates and the identifier picks between them. A
 * dentist gets a tooth, a vet gets a paw, an optometrist gets an eye — and two
 * dentists still differ, because the hash chooses within the pair and the
 * palette is derived separately. A mark is stable: the same address always
 * draws the same icon.
 *
 * All of them are strokes on the same 64 grid at the same weight, so the set
 * reads as one family rather than nineteen clip-art choices, and all of them
 * stay legible at 16px — the size that decides whether a mark works.
 *
 * Geometry is *data*, not markup. Two callers draw it: the Logo component
 * renders real elements, and `markSvg` serialises a string for the favicon,
 * which is fetched outside the document and so cannot see a CSS variable.
 * Keeping it as data means neither has to parse the other's output, and the
 * component never has to reach for dangerouslySetInnerHTML.
 */

export const MARK_IDS = [
    "gateway",
    "care",
    "pulse",
    "hospital",
    "ring",
    "tooth",
    "toothShine",
    "spine",
    "stretch",
    "eye",
    "eyeRing",
    "mind",
    "leaf",
    "foot",
    "footArch",
    "paw",
    "pawCare",
    "derm",
    "drop",
] as const;

export type MarkId = (typeof MARK_IDS)[number];

/** Which of the two stroke colours a shape uses. */
export type Ink = "on" | "accent";

export type MarkShape =
    | {
          readonly s: "path";
          readonly d: string;
          readonly ink: Ink;
          readonly w: number;
          readonly cap?: true;
          readonly join?: true;
      }
    | {
          readonly s: "circle";
          readonly cx: number;
          readonly cy: number;
          readonly r: number;
          readonly ink: Ink;
          readonly w: number;
      };

const GEOMETRY: Readonly<Record<MarkId, readonly MarkShape[]>> = {
    /* ── general practice ─────────────────────── */
    // A gateway arch with a care cross held in its opening.
    gateway: [
        { s: "path", d: "M19 48V31a13 13 0 0 1 26 0v17", ink: "on", w: 5.5, cap: true },
        { s: "path", d: "M32 29v10M27 34h10", ink: "accent", w: 4.5, cap: true },
    ],
    // Two arcs — a hand over a shoulder.
    care: [
        { s: "path", d: "M18 44a14 14 0 0 1 28 0", ink: "on", w: 5.5, cap: true },
        { s: "circle", cx: 32, cy: 24, r: 7, ink: "accent", w: 4.5 },
    ],
    // A pulse line through a rounded square.
    pulse: [
        { s: "path", d: "M22 20h20a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6V26a6 6 0 0 1 6-6z", ink: "on", w: 5, join: true },
        { s: "path", d: "M21 33h6l4-7 5 14 4-7h5", ink: "accent", w: 4.5, cap: true, join: true },
    ],

    /* ── hospital ─────────────────────────────── */
    // A building under a pitched roof, with the cross on the front.
    hospital: [
        { s: "path", d: "M18 47V27l14-9 14 9v20", ink: "on", w: 5, join: true },
        { s: "path", d: "M32 30v12M26 36h12", ink: "accent", w: 4.5, cap: true },
    ],
    // A cross in a ring.
    ring: [
        { s: "circle", cx: 32, cy: 32, r: 15, ink: "on", w: 5 },
        { s: "path", d: "M32 25v14M25 32h14", ink: "accent", w: 4.5, cap: true },
    ],

    /* ── dental ───────────────────────────────── */
    // A molar: two crowns over two roots.
    tooth: [
        {
            s: "path",
            d: "M20 28c0-7 5-11 12-11s12 4 12 11c0 7-2 10-3.6 15-1 3.4-2 5.5-3.4 5.5-2 0-2-6-2.6-8.6-.4-2-1.3-3-2.4-3s-2 1-2.4 3C29 42.5 29 48.5 27 48.5c-1.4 0-2.4-2.1-3.4-5.5C22 38 20 35 20 28z",
            ink: "on",
            w: 5,
            join: true,
        },
    ],
    // The same tooth with a highlight, for the second dental practice along.
    toothShine: [
        {
            s: "path",
            d: "M20 28c0-7 5-11 12-11s12 4 12 11c0 7-2 10-3.6 15-1 3.4-2 5.5-3.4 5.5-2 0-2-6-2.6-8.6-.4-2-1.3-3-2.4-3s-2 1-2.4 3C29 42.5 29 48.5 27 48.5c-1.4 0-2.4-2.1-3.4-5.5C22 38 20 35 20 28z",
            ink: "on",
            w: 5,
            join: true,
        },
        { s: "path", d: "M26 26c1-3 3-4 5-4", ink: "accent", w: 4, cap: true },
    ],

    /* ── physiotherapy and chiropractic ───────── */
    // A spine: the column and its vertebrae.
    spine: [
        { s: "path", d: "M32 16v32", ink: "on", w: 5, cap: true },
        { s: "path", d: "M26 23h12M24 31h16M26 39h12", ink: "accent", w: 4.5, cap: true },
    ],
    // A figure mid-stretch: a joint opening between two limbs.
    stretch: [
        { s: "path", d: "M20 46l8-13 9 5 7-13", ink: "on", w: 5, cap: true, join: true },
        { s: "circle", cx: 44, cy: 20, r: 5, ink: "accent", w: 4.5 },
    ],

    /* ── optometry ────────────────────────────── */
    eye: [
        { s: "path", d: "M16 32c5-8 10-12 16-12s11 4 16 12c-5 8-10 12-16 12s-11-4-16-12z", ink: "on", w: 5, join: true },
        { s: "circle", cx: 32, cy: 32, r: 5, ink: "accent", w: 4.5 },
    ],
    eyeRing: [
        { s: "circle", cx: 32, cy: 32, r: 15, ink: "on", w: 5 },
        { s: "path", d: "M22 32c4-5 6-7 10-7s6 2 10 7c-4 5-6 7-10 7s-6-2-10-7z", ink: "accent", w: 4.5, join: true },
    ],

    /* ── mental health ────────────────────────── */
    // A head in profile with something growing inside it.
    mind: [
        { s: "path", d: "M44 47V38a14 14 0 1 0-12 6h4v3", ink: "on", w: 5, cap: true, join: true },
        { s: "path", d: "M28 34c0-6 5-10 10-10 0 6-4 10-10 10z", ink: "accent", w: 4.5, join: true },
    ],
    leaf: [
        { s: "path", d: "M20 44c0-13 10-23 24-24 1 14-9 24-24 24z", ink: "on", w: 5, join: true },
        { s: "path", d: "M22 46L38 30", ink: "accent", w: 4.5, cap: true },
    ],

    /* ── podiatry ─────────────────────────────── */
    foot: [
        { s: "path", d: "M25 48c-4 0-7-4-7-10 0-9 4-18 11-18 5 0 8 5 8 12 0 6-2 9-2 12 0 4-4 4-10 4z", ink: "on", w: 5, join: true },
        { s: "circle", cx: 43, cy: 24, r: 4, ink: "accent", w: 4 },
    ],
    footArch: [
        { s: "path", d: "M20 44c6 0 8-4 12-9s6-9 12-9", ink: "on", w: 5.5, cap: true },
        { s: "path", d: "M20 30h6M38 44h6", ink: "accent", w: 4.5, cap: true },
    ],

    /* ── veterinary ───────────────────────────── */
    paw: [
        { s: "path", d: "M32 33c-6 0-11 4-11 9 0 4 5 5 11 5s11-1 11-5c0-5-5-9-11-9z", ink: "on", w: 5, join: true },
        { s: "circle", cx: 22, cy: 27, r: 4, ink: "accent", w: 4 },
        { s: "circle", cx: 32, cy: 22, r: 4, ink: "accent", w: 4 },
        { s: "circle", cx: 42, cy: 27, r: 4, ink: "accent", w: 4 },
    ],
    pawCare: [
        { s: "circle", cx: 32, cy: 32, r: 15, ink: "on", w: 5 },
        { s: "path", d: "M32 33c-4 0-7 2-7 5 0 2 3 3 7 3s7-1 7-3c0-3-3-5-7-5z", ink: "accent", w: 4, join: true },
        { s: "circle", cx: 26, cy: 27, r: 2.6, ink: "accent", w: 3.4 },
        { s: "circle", cx: 38, cy: 27, r: 2.6, ink: "accent", w: 3.4 },
    ],

    /* ── dermatology ──────────────────────────── */
    // A lens over a mark on the skin — what the appointment is actually for.
    derm: [
        { s: "circle", cx: 29, cy: 29, r: 12, ink: "on", w: 5 },
        { s: "path", d: "M38 38l8 8", ink: "on", w: 5, cap: true },
        { s: "circle", cx: 29, cy: 29, r: 4, ink: "accent", w: 4.5 },
    ],
    drop: [
        { s: "path", d: "M32 17c7 9 11 14 11 20a11 11 0 0 1-22 0c0-6 4-11 11-20z", ink: "on", w: 5, join: true },
        { s: "path", d: "M27 37a5 5 0 0 0 5 5", ink: "accent", w: 4.5, cap: true },
    ],
};

/**
 * The marks that suit each trade.
 *
 * Two apiece at least, so neighbouring practices of the same kind still
 * differ. A kind is never given a mark that would claim the wrong speciality.
 */
const BY_KIND: Readonly<Record<PracticeKind, readonly MarkId[]>> = {
    hospital: ["hospital", "ring", "pulse"],
    "general-practice": ["gateway", "care", "pulse"],
    dental: ["tooth", "toothShine"],
    physio: ["stretch", "spine"],
    chiro: ["spine", "stretch"],
    dermatology: ["derm", "drop"],
    optometry: ["eye", "eyeRing"],
    "mental-health": ["mind", "leaf"],
    podiatry: ["foot", "footArch"],
    veterinary: ["paw", "pawCare"],
};

const FALLBACK: readonly MarkId[] = ["gateway", "care", "pulse"];

/** Same hash as the palette picker, so a mark is stable for an identifier. */
function markHash(value: string): number {
    let h = 0;
    for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) | 0;
    return Math.abs(h);
}

/** Which mark this practice draws. Stable for a given identifier and kind. */
export function markFor(kind: PracticeKind, slug: string): MarkId {
    const candidates = BY_KIND[kind] ?? FALLBACK;
    /* Offset by one so the mark does not move in lockstep with the palette —
       two practices of the same kind whose hashes are adjacent would otherwise
       get the same shape and adjacent colours, which looks like one site. */
    const index = (markHash(slug) + 1) % candidates.length;
    return candidates[index] ?? "gateway";
}

/** The shapes of a mark, for a caller that can render them. */
export function markShapes(mark: MarkId): readonly MarkShape[] {
    return GEOMETRY[mark] ?? GEOMETRY.gateway;
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
    const ink = (which: Ink): string => (which === "on" ? "#ffffff" : brand500);

    const body = markShapes(brand.mark)
        .map((shape) => {
            const stroke = `fill="none" stroke="${ink(shape.ink)}" stroke-width="${shape.w}"`;
            if (shape.s === "circle") {
                return `<circle cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}" ${stroke}/>`;
            }
            const caps =
                (shape.cap === true ? ' stroke-linecap="round"' : "") +
                (shape.join === true ? ' stroke-linejoin="round"' : "");
            return `<path d="${shape.d}" ${stroke}${caps}/>`;
        })
        .join("");

    return [
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">',
        `<rect width="64" height="64" rx="${radius}" fill="${brand900}"/>`,
        body,
        "</svg>",
    ].join("");
}

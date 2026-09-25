import { packFor } from "./countries";
import { markFor } from "./mark";
import type { MarkId } from "./mark";
import { DEFAULT_KIND } from "./practice-kinds";
import type { PracticeKind } from "./practice-kinds";
/**
 * Per-prospect branding, resolved from the hostname.
 *
 * `smile-care.poc.shielva.ai` renders as "Smile Care" in its own colours. The
 * point is that sending a prospect a demo with *their* name on it converts far
 * better than asking them to imagine it — and that adding one costs a DNS
 * record, not a deploy.
 *
 * Unknown slugs still work: the name is derived from the slug and the palette
 * is picked deterministically, so every prospect gets something designed rather
 * than a fallback. The registry below is only for overrides worth hand-tuning.
 *
 * No React and no fetch in here — it is read from both server and client.
 */

export interface Palette {
    readonly brand900: string;
    readonly brand700: string;
    readonly brand600: string;
    readonly brand500: string;
    readonly brand100: string;
    readonly brand50: string;
    readonly accent: string;
    readonly accent700: string;
}

/**
 * Which professional bodies this market actually has. Left null, the site says
 * "Registered clinician" instead of inventing a regulator — showing a UK CQC
 * rating to a clinic in Cairo is a fabricated credential, not a placeholder.
 */
export interface Regulators {
    readonly doctor: string;
    readonly nurse: string;
    readonly inspectorate: string;
    readonly inspectorateNote: string;
    readonly retentionAuthority: string;
}

export interface Brand {
    readonly slug: string;
    readonly name: string;
    readonly short: string;
    readonly kicker: string;
    readonly monogram: string;
    readonly strapline: string;
    readonly phone: string;
    readonly phoneHref: string;
    /** Digits only, no plus or spaces — wa.me rejects anything else. */
    readonly whatsapp: string;
    readonly email: string;
    readonly address: string;
    readonly city: string;
    readonly country: string;
    readonly currency: string;
    /** The national ambulance service. A fallback, never the headline: someone
        who navigated to this hospital's own site came for this hospital. */
    readonly emergencyNumber: string;
    /** The hospital's own 24-hour A&E line — the number to lead with. */
    readonly aeLine: string;
    readonly aeLineHref: string;
    readonly rating: string;
    readonly ratingCount: string;
    readonly palette: Palette;
    readonly regulators: Regulators | null;
    /** Which logo mark this practice draws. Follows the trade, then the slug. */
    readonly mark: MarkId;
}

/* Curated, healthcare-appropriate palettes. Picked deterministically from the
   slug so a given prospect always sees the same one, and so none of them can
   come out garish. */
/** Named because the registry references it directly. */
const TEAL: Palette = {
    brand900: "#0b3b3c", brand700: "#125e5e", brand600: "#17787a", brand500: "#1d8f91",
    brand100: "#d9eded", brand50: "#f1f8f8", accent: "#e07a3f", accent700: "#b4491c",
};

/* Named, because a clinic choosing its colours needs to point at one. The
   order is also the fallback order for an unknown host. */
export interface Theme {
    readonly id: string;
    readonly name: string;
    /** What it suits — a chooser without this is just swatches. */
    readonly note: string;
    readonly palette: Palette;
}

export const THEMES: readonly Theme[] = [
    { id: "teal", name: "Clinical teal", note: "The default. Calm, reads as medical without being cold.", palette: TEAL },
    {
        id: "navy", name: "Trust navy", note: "Institutional and established — hospitals and larger groups.",
        palette: {
            brand900: "#10243f", brand700: "#1b3f6b", brand600: "#245287",
            brand500: "#2f66a5", brand100: "#dbe6f3", brand50: "#f2f6fb",
            accent: "#d98324", accent700: "#a8570f",
        },
    },
    {
        id: "forest", name: "Forest green", note: "Warmer and more natural — wellbeing and family practice.",
        palette: {
            brand900: "#1b3324", brand700: "#2c5540", brand600: "#3a6f53", brand500: "#478967",
            brand100: "#dcebe2", brand50: "#f2f8f4", accent: "#c9762f", accent700: "#9c4f14",
        },
    },
    {
        id: "plum", name: "Quiet plum", note: "Distinctive without shouting — aesthetics and women's health.",
        palette: {
            brand900: "#2c1f3d", brand700: "#453160", brand600: "#5a417c", brand500: "#6f5296",
            brand100: "#e6dff0", brand50: "#f7f4fb", accent: "#c4643f", accent700: "#963f1d",
        },
    },
    {
        id: "slate", name: "Slate", note: "Understated and neutral — specialist and referral-led clinics.",
        palette: {
            brand900: "#27313a", brand700: "#3d4d5c", brand600: "#4f6478", brand500: "#617a91",
            brand100: "#e0e6ec", brand50: "#f4f7f9", accent: "#c2703c", accent700: "#944a18",
        },
    },
    {
        id: "clay", name: "Warm clay", note: "Soft and human — dentistry, physio and smaller practices.",
        palette: {
            brand900: "#3a2018", brand700: "#5c352a", brand600: "#77463a", brand500: "#8f594b",
            brand100: "#eee0db", brand50: "#faf5f3", accent: "#3f7f7a", accent700: "#1d5551",
        },
    },
    {
        id: "pine", name: "Deep pine", note: "Darker and more formal than teal, same clinical read.",
        palette: {
            brand900: "#122e2a", brand700: "#1d4a44", brand600: "#276059", brand500: "#31766d",
            brand100: "#d9ebe8", brand50: "#f1f8f7", accent: "#d1762f", accent700: "#a04d12",
        },
    },
    {
        id: "indigo", name: "Soft indigo", note: "Modern and calm — diagnostics and digital-first clinics.",
        palette: {
            brand900: "#1f2b45", brand700: "#33456c", brand600: "#435a8b", brand500: "#546ea6",
            brand100: "#dee4f0", brand50: "#f3f5fa", accent: "#cf7541", accent700: "#a04a1a",
        },
    },
];

export const PALETTES: readonly Palette[] = THEMES.map((t) => t.palette);

const UK: Regulators = {
    doctor: "GMC",
    nurse: "NMC",
    inspectorate: "CQC",
    inspectorateNote: "Rated Good, last inspection 2025",
    retentionAuthority: "the NHS Records Management Code of Practice",
};

/** Hand-tuned overrides. Everything else is derived. */
const REGISTRY: Readonly<Record<string, Partial<Brand>>> = {
    northgate: {
        palette: TEAL,
        name: "Northgate Family Health",
        short: "Northgate",
        kicker: "Family Health",
        city: "Manchester",
        country: "GB",
        address: "42 Northgate Street, Manchester, M3 2WY",
        regulators: UK,
        currency: "£",
        phone: "+44 20 7946 0958",
        aeLine: "+44 20 7946 0911",
        emergencyNumber: "999",
    },
};

/** Stable small hash, so a slug always lands on the same palette. */
function hash(value: string): number {
    let h = 0;
    for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) | 0;
    return Math.abs(h);
}

/** "smile-care" -> "Smile Care". Hyphens and underscores are word breaks. */
function titleCase(slug: string): string {
    return slug
        .split(/[-_]+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/**
 * The label before the first dot. `smile-care.poc.shielva.ai` -> `smile-care`.
 * A bare host, an IP or localhost has no meaningful prefix, so those fall back
 * to the default brand rather than rendering a clinic called "localhost".
 */
/**
 * The site identifier carried by the host.
 *
 * `<identifier>.shielva.ai` is the shape the site farm uses, so the label
 * after a leading "app." is the one that identifies the client. A plain
 * `<identifier>.shielva.ai` still works, which keeps every existing link alive.
 */
export function identifierFromHost(host: string | null | undefined): string {
    const first = slugFromHost(host);
    if (first !== "app") return first;
    const name = (host ?? "").split(":")[0]?.toLowerCase() ?? "";
    const parts = name.split(".");
    const second = parts[1] ?? "";
    return second.replace(/[^a-z0-9-_]/g, "").slice(0, 40) || DEFAULT_SLUG;
}

export function slugFromHost(host: string | null | undefined): string {
    if (!host) return DEFAULT_SLUG;
    const name = host.split(":")[0]?.toLowerCase() ?? "";
    if (name === "" || name === "localhost" || /^[\d.]+$/.test(name)) return DEFAULT_SLUG;

    const first = name.split(".")[0] ?? "";
    // "northgate-website-poc" is the deployed host; treat it as the default.
    if (first === "" || first === "www" || first === "northgate-website-poc") {
        return DEFAULT_SLUG;
    }
    return first.replace(/[^a-z0-9-_]/g, "").slice(0, 40) || DEFAULT_SLUG;
}

export const DEFAULT_SLUG = "northgate";

export function resolveBrand(
    host: string | null | undefined,
    kind: PracticeKind = DEFAULT_KIND,
): Brand {
    const slug = slugFromHost(host);
    const override = REGISTRY[slug] ?? {};
    const name = override.name ?? `${titleCase(slug)} Health`;
    const short = override.short ?? titleCase(slug);
    const palette = PALETTES[hash(slug) % PALETTES.length] ?? TEAL;

    /* Everything a country decides — the emergency number above all. Without
       this, a clinic in Texas told its patients to call 999. */
    const pack = packFor(override.country);
    const phone = override.phone ?? pack.samplePhone;
    const aeLine = override.aeLine ?? phone;

    return {
        slug,
        name,
        short,
        kicker: override.kicker ?? "Health",
        monogram: (override.monogram ?? short.charAt(0)).toUpperCase(),
        strapline: override.strapline ?? "See a named doctor this week, not in three",
        phone,
        phoneHref: `tel:${phone.replace(/[^+\d]/g, "")}`,
        whatsapp: override.whatsapp ?? phone.replace(/\D/g, ""),
        email: override.email ?? `reception@${slug}.example`,
        address: override.address ?? `1 High Street, ${override.city ?? pack.defaultCity}`,
        city: override.city ?? pack.defaultCity,
        country: override.country ?? pack.code,
        currency: override.currency ?? pack.currency,
        emergencyNumber: override.emergencyNumber ?? pack.emergencyNumber,
        // Falls back to the main switchboard rather than inventing a second
        // number: a wrong emergency line is worse than one that is merely busy.
        aeLine,
        aeLineHref: `tel:${aeLine.replace(/[^+\d]/g, "")}`,
        rating: override.rating ?? "4.9",
        ratingCount: override.ratingCount ?? "1,240",
        palette: override.palette ?? palette,
        // From the country pack, and null for a market we have not checked —
        // never invent a regulator.
        regulators: override.regulators ?? pack.regulators,
        // The trade picks the candidates, the slug picks between them. A
        // dental practice must not be handed a stethoscope.
        mark: markFor(kind, slug),
    };
}

/** The palette as CSS custom properties, for injection on the document root. */
export function paletteVars(brand: Brand): Record<string, string> {
    return paletteVarsFor(brand.palette);
}

/** The single owner of the hex -> CSS custom property mapping. */
export function paletteVarsFor(p: Palette): Record<string, string> {
    const rgb = (hex: string): string => {
        const v = hex.replace("#", "");
        return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16)).join(", ");
    };
    return {
        "--color-brand-900": p.brand900,
        "--color-brand-900-rgb": rgb(p.brand900),
        "--color-brand-700": p.brand700,
        "--color-brand-600": p.brand600,
        "--color-brand-600-rgb": rgb(p.brand600),
        "--color-brand-500": p.brand500,
        "--color-brand-100": p.brand100,
        "--color-brand-50": p.brand50,
        "--color-accent": p.accent,
        "--color-accent-rgb": rgb(p.accent),
        "--color-accent-700": p.accent700,
    };
}

/**
 * A brand built from a stored site record, falling back to what the identifier
 * alone can derive.
 *
 * The record only has to carry what differs from the default. A row with a
 * name and an address produces a complete, coherent site; every unset field
 * still resolves to something sensible rather than an empty string on a page a
 * prospect is looking at.
 */
export function brandFromRecord(
    identifier: string,
    record: SiteOverrides | null,
    /* Passed in rather than re-read from the record: the caller has already
       resolved it through profileFor(), which applies the fallbacks. Deriving
       it a second time here is how the mark and the profile came to disagree. */
    kind: PracticeKind = DEFAULT_KIND,
): Brand {
    const base = resolveBrand(identifier, kind);
    if (record === null) return base;

    const name = record.businessName ?? base.name;
    const short = record.short ?? name.split(" ")[0] ?? base.short;
    const theme = record.theme === undefined ? undefined : THEMES.find((t) => t.id === record.theme);
    const phone = record.phone ?? base.phone;
    const aeLine = record.aeLine ?? record.phone ?? base.aeLine;

    return {
        ...base,
        name,
        short,
        kicker: record.kicker ?? base.kicker,
        monogram: short.charAt(0).toUpperCase(),
        city: record.city ?? base.city,
        country: record.country ?? base.country,
        address: record.address ?? base.address,
        email: record.email ?? base.email,
        currency: record.currency ?? base.currency,
        emergencyNumber: record.emergencyNumber ?? base.emergencyNumber,
        phone,
        phoneHref: `tel:${phone.replace(/[^+\d]/g, "")}`,
        whatsapp: phone.replace(/\D/g, ""),
        aeLine,
        aeLineHref: `tel:${aeLine.replace(/[^+\d]/g, "")}`,
        palette: theme?.palette ?? base.palette,
    };
}

/** The subset of a site record that shapes the brand. */
export interface SiteOverrides {
    readonly businessName?: string;
    readonly short?: string;
    readonly kicker?: string;
    readonly country?: string;
    readonly city?: string;
    readonly address?: string;
    readonly phone?: string;
    readonly aeLine?: string;
    readonly emergencyNumber?: string;
    readonly email?: string;
    readonly currency?: string;
    readonly theme?: string;
    /** A PracticeKind. Decides the logo mark, and much else besides. */
    readonly kind?: string;
}

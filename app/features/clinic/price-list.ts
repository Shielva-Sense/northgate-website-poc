import type { Brand } from "./brands";
import type { KindProfile } from "./practice-kinds";

/**
 * The published price list a UK veterinary practice is ordered to display.
 *
 * The CMA's veterinary market investigation concluded in March 2026 and became
 * a legal Order in September 2026. First-opinion practices must publish a
 * standard price list for a defined set of services, on their website and in
 * the waiting room, with corporate ownership disclosed alongside it.
 *
 * ───────────────────────────────────────────────────────────────────────
 * READ THIS BEFORE A CLIENT PUBLISHES FROM IT
 *
 * The service list and the patient categories below are a WORKING DEFAULT,
 * not the statutory schedule. Public summaries of the Order disagree with one
 * another — some describe 36 individual services across 6 patient categories,
 * others 7 service groupings — and the Order's own schedule was not available
 * to check when this was written. The deadlines are reported variously as
 * December 2026 / March 2027 and as September 2027.
 *
 * So this renders whatever list it is given. `DEFAULT_SERVICES` exists so the
 * page is real rather than empty, and every practice is expected to replace it
 * with the schedule from the Order, as a registry row, with no deploy. The
 * page says as much to the visitor rather than claiming a compliance it has
 * not verified — a practice that published this believing it satisfied the
 * Order, and found it did not, would be worse off than one that published
 * nothing.
 * ───────────────────────────────────────────────────────────────────────
 */

/** One column of the table: the patient the price applies to. */
export interface PriceBand {
    readonly id: string;
    readonly label: string;
    /** Shown under the label, e.g. "10–25kg". Omitted where weight is moot. */
    readonly detail?: string;
}

/** One row: a named service, priced per band. */
export interface PriceRow {
    readonly id: string;
    readonly group: string;
    readonly service: string;
    /** A note the client needs to read the number correctly. */
    readonly note?: string;
    /**
     * Price per band id. A band with no entry renders "—", which reads as
     * "we do not offer this for that patient" — never as free, and never as a
     * number we invented to fill the grid.
     */
    readonly prices: Readonly<Record<string, number>>;
    /** The price is a starting point. See AppointmentType.estimate. */
    readonly estimate?: boolean;
}

export interface PriceList {
    readonly bands: readonly PriceBand[];
    readonly rows: readonly PriceRow[];
    /** Set true only once the list has been checked against the Order. */
    readonly verified?: boolean;
}

/**
 * Five dog weight bands and the cat.
 *
 * The dog boundaries are the ones consistently reported from the Order. The
 * sixth category is taken to be the cat, for which weight does not band.
 */
const DEFAULT_BANDS: readonly PriceBand[] = [
    { id: "cat", label: "Cat" },
    { id: "dog-s", label: "Small dog", detail: "under 10kg" },
    { id: "dog-m", label: "Medium dog", detail: "10–25kg" },
    { id: "dog-l", label: "Large dog", detail: "25–40kg" },
    { id: "dog-xl", label: "Extra-large dog", detail: "40–60kg" },
    { id: "dog-giant", label: "Giant dog", detail: "over 60kg" },
];

/**
 * A working list, built from the service groupings that every summary of the
 * Order agrees on: consultations, vaccination, neutering, dentistry,
 * diagnostics, prescriptions and cremation.
 *
 * The numbers are indicative and scale with the patient where the work does.
 * A consultation does not cost more for a great dane; an anaesthetic does.
 */
const DEFAULT_SERVICES: readonly PriceRow[] = [
    {
        id: "consult-standard",
        group: "Consultations",
        service: "Standard consultation",
        note: "Up to 15 minutes with a vet.",
        prices: { cat: 48, "dog-s": 48, "dog-m": 48, "dog-l": 48, "dog-xl": 48, "dog-giant": 48 },
    },
    {
        id: "consult-extended",
        group: "Consultations",
        service: "Extended consultation",
        note: "Up to 30 minutes.",
        prices: { cat: 72, "dog-s": 72, "dog-m": 72, "dog-l": 72, "dog-xl": 72, "dog-giant": 72 },
    },
    {
        id: "consult-ooh",
        group: "Consultations",
        service: "Out-of-hours consultation",
        prices: { cat: 165, "dog-s": 165, "dog-m": 165, "dog-l": 165, "dog-xl": 165, "dog-giant": 165 },
    },
    {
        id: "vacc-primary",
        group: "Vaccination",
        service: "Primary course",
        note: "Two injections, two to four weeks apart.",
        prices: { cat: 72, "dog-s": 78, "dog-m": 78, "dog-l": 78, "dog-xl": 78, "dog-giant": 78 },
    },
    {
        id: "vacc-booster",
        group: "Vaccination",
        service: "Annual booster",
        note: "Includes the health check.",
        prices: { cat: 52, "dog-s": 56, "dog-m": 56, "dog-l": 56, "dog-xl": 56, "dog-giant": 56 },
    },
    {
        id: "neuter-female",
        group: "Neutering",
        service: "Spay",
        prices: { cat: 145, "dog-s": 245, "dog-m": 295, "dog-l": 355, "dog-xl": 420, "dog-giant": 495 },
    },
    {
        id: "neuter-male",
        group: "Neutering",
        service: "Castration",
        prices: { cat: 95, "dog-s": 195, "dog-m": 235, "dog-l": 285, "dog-xl": 335, "dog-giant": 395 },
    },
    {
        id: "dental-scale",
        group: "Dentistry",
        service: "Scale and polish",
        note: "Under anaesthetic, with dental x-rays.",
        estimate: true,
        prices: { cat: 265, "dog-s": 295, "dog-m": 330, "dog-l": 375, "dog-xl": 425, "dog-giant": 485 },
    },
    {
        id: "dental-extraction",
        group: "Dentistry",
        service: "Extraction, per tooth",
        note: "Quoted once the x-rays are read, during the procedure.",
        estimate: true,
        prices: { cat: 35, "dog-s": 35, "dog-m": 42, "dog-l": 48, "dog-xl": 55, "dog-giant": 62 },
    },
    {
        id: "diag-bloods",
        group: "Diagnostics",
        service: "In-house blood profile",
        prices: { cat: 118, "dog-s": 118, "dog-m": 118, "dog-l": 118, "dog-xl": 118, "dog-giant": 118 },
    },
    {
        id: "diag-urine",
        group: "Diagnostics",
        service: "Urinalysis",
        prices: { cat: 42, "dog-s": 42, "dog-m": 42, "dog-l": 42, "dog-xl": 42, "dog-giant": 42 },
    },
    {
        id: "diag-xray",
        group: "Diagnostics",
        service: "Radiograph, first view",
        note: "Sedation charged separately where it is needed.",
        prices: { cat: 135, "dog-s": 145, "dog-m": 165, "dog-l": 185, "dog-xl": 205, "dog-giant": 235 },
    },
    {
        id: "script-first",
        group: "Prescriptions",
        service: "Written prescription, first item",
        note: "Capped by the Order.",
        prices: { cat: 21, "dog-s": 21, "dog-m": 21, "dog-l": 21, "dog-xl": 21, "dog-giant": 21 },
    },
    {
        id: "script-next",
        group: "Prescriptions",
        service: "Written prescription, each further item",
        note: "Capped by the Order.",
        prices: { cat: 12.5, "dog-s": 12.5, "dog-m": 12.5, "dog-l": 12.5, "dog-xl": 12.5, "dog-giant": 12.5 },
    },
    {
        id: "cremation-communal",
        group: "End of life",
        service: "Communal cremation",
        note: "No ashes returned.",
        prices: { cat: 85, "dog-s": 95, "dog-m": 125, "dog-l": 155, "dog-xl": 190, "dog-giant": 235 },
    },
    {
        id: "cremation-individual",
        group: "End of life",
        service: "Individual cremation",
        note: "Ashes returned to you.",
        prices: { cat: 175, "dog-s": 195, "dog-m": 235, "dog-l": 285, "dog-xl": 335, "dog-giant": 395 },
    },
];

/**
 * Whether this practice is one the Order applies to.
 *
 * First-opinion veterinary practices in the United Kingdom. A dentist does not
 * publish a weight-banded price list, and neither does a vet in Montana — the
 * table would be a fabricated obligation on both.
 */
export function ordersPriceList(profile: KindProfile, brand: Brand): boolean {
    return profile.kind === "veterinary" && brand.country === "GB";
}

export function priceListFor(override?: PriceList | null): PriceList {
    return override ?? { bands: DEFAULT_BANDS, rows: DEFAULT_SERVICES };
}

/** The rows grouped in the order they were given, for a sectioned table. */
export function groupRows(rows: readonly PriceRow[]): readonly (readonly [string, readonly PriceRow[]])[] {
    const order: string[] = [];
    const byGroup = new Map<string, PriceRow[]>();
    for (const row of rows) {
        const bucket = byGroup.get(row.group);
        if (bucket === undefined) {
            order.push(row.group);
            byGroup.set(row.group, [row]);
        } else {
            bucket.push(row);
        }
    }
    return order.map((group) => [group, byGroup.get(group) ?? []] as const);
}

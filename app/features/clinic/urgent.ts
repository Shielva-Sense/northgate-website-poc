/**
 * Urgent and emergency care.
 *
 * The rule this file exists to enforce: a booking form must never be the path
 * of least resistance for someone describing a heart attack. So the search here
 * is deliberately asymmetric — it matches red flags *first* and, when one hits,
 * it returns no bookable units at all. There is no combination of typed words
 * that produces both "call an ambulance" and "pick an arrival time".
 *
 * Everything below is walk-in: there are no slots, because an urgent list is a
 * queue, not a calendar. The patient tells us they are coming and roughly when;
 * the desk expects them. Presenting that as a booked time would be a lie the
 * first time the queue ran long.
 */

import { redFlagsFor } from "./care";
import type { Brand } from "./brands";
import type { SymptomOption } from "./care";

export type UnitKind = "emergency" | "urgent";

export interface UrgentUnit {
    readonly id: string;
    /** "emergency" is our own A&E: 24 hours, no appointment, never a queue
        position. Everything else is a walk-in list you can join. */
    readonly kind: UnitKind;
    readonly name: string;
    readonly summary: string;
    /** Printed on the card. Sending someone to the wrong door costs them an hour. */
    readonly notFor: string;
    readonly hours: string;
    /** Indicative only, and labelled as such wherever it is shown. */
    readonly wait: string;
    /** Words a patient would actually type — not clinical vocabulary. */
    readonly matches: readonly string[];
}

export const URGENT_UNITS: readonly UrgentUnit[] = [
    {
        id: "emergency-department",
        kind: "emergency",
        name: "Emergency department (A&E)",
        summary:
            "Our own emergency department, open every hour of every day. Serious injury, severe pain, breathing difficulty, chest pain, collapse, heavy bleeding. Come straight in — you do not need an appointment and you are never turned away.",
        notFor:
            "Nothing. If you are not sure whether it is serious enough, come anyway — that judgement is ours to make, not yours.",
        hours: "24 hours, every day",
        wait: "Seen immediately if life-threatening",
        matches: [
            "emergency",
            "a&e",
            "ae",
            "accident",
            "casualty",
            "er",
            "999",
            "ambulance",
            "serious",
            "severe",
            "collapse",
            "collapsed",
            "unconscious",
            "overdose",
            "poisoning",
            "head injury",
            "seizure",
            "fit",
        ],
    },
    {
        id: "urgent-care",
        kind: "urgent",
        name: "Urgent care — walk in",
        summary:
            "Fevers, suspected infections, urine infections, rashes, sickness and diarrhoea, anything that has got worse over a day or two.",
        notFor: "Chest pain, breathing difficulty or stroke symptoms — call the emergency number.",
        hours: "Every day, 08:00–20:00",
        wait: "About 25 minutes",
        matches: [
            "urgent",
            "emergency",
            "walk in",
            "walkin",
            "fever",
            "temperature",
            "infection",
            "uti",
            "urine",
            "rash",
            "sick",
            "vomiting",
            "diarrhoea",
            "flu",
            "sore throat",
            "ear",
            "ear ache",
            "earache",
            "eye",
        ],
    },
    {
        id: "minor-injuries",
        kind: "urgent",
        name: "Minor injuries",
        summary:
            "Cuts that may need closing, sprains, suspected simple fractures, burns and scalds, bites and stings. X-ray on site.",
        notFor: "Head injury with drowsiness or vomiting, or any heavy bleeding that will not stop.",
        hours: "Every day, 08:00–20:00",
        wait: "About 40 minutes",
        matches: [
            "injury",
            "injured",
            "cut",
            "wound",
            "stitches",
            "sprain",
            "twisted",
            "ankle",
            "wrist",
            "broken",
            "fracture",
            "burn",
            "scald",
            "bite",
            "sting",
            "fall",
            "fell",
            "xray",
            "x-ray",
        ],
    },
    {
        id: "same-day-gp",
        kind: "urgent",
        name: "Same-day GP",
        summary:
            "A doctor today for something that will not wait for a routine appointment — worsening pain, a symptom you want looked at now, medication that is not working.",
        notFor: "Routine reviews and repeat prescriptions, which are quicker to book normally.",
        hours: "Monday to Saturday, 08:00–18:00",
        wait: "Seen within 2 hours",
        matches: [
            "gp",
            "doctor",
            "today",
            "same day",
            "sameday",
            "pain",
            "worse",
            "worsening",
            "medication",
            "prescription",
            "abdominal",
            "stomach",
            "back",
            "headache",
        ],
    },
    {
        id: "child-urgent",
        kind: "urgent",
        name: "Urgent child health",
        summary:
            "A child who is unwell today — fever, rash, breathing that worries you, not feeding or not themselves. Children are seen ahead of the general queue.",
        notFor: "A baby under 3 months with a fever — that is an emergency, please call.",
        hours: "Every day, 08:00–20:00",
        wait: "Seen within 1 hour",
        matches: [
            "child",
            "children",
            "kid",
            "baby",
            "infant",
            "toddler",
            "son",
            "daughter",
            "paediatric",
            "pediatric",
            "nursery",
            "school",
        ],
    },
    {
        id: "mental-health-urgent",
        kind: "urgent",
        name: "Urgent mental health",
        summary:
            "Same-day assessment when things have become unmanageable — a crisis in mood, anxiety or sleep. Longer appointment, no rush at the door.",
        notFor: "Thoughts of harming yourself right now — please call, do not wait in a queue.",
        hours: "Monday to Saturday, 09:00–18:00",
        wait: "Seen within 3 hours",
        matches: [
            "mental",
            "mental health",
            "anxiety",
            "anxious",
            "panic",
            "depression",
            "low mood",
            "crisis",
            "stress",
            "sleep",
            "breakdown",
        ],
    },
];

export interface UrgentSearch {
    /** When set, the caller must show the emergency panel and nothing bookable. */
    readonly redFlag: SymptomOption | null;
    readonly units: readonly UrgentUnit[];
}

/**
 * Extra phrasings for the red flags. RED_FLAGS carries the wording we *show*;
 * this is the wording people *type*, which is shorter and blunter. Kept next to
 * the search rather than in care.ts because it is a matching concern.
 */
const RED_FLAG_TERMS: Readonly<Record<string, readonly string[]>> = {
    chest: ["chest", "heart", "heart attack", "cardiac", "chest pain", "tightness", "pressure"],
    breath: ["breath", "breathing", "cannot breathe", "can't breathe", "choking", "asthma attack"],
    stroke: ["stroke", "face", "drooping", "slurred", "weakness", "numb", "paralysis"],
    bleeding: ["bleeding", "blood", "haemorrhage", "hemorrhage", "will not stop"],
    baby: ["newborn", "under 3 months", "under three months"],
    harm: ["harm", "suicide", "suicidal", "kill myself", "end it", "self harm"],
    /* Veterinary. Owners type what they see, not the diagnosis: "belly is
       hard", "straining in the litter tray", "gums look grey". */
    "vet-breathing": ["breath", "breathing", "cannot breathe", "panting", "gums", "blue", "grey gums", "choking"],
    "vet-collapse": ["collapse", "collapsed", "cannot stand", "wont stand", "unconscious", "unresponsive", "floppy"],
    "vet-bloat": ["bloat", "bloated", "gdv", "hard tummy", "hard belly", "swollen tummy", "swollen belly", "retching", "twisted"],
    "vet-urine": ["straining", "cannot urinate", "cannot pee", "blocked", "litter tray", "no urine", "crying in the tray"],
    "vet-seizure": ["seizure", "fit", "fitting", "convulsion", "shaking", "twitching"],
    "vet-poison": ["poison", "poisoned", "ate", "eaten", "swallowed", "chocolate", "grape", "raisin", "xylitol", "antifreeze", "rat bait", "lily", "ibuprofen", "paracetamol"],
    "vet-bleeding": ["bleeding", "blood", "haemorrhage", "hemorrhage", "will not stop"],
};

function normalise(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Red flags are checked first and short-circuit. A query of "chest pain after a
 * fall" mentions an injury, and the injuries unit would match it — returning
 * both would let the patient pick the convenient one.
 */
export function searchUrgent(
    query: string,
    kind = "general-practice",
    /* The resolved list, so a row that overrides its urgent categories is
       searched rather than the trade default sitting behind it. */
    override?: readonly UrgentUnit[],
    flags?: readonly SymptomOption[],
): UrgentSearch {
    const q = normalise(query);
    const units = override ?? urgentUnitsFor(kind);
    if (q.length < 2) return { redFlag: null, units };

    for (const flag of flags ?? redFlagsFor(kind)) {
        const terms = RED_FLAG_TERMS[flag.id] ?? [];
        const haystack = [normalise(flag.label), ...terms.map(normalise)];
        if (haystack.some((term) => term.length > 0 && q.includes(term))) {
            /* No bookable unit, and no form. The emergency department is not
               returned as an option to weigh up — it is returned because it is
               where this person is going, and they need the door and the
               ambulance number, not a list. */
            return { redFlag: flag, units: [] };
        }
    }

    const hits = units.filter((unit) => {
        // A&E always survives a search. Someone typing "cut" at 3am should see
        // the one door that is definitely open.
        if (unit.kind === "emergency") return true;
        const haystack = [unit.name, unit.summary, ...unit.matches].map(normalise);
        // Match on any word of two or more characters, so "cut hand" finds
        // minor injuries even though that exact phrase appears nowhere.
        return q
            .split(" ")
            .filter((word) => word.length > 2)
            .some((word) => haystack.some((term) => term.includes(word)));
    });

    return { redFlag: null, units: hits };
}

export function urgentUnitById(id: string, kind = "general-practice"): UrgentUnit | undefined {
    return urgentUnitsFor(kind).find((unit) => unit.id === id);
}

/* ── where to go ───────────────────────────────────────────────────────────
   A hospital group has more than one front door, and the useful answer to
   "I need A&E" is *which* one — the nearest open one, with its own number.
   Sending everyone to the flagship address is how someone drives past a
   closer department.                                                        */

export interface EmergencySite {
    readonly id: string;
    readonly name: string;
    readonly address: string;
    readonly lat: number;
    readonly lng: number;
    readonly aeLine: string;
    /** True 24/7 A&E. A minor injuries unit is not a substitute and says so. */
    readonly full: boolean;
    readonly hours: string;
    /** UK outward codes this site is nearest to, for postcode entry. */
    readonly outwardCodes: readonly string[];
}

/**
 * Where the emergency departments are.
 *
 * A function of the brand, not a constant: the name and the main address have
 * to follow the host like everything else, or every tenant sends its patients
 * to another clinic's front door. The satellites are named from the practice
 * rather than from invented streets — a wrong address on an emergency page is
 * the worst possible place for filler text.
 */
export function emergencySites(brand: Brand): readonly EmergencySite[] {
    /* One site: this practice, at its own address.
     *
     * This used to return three — a "South site" and an "East site" invented
     * from the practice name, all three pinned to Manchester coordinates and
     * Manchester outward codes. Every tenant therefore claimed an emergency
     * network it does not have, and a small animal clinic in Miles City asked
     * its owners for an M20 postcode to find the nearest of three Montana
     * emergency departments that do not exist.
     *
     * A practice that genuinely runs more than one door can say so on its row;
     * until then the only address we know is true is theirs. */
    return [
        {
            id: "main",
            name: `${brand.short} — emergency`,
            address: brand.address,
            lat: 0,
            lng: 0,
            aeLine: brand.aeLine,
            full: true,
            hours: "24 hours, every day",
            outwardCodes: [],
        },
    ];
}

export interface SiteMatch {
    readonly site: EmergencySite;
    /** Straight-line kilometres. Labelled as such — it is not a drive time. */
    readonly km: number;
}

/** Haversine. Straight-line only; we never present it as a journey time. */
function distanceKm(aLat: number, aLng: number, b: EmergencySite): number {
    const toRad = (deg: number): number => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(b.lat - aLat);
    const dLng = toRad(b.lng - aLng);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(aLat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Nearest sites to a coordinate, closest first.
 *
 * A minor injuries unit is never returned ahead of a full A&E when the caller
 * asks for one: being closer does not make it the right door, and arriving at
 * a unit that cannot treat you costs the time it took to get there.
 */
export function nearestSites(
    sites: readonly EmergencySite[],
    lat: number,
    lng: number,
    fullOnly: boolean,
): readonly SiteMatch[] {
    return sites
        .filter((site) => (fullOnly ? site.full : true))
        .map((site) => ({ site, km: distanceKm(lat, lng, site) }))
        .sort((a, b) => a.km - b.km);
}

/**
 * Nearest site by UK postcode, using the outward code only.
 *
 * We never geocode a full postcode: the outward code is enough to pick a
 * hospital, and a full postcode is a person's front door. Returns null rather
 * than guessing — a wrong emergency department is worse than an honest "we
 * could not tell, here are all of them".
 */
export function siteForPostcode(
    sites: readonly EmergencySite[],
    postcode: string,
): EmergencySite | null {
    const outward = postcode.toUpperCase().replace(/[^A-Z0-9]/g, "").match(/^[A-Z]{1,2}\d{1,2}/);
    if (outward === null) return null;
    return sites.find((site) => site.outwardCodes.includes(outward[0])) ?? null;
}

/* ── the veterinary set ────────────────────────────────────────────────────
   Everything above this line is human medicine, and it was rendering on
   veterinary sites unchanged: a small animal clinic in Montana offering
   "Urgent child health", "Urgent mental health" and "Same-day GP", warning pet
   owners about face drooping and slurred speech, and telling them to call an
   ambulance that does not come for a dog.

   These are the categories a veterinary practice actually runs an urgent list
   for, and the red flags are the ones that genuinely mean "now": a blocked
   cat, a bloated retching dog, a seizure that will not stop.              */

export const VET_UNITS: readonly UrgentUnit[] = [
    {
        id: "vet-emergency",
        kind: "emergency",
        name: "Emergency — bring them straight in",
        summary:
            "Collapse, struggling to breathe, a bloated hard tummy with retching, a cat straining and passing nothing, a seizure that will not stop, heavy bleeding, or a road accident. Ring on your way so the team is waiting at the door.",
        notFor:
            "Nothing. If you are not sure whether it is serious enough, ring us — that judgement is ours to make, not yours.",
        hours: "Ring first, any hour",
        wait: "Seen immediately",
        matches: [
            "emergency", "collapse", "collapsed", "breathing", "breathe", "choking",
            "bloat", "gdv", "twisted", "retching", "blocked", "straining", "seizure",
            "fitting", "convulsion", "bleeding", "blood", "hit by a car", "accident",
            "poison", "poisoned", "antifreeze", "chocolate", "unconscious",
        ],
    },
    {
        id: "vet-sick-today",
        kind: "urgent",
        name: "Sick today",
        summary:
            "Vomiting, diarrhoea, off food, drinking far more than usual, or simply not themselves. Seen the same day rather than waiting for a routine appointment.",
        notFor: "Routine boosters and check-ups, which are quicker to book normally.",
        hours: "Monday to Saturday, 08:00–18:00",
        wait: "Seen within 3 hours",
        matches: [
            "sick", "vomit", "vomiting", "diarrhoea", "diarrhea", "off food", "not eating",
            "lethargic", "drinking", "thirsty", "unwell", "poorly", "tummy", "stomach",
        ],
    },
    {
        id: "vet-injury",
        kind: "urgent",
        name: "Wounds, bites and lameness",
        summary:
            "Cuts that may need closing, bite wounds, a torn claw, limping or a leg they will not put down. We can x-ray here.",
        notFor: "A wound that is bleeding heavily and will not stop — that is an emergency, ring us.",
        hours: "Every day, 08:00–20:00",
        wait: "About 40 minutes",
        matches: [
            "wound", "cut", "bite", "bitten", "limp", "limping", "lame", "lameness",
            "leg", "paw", "claw", "nail", "sprain", "broken", "fracture", "x-ray", "xray",
        ],
    },
    {
        id: "vet-poison",
        kind: "urgent",
        name: "Ate something they should not have",
        summary:
            "Chocolate, grapes or raisins, xylitol, human medication, rat bait, antifreeze, or a swallowed toy or sock. Ring before you set off — with some of these the first hour decides the outcome.",
        notFor: "Waiting to see if they seem fine. Several of these show nothing until the damage is done.",
        hours: "Ring first, any hour",
        wait: "Advised on the phone, seen straight away if needed",
        matches: [
            "ate", "eaten", "swallowed", "poison", "chocolate", "grape", "raisin",
            "xylitol", "ibuprofen", "paracetamol", "medication", "tablet", "rat bait",
            "antifreeze", "lily", "sock", "toy", "string", "bone",
        ],
    },
];

/**
 * The urgent list for this trade.
 *
 * Partial on purpose, like the photography: only veterinary genuinely differs
 * so far. A physiotherapist does not run an urgent list at all, and gets the
 * human set until someone writes one — which is a weaker answer than a
 * bespoke one, but not a false one.
 */
export function urgentUnitsFor(kind: string): readonly UrgentUnit[] {
    return kind === "veterinary" ? VET_UNITS : URGENT_UNITS;
}

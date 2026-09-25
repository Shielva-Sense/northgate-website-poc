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

import { RED_FLAGS } from "./care";
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
};

function normalise(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Red flags are checked first and short-circuit. A query of "chest pain after a
 * fall" mentions an injury, and the injuries unit would match it — returning
 * both would let the patient pick the convenient one.
 */
export function searchUrgent(query: string): UrgentSearch {
    const q = normalise(query);
    if (q.length < 2) return { redFlag: null, units: URGENT_UNITS };

    for (const flag of RED_FLAGS) {
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

    const hits = URGENT_UNITS.filter((unit) => {
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

export function urgentUnitById(id: string): UrgentUnit | undefined {
    return URGENT_UNITS.find((unit) => unit.id === id);
}

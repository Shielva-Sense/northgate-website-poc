/**
 * Page templates.
 *
 * A template is an ordered list of sections, not a fork of the site. Every
 * template renders the same components from the same data — what changes is
 * what a visitor meets first, which is the only thing that really differs
 * between a family practice, a hospital and a single-procedure clinic.
 *
 * That constraint is deliberate: a fix to the booking flow lands in all four,
 * and a client switching template loses nothing.
 */

export const SECTION_IDS = [
    "hero",
    "proof",
    "departments",
    "team",
    "pricing",
    "gallery",
    "promises",
    "journey",
    "story",
    "services",
    "visiting",
    "faq",
    "book",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const TEMPLATE_IDS = ["practice", "hospital", "clinic", "wellness"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export interface Template {
    readonly id: TemplateId;
    readonly name: string;
    readonly tagline: string;
    /** Who it suits, in the words a client would use about themselves. */
    readonly suits: string;
    /** The argument the running order makes. */
    readonly rationale: string;
    readonly sections: readonly SectionId[];
}

export const TEMPLATES: readonly Template[] = [
    {
        id: "practice",
        name: "Doctor-first",
        tagline: "Lead with the people",
        suits: "Family practices and small group clinics where patients pick a named clinician.",
        rationale:
            "Credentials, languages and a real next-free slot sit above the fold. Works when the doctor is the reason someone chooses you.",
        sections: [
            "hero", "proof", "team", "pricing", "gallery", "promises",
            "journey", "story", "services", "visiting", "faq", "book",
        ],
    },
    {
        id: "hospital",
        name: "Departments-first",
        tagline: "Lead with what you treat",
        suits: "Hospitals and multi-speciality centres with more services than a visitor can scan.",
        rationale:
            "Departments come first, each routing to the clinicians who staff it and their availability. Works when nobody arrives knowing which doctor they need.",
        sections: [
            "hero", "departments", "proof", "services", "team", "journey",
            "gallery", "promises", "visiting", "faq", "book",
        ],
    },
    {
        id: "clinic",
        name: "Procedure-led",
        tagline: "Lead with price and proof",
        suits: "Single-procedure and aesthetic clinics competing on transparency and cost.",
        rationale:
            "Pricing and the step-by-step journey sit high, before the team. Works when the decision is 'how much, how long, does it hurt'.",
        sections: [
            "hero", "proof", "pricing", "journey", "team", "story",
            "gallery", "promises", "faq", "visiting", "book",
        ],
    },
    {
        id: "wellness",
        name: "Editorial",
        tagline: "Lead with the place and the stories",
        suits: "Wellness, dental and private clinics selling calm and continuity rather than urgency.",
        rationale:
            "Patient stories and the rooms themselves come before any price. Slowest to the ask, and the warmest.",
        sections: [
            "hero", "story", "gallery", "team", "proof", "services",
            "promises", "journey", "visiting", "faq", "book",
        ],
    },
];

export const DEFAULT_TEMPLATE: TemplateId = "practice";

export function isTemplateId(value: string | undefined): value is TemplateId {
    return value !== undefined && (TEMPLATE_IDS as readonly string[]).includes(value);
}

export function templateById(id: TemplateId): Template {
    return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]!;
}

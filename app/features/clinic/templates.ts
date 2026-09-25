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

/**
 * The visual half of a template. Emitted as CSS custom properties and consumed
 * by the existing stylesheets, so four genuinely different looks come out of
 * one component tree — and a fifth costs one entry here, not a new set of
 * components to keep in sync.
 */
export interface Design {
    /** Corner language. The single biggest driver of how a site "feels". */
    readonly radius: string;
    readonly radiusSmall: string;
    /** Headline face: the serif reads considered, the sans reads institutional. */
    readonly display: "serif" | "sans";
    readonly displayScale: string;
    readonly displayTracking: string;
    readonly sectionPad: string;
    readonly cardBorder: string;
    readonly cardShadow: string;
    readonly heroStyle: "cinematic" | "split" | "panel" | "editorial";
}

export interface Template {
    readonly id: TemplateId;
    readonly name: string;
    readonly tagline: string;
    /** Section copy that has to change with the venue. A hospital does not
     *  describe itself as "everything a family practice should cover". */
    readonly servicesTitle: string;
    readonly servicesLede: string;
    /** Who it suits, in the words a client would use about themselves. */
    readonly suits: string;
    /** The argument the running order makes. */
    readonly rationale: string;
    readonly sections: readonly SectionId[];
    readonly design: Design;
}

export const TEMPLATES: readonly Template[] = [
    {
        id: "practice",
        design: {
            radius: "18px",
            radiusSmall: "10px",
            display: "serif",
            displayScale: "1",
            displayTracking: "-0.02em",
            sectionPad: "var(--space-9)",
            cardBorder: "1px solid var(--color-border)",
            cardShadow: "none",
            heroStyle: "cinematic",
        },
        servicesTitle: "Everything a family practice should cover",
        servicesLede:
            "If you are not sure which one you need, choose the closest and say so in the notes. We would rather sort it out than have you guess.",
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
        design: {
            /* Near-square corners and a sans headline: institutional rather
               than boutique, which is what a hospital is. */
            radius: "4px",
            radiusSmall: "3px",
            display: "sans",
            displayScale: "0.92",
            displayTracking: "-0.025em",
            sectionPad: "var(--space-8)",
            cardBorder: "1px solid var(--color-border-strong)",
            cardShadow: "none",
            heroStyle: "split",
        },
        servicesTitle: "Every service we offer, in one place",
        servicesLede:
            "Each one is run by a named department. Choose a service to see the clinicians behind it and when they are next free.",
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
        design: {
            /* Rounded and lifted. Reads commercial, which suits a clinic
               competing on price and convenience. */
            radius: "14px",
            radiusSmall: "999px",
            display: "sans",
            displayScale: "1",
            displayTracking: "-0.03em",
            sectionPad: "var(--space-8)",
            cardBorder: "0",
            cardShadow: "0 2px 4px rgba(var(--color-ink-rgb), 0.05), 0 14px 34px rgba(var(--color-ink-rgb), 0.09)",
            heroStyle: "panel",
        },
        servicesTitle: "What we treat, and what it costs",
        servicesLede:
            "Every procedure we offer, with the price published. No consultation fee to ask which one you need.",
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
        design: {
            /* Soft, large and unhurried. Nothing is boxed in. */
            radius: "28px",
            radiusSmall: "16px",
            display: "serif",
            displayScale: "1.1",
            displayTracking: "-0.015em",
            sectionPad: "calc(var(--space-9) * 1.25)",
            cardBorder: "0",
            cardShadow: "none",
            heroStyle: "editorial",
        },
        servicesTitle: "How we look after you",
        servicesLede:
            "Unhurried appointments across everything below. If you are not sure where to start, we will help you find it.",
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

/** The design as CSS custom properties, for injection on a wrapper element. */
export function designVars(id: TemplateId): Record<string, string> {
    const { design } = templateById(id);
    return {
        "--t-radius": design.radius,
        "--t-radius-sm": design.radiusSmall,
        "--t-display": design.display === "serif" ? "var(--font-serif)" : "var(--font-sans)",
        "--t-display-weight": design.display === "serif" ? "600" : "700",
        "--t-display-scale": design.displayScale,
        "--t-display-tracking": design.displayTracking,
        "--t-section-pad": design.sectionPad,
        "--t-card-border": design.cardBorder,
        "--t-card-shadow": design.cardShadow,
    };
}

/** Interfaces only. No React, no fetch. */

export interface Service {
    readonly slug: string;
    readonly name: string;
    readonly summary: string;
    readonly duration: string;
    readonly icon: ServiceIcon;
}

export const SERVICE_ICONS = [
    "stethoscope",
    "syringe",
    "heartPulse",
    "baby",
    "brain",
    "flaskConical",
] as const;
export type ServiceIcon = (typeof SERVICE_ICONS)[number];

export interface Clinician {
    readonly name: string;
    readonly role: string;
    readonly focus: string;
    readonly initials: string;
    /** Years in practice — the single strongest credibility signal on a card. */
    readonly years: number;
    readonly registration: string;
    /** Spelled out, as every major hospital site does — it is the credential. */
    readonly qualifications: string;
    readonly rating: number;
    readonly reviews: number;
    /** What this clinician's appointment costs, answered before it is asked. */
    readonly fee: string;
    readonly languages: readonly string[];
    readonly site: string;
    /**
     * A concrete next opening. Showing a real time converts far better than
     * "contact us", because it answers the only question a worried patient has.
     */
    readonly nextSlot: { readonly day: string; readonly time: string };
    /**
     * Drop a real headshot into /public/img/team and set the path here. Left
     * undefined the card renders a designed monogram instead — never a stock face.
     */
    readonly photo?: string;
}

export interface OpeningDay {
    readonly day: string;
    readonly hours: string;
    readonly isToday?: boolean;
}

export interface FaqItem {
    readonly question: string;
    readonly answer: string;
}

/** A headline number, counted up as it scrolls into view. */
export interface Stat {
    readonly value: number;
    readonly suffix: string;
    readonly label: string;
}

export interface Package {
    readonly slug: string;
    readonly name: string;
    readonly price: string;
    readonly cadence: string;
    readonly summary: string;
    readonly includes: readonly string[];
    readonly featured?: boolean;
}

export interface JourneyStep {
    readonly step: number;
    readonly title: string;
    readonly body: string;
}

export interface Review {
    readonly quote: string;
    readonly name: string;
    readonly context: string;
    readonly rating: number;
}

export interface Facility {
    readonly src: string;
    readonly alt: string;
    readonly title: string;
    readonly points: readonly string[];
}

export interface Accreditation {
    readonly label: string;
    readonly detail: string;
}

/** An operational promise: the logistics the practice takes off the patient. */
export interface Promise_ {
    readonly title: string;
    readonly body: string;
    readonly icon: PromiseIcon;
}

export const PROMISE_ICONS = ["car", "wallet", "files", "headset"] as const;
export type PromiseIcon = (typeof PROMISE_ICONS)[number];

/** A filmed patient story. One, told properly, beats a wall of star ratings. */
export interface PatientStory {
    readonly quote: string;
    readonly name: string;
    /** "37" — rendered beside the name, as healthcare sites conventionally do. */
    readonly age: string;
    readonly context: string;
    readonly video: string;
    readonly poster: string;
    /** Describes the person and setting for anyone who cannot see the video. */
    readonly posterAlt: string;
}

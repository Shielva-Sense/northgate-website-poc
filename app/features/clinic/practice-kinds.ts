/**
 * What kind of practice this is, and therefore what the site may claim.
 *
 * Every prospect site was a full-service family practice with six departments,
 * a health library and a 24-hour emergency department. For the dentists,
 * physiotherapists and chiropractors who make up most of the list that is not
 * merely generic — it is false, and the A&E page is the dangerous part. A
 * dental practice must never tell anyone it has an emergency department.
 *
 * So the kind decides three things: which services appear, which pages exist
 * at all, and what the people are called.
 */

export type PracticeKind =
    | "hospital"
    | "general-practice"
    | "dental"
    | "physio"
    | "chiro"
    | "dermatology"
    | "optometry"
    | "mental-health"
    | "podiatry"
    | "veterinary";

export interface Service {
    readonly slug: string;
    readonly name: string;
    readonly blurb: string;
}

export interface KindProfile {
    readonly kind: PracticeKind;
    /** What this sort of place calls itself. */
    readonly label: string;
    /** The word for one of its clinicians. */
    readonly clinician: string;
    readonly clinicianPlural: string;
    /** The word for a visit. */
    readonly visit: string;

    /**
     * True only where a 24-hour emergency department is plausible. Everything
     * else routes urgent cases to the national number and to a hospital —
     * which is the correct advice, not a missing feature.
     */
    readonly hasEmergency: boolean;
    /** Departments only make sense where there are several specialties. */
    readonly hasDepartments: boolean;
    /** A patient-education library is a hospital and GP convention. */
    readonly hasHealthLibrary: boolean;

    readonly services: readonly Service[];
    /** One line for the hero, in this trade's own terms. */
    readonly strapline: string;
}

const PROFILES: Readonly<Record<PracticeKind, KindProfile>> = {
    hospital: {
        kind: "hospital", label: "hospital",
        clinician: "consultant", clinicianPlural: "consultants", visit: "appointment",
        hasEmergency: true, hasDepartments: true, hasHealthLibrary: true,
        strapline: "Every specialty under one roof, and someone on duty at every hour",
        services: [
            { slug: "emergency", name: "Emergency care", blurb: "Open every hour of every day, no appointment needed." },
            { slug: "surgery", name: "Surgery", blurb: "Planned procedures with a named surgeon and a date." },
            { slug: "maternity", name: "Maternity", blurb: "Antenatal, birth and the weeks after." },
            { slug: "diagnostics", name: "Imaging & diagnostics", blurb: "MRI, CT, ultrasound and bloods, most reported same week." },
            { slug: "outpatients", name: "Outpatient clinics", blurb: "Referral and self-pay clinics across every specialty." },
        ],
    },
    "general-practice": {
        kind: "general-practice", label: "practice",
        clinician: "doctor", clinicianPlural: "doctors", visit: "appointment",
        hasEmergency: false, hasDepartments: true, hasHealthLibrary: true,
        strapline: "See a named doctor this week, not in three",
        services: [
            { slug: "gp", name: "GP appointments", blurb: "Twenty minutes as standard, thirty for anything that needs it." },
            { slug: "health-checks", name: "Health checks", blurb: "Bloods, blood pressure and a proper conversation about the results." },
            { slug: "vaccinations", name: "Vaccinations & travel", blurb: "Routine schedules and destination-specific advice." },
            { slug: "child-health", name: "Child health", blurb: "Illness, feeding, development and vaccinations." },
            { slug: "mental-health", name: "Mental health", blurb: "Longer appointments as standard, no rushing." },
            { slug: "bloods", name: "Bloods & diagnostics", blurb: "Most results back inside two working days." },
        ],
    },
    dental: {
        kind: "dental", label: "dental practice",
        clinician: "dentist", clinicianPlural: "dentists", visit: "appointment",
        hasEmergency: false, hasDepartments: false, hasHealthLibrary: false,
        strapline: "A dentist who explains what they are doing, and what it costs, first",
        services: [
            { slug: "check-up", name: "Check-up & hygiene", blurb: "Examination, scale and polish, and a plan you agree to." },
            { slug: "fillings", name: "Fillings & restorations", blurb: "Tooth-coloured, matched and done in one visit where possible." },
            { slug: "implants", name: "Dental implants", blurb: "Assessment, placement and the crown, with the total price up front." },
            { slug: "orthodontics", name: "Orthodontics", blurb: "Clear aligners and fixed braces for adults and teenagers." },
            { slug: "whitening", name: "Whitening", blurb: "Supervised whitening, with trays made from your own impressions." },
            { slug: "emergency-dental", name: "Emergency dental", blurb: "Same-day appointments held back every morning for pain." },
        ],
    },
    physio: {
        kind: "physio", label: "physiotherapy clinic",
        clinician: "physiotherapist", clinicianPlural: "physiotherapists", visit: "session",
        hasEmergency: false, hasDepartments: false, hasHealthLibrary: false,
        strapline: "Hands-on treatment and a plan you can actually keep to",
        services: [
            { slug: "assessment", name: "Initial assessment", blurb: "Forty-five minutes to find the cause, not just the sore bit." },
            { slug: "manual-therapy", name: "Manual therapy", blurb: "Hands-on treatment for joints and soft tissue." },
            { slug: "rehab", name: "Rehabilitation", blurb: "A programme that fits your week, reviewed as you progress." },
            { slug: "sports", name: "Sports injury", blurb: "Return-to-play planning alongside the treatment." },
            { slug: "pilates", name: "Clinical Pilates", blurb: "Small groups, led by a physiotherapist." },
        ],
    },
    chiro: {
        kind: "chiro", label: "chiropractic clinic",
        clinician: "chiropractor", clinicianPlural: "chiropractors", visit: "adjustment",
        hasEmergency: false, hasDepartments: false, hasHealthLibrary: false,
        strapline: "Back and neck pain treated by someone who explains the plan",
        services: [
            { slug: "assessment", name: "Initial consultation", blurb: "History, examination and a clear plan before anything else." },
            { slug: "adjustment", name: "Chiropractic adjustment", blurb: "Spinal and joint treatment tailored to the assessment." },
            { slug: "soft-tissue", name: "Soft tissue therapy", blurb: "Massage and release work alongside adjustment." },
            { slug: "posture", name: "Posture & ergonomics", blurb: "Desk and lifting assessment, so it does not come straight back." },
        ],
    },
    dermatology: {
        kind: "dermatology", label: "dermatology clinic",
        clinician: "dermatologist", clinicianPlural: "dermatologists", visit: "appointment",
        hasEmergency: false, hasDepartments: false, hasHealthLibrary: true,
        strapline: "Skin looked at properly, by someone who does this all day",
        services: [
            { slug: "mole-check", name: "Mole & skin cancer check", blurb: "Full-body dermoscopy, with photographs kept for comparison." },
            { slug: "acne", name: "Acne & rosacea", blurb: "Medical treatment with review, not a product list." },
            { slug: "eczema", name: "Eczema & psoriasis", blurb: "Long-term management that does not rely on steroids alone." },
            { slug: "surgery", name: "Minor skin surgery", blurb: "Removal and biopsy, with histology reported back to you." },
            { slug: "cosmetic", name: "Cosmetic dermatology", blurb: "Only where it is clinically sensible, and priced plainly." },
        ],
    },
    optometry: {
        kind: "optometry", label: "eye care practice",
        clinician: "optometrist", clinicianPlural: "optometrists", visit: "eye test",
        hasEmergency: false, hasDepartments: false, hasHealthLibrary: false,
        strapline: "A proper eye examination, not a rush to the frames",
        services: [
            { slug: "eye-test", name: "Eye examination", blurb: "Thirty minutes, including retinal photography." },
            { slug: "contact-lenses", name: "Contact lenses", blurb: "Fitting, trial and aftercare included." },
            { slug: "childrens", name: "Children's eyes", blurb: "Tests designed for children who cannot read a chart yet." },
            { slug: "glaucoma", name: "Glaucoma screening", blurb: "Pressure, field and nerve imaging in one visit." },
        ],
    },
    "mental-health": {
        kind: "mental-health", label: "practice",
        clinician: "therapist", clinicianPlural: "therapists", visit: "session",
        hasEmergency: false, hasDepartments: false, hasHealthLibrary: true,
        strapline: "Someone to talk to, within the week",
        services: [
            { slug: "individual", name: "Individual therapy", blurb: "Fifty minutes, weekly, with the same therapist." },
            { slug: "couples", name: "Couples therapy", blurb: "Structured sessions with both partners present." },
            { slug: "cbt", name: "CBT", blurb: "Short-course, goal-led work for anxiety and low mood." },
            { slug: "assessment", name: "Assessment", blurb: "A first appointment to work out what would actually help." },
        ],
    },
    podiatry: {
        kind: "podiatry", label: "podiatry clinic",
        clinician: "podiatrist", clinicianPlural: "podiatrists", visit: "appointment",
        hasEmergency: false, hasDepartments: false, hasHealthLibrary: false,
        strapline: "Feet treated by a specialist, not squeezed into a GP slot",
        services: [
            { slug: "routine", name: "Routine foot care", blurb: "Nails, callus and the things that make walking hurt." },
            { slug: "diabetic", name: "Diabetic foot care", blurb: "Regular checks, because this is where small problems get big." },
            { slug: "biomechanics", name: "Biomechanics & orthotics", blurb: "Gait assessment and custom insoles." },
            { slug: "nail-surgery", name: "Nail surgery", blurb: "Ingrown toenails treated under local anaesthetic." },
        ],
    },
    veterinary: {
        kind: "veterinary", label: "veterinary practice",
        clinician: "vet", clinicianPlural: "vets", visit: "appointment",
        hasEmergency: true, hasDepartments: false, hasHealthLibrary: false,
        strapline: "The same vet each visit, who remembers your animal",
        services: [
            { slug: "consultations", name: "Consultations", blurb: "Fifteen minutes, longer for anything complicated." },
            { slug: "vaccinations", name: "Vaccinations", blurb: "Puppy and kitten courses, and annual boosters." },
            { slug: "surgery", name: "Surgery", blurb: "Routine and soft-tissue, with a call before and after." },
            { slug: "dentistry", name: "Dentistry", blurb: "Scale, polish and extractions under anaesthetic." },
            { slug: "emergency-vet", name: "Out of hours", blurb: "An emergency line that reaches a vet, not a message." },
        ],
    },
};

export const DEFAULT_KIND: PracticeKind = "general-practice";

export function profileFor(kind: string | undefined): KindProfile {
    const key = (kind ?? DEFAULT_KIND) as PracticeKind;
    return PROFILES[key] ?? PROFILES[DEFAULT_KIND];
}

export const PRACTICE_KINDS: readonly PracticeKind[] = Object.keys(PROFILES) as PracticeKind[];

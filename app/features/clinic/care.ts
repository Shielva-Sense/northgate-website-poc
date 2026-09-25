/**
 * Departments, availability and symptom signposting.
 *
 * Kept apart from constants.ts because this is the clinical shape of the site —
 * what a hospital offers, who staffs it and when they are free — whereas
 * constants.ts is marketing copy.
 */

export interface Department {
    readonly id: string;
    readonly name: string;
    readonly summary: string;
    /** Card image. Chosen to suggest the room, not the procedure. */
    readonly image: string;
    readonly imageAlt: string;
    /** Services (by slug) this department covers. */
    readonly services: readonly string[];
}

export interface Slot {
    readonly id: string;
    /** "Today", "Tomorrow", "Thu 2 Oct" — display only; a real build reads a calendar. */
    readonly day: string;
    readonly time: string;
    readonly taken?: boolean;
}

export const DEPARTMENTS: readonly Department[] = [
    {
        id: "general",
        image: "/img/dept/general.jpg",
        imageAlt: "A tidy consulting-room desk with a stethoscope, notebook and blood pressure cuff",
        name: "General medicine",
        summary: "First port of call for anything undifferentiated, and ongoing conditions.",
        services: ["gp", "health-checks", "bloods"],
    },
    {
        id: "womens",
        image: "/img/dept/womens.jpg",
        imageAlt: "Two comfortable chairs turned toward each other beside a softly curtained window",
        name: "Women's health",
        summary: "Contraception, menopause, gynaecological symptoms and cervical screening.",
        services: ["gp", "health-checks"],
    },
    {
        id: "paediatrics",
        image: "/img/dept/paediatrics.jpg",
        imageAlt: "A bright corner of a clinic with wooden toys, picture books and a child-height chair",
        name: "Child health",
        summary: "Babies and children — illness, feeding, development and vaccinations.",
        services: ["child-health", "vaccinations"],
    },
    {
        id: "mental-health",
        image: "/img/dept/mental-health.jpg",
        imageAlt: "A softly lit room with a deep armchair, a wool throw and a window onto green leaves",
        name: "Mental health",
        summary: "Low mood, anxiety, sleep and stress, with longer appointments as standard.",
        services: ["mental-health"],
    },
    {
        id: "cardiometabolic",
        image: "/img/dept/cardiometabolic.jpg",
        imageAlt: "A clinic bench with a blood pressure monitor, ECG unit and glucose meter",
        name: "Heart & diabetes",
        summary: "Blood pressure, cholesterol, diabetes review and cardiovascular risk.",
        services: ["health-checks", "bloods", "gp"],
    },
    {
        id: "travel",
        image: "/img/dept/travel.jpg",
        imageAlt: "A travel health desk with a journal, a globe, a passport and sealed vaccination packs",
        name: "Travel health",
        summary: "Destination risk assessment, vaccinations and antimalarials.",
        services: ["vaccinations"],
    },
];

/** Availability per clinician, keyed by their name. */
export const AVAILABILITY: Readonly<Record<string, readonly Slot[]>> = {
    "Dr Alice Whitfield": [
        { id: "aw-1", day: "Tomorrow", time: "09:20" },
        { id: "aw-2", day: "Tomorrow", time: "11:40", taken: true },
        { id: "aw-3", day: "Tomorrow", time: "15:00" },
        { id: "aw-4", day: "Thu 2 Oct", time: "08:40" },
        { id: "aw-5", day: "Thu 2 Oct", time: "16:20" },
    ],
    "Dr Priya Nandakumar": [
        { id: "pn-1", day: "Tomorrow", time: "14:00" },
        { id: "pn-2", day: "Tomorrow", time: "17:30" },
        { id: "pn-3", day: "Thu 2 Oct", time: "09:00", taken: true },
        { id: "pn-4", day: "Thu 2 Oct", time: "13:20" },
        { id: "pn-5", day: "Fri 3 Oct", time: "10:10" },
    ],
    "Samuel Okonkwo": [
        { id: "so-1", day: "Today", time: "16:45" },
        { id: "so-2", day: "Today", time: "17:15" },
        { id: "so-3", day: "Tomorrow", time: "08:20" },
        { id: "so-4", day: "Tomorrow", time: "12:00" },
    ],
    "Mariana Duarte": [
        { id: "md-1", day: "Today", time: "17:10" },
        { id: "md-2", day: "Tomorrow", time: "09:50" },
        { id: "md-3", day: "Tomorrow", time: "14:30", taken: true },
        { id: "md-4", day: "Fri 3 Oct", time: "11:00" },
    ],
};

/* ── symptom signposting ───────────────────────────────────────────────────
   This routes to a DEPARTMENT. It is not a diagnosis and must never read as
   one: no condition names, no likelihoods, no advice. The wording throughout
   is "usually seen by", because that is a statement about how the practice is
   organised rather than about the patient.                                   */

export interface SymptomOption {
    readonly id: string;
    readonly label: string;
    readonly department: string;
}

/**
 * Anything here stops the booking flow and sends the person to emergency
 * services. A booking form must never be the path of least resistance for
 * someone describing a possible heart attack or stroke — the cost of being
 * over-cautious is a wasted click, and the cost of being under-cautious is
 * not recoverable.
 */
export const RED_FLAGS: readonly SymptomOption[] = [
    { id: "chest", label: "Chest pain, pressure or tightness", department: "emergency" },
    { id: "breath", label: "Sudden difficulty breathing", department: "emergency" },
    {
        id: "stroke",
        label: "Face drooping, arm weakness or slurred speech",
        department: "emergency",
    },
    { id: "bleeding", label: "Heavy bleeding that will not stop", department: "emergency" },
    {
        id: "baby",
        label: "A baby under 3 months with a fever",
        department: "emergency",
    },
    { id: "harm", label: "Thoughts of harming yourself", department: "emergency" },
];

export const SYMPTOMS: readonly SymptomOption[] = [
    { id: "cough", label: "Cough, sore throat or cold symptoms", department: "general" },
    { id: "tired", label: "Tiredness that is not improving", department: "general" },
    { id: "tummy", label: "Stomach pain, indigestion or bowel changes", department: "general" },
    { id: "skin", label: "A rash, mole or skin change", department: "general" },
    { id: "joint", label: "Joint, back or muscle pain", department: "general" },
    { id: "bp", label: "Blood pressure or cholesterol review", department: "cardiometabolic" },
    { id: "diabetes", label: "Diabetes review, or thirst and weight change", department: "cardiometabolic" },
    { id: "periods", label: "Periods, contraception or pregnancy", department: "womens" },
    { id: "menopause", label: "Menopause symptoms", department: "womens" },
    { id: "mood", label: "Low mood, anxiety or stress", department: "mental-health" },
    { id: "sleep", label: "Trouble sleeping", department: "mental-health" },
    { id: "child", label: "My child is unwell", department: "paediatrics" },
    { id: "childdev", label: "Concerns about my child's development", department: "paediatrics" },
    { id: "jabs", label: "Vaccinations", department: "travel" },
    { id: "travel", label: "Going abroad and need travel health advice", department: "travel" },
];

export function departmentById(id: string): Department | undefined {
    return DEPARTMENTS.find((d) => d.id === id);
}

export function slotsFor(clinicianName: string): readonly Slot[] {
    return AVAILABILITY[clinicianName] ?? [];
}

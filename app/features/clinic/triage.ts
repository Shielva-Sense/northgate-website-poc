/**
 * Symptom signposting, by category.
 *
 * Still not triage and still not a diagnosis. Everything here answers one
 * question — "which department usually sees this?" — and the wording stays in
 * that voice throughout. No condition is ever named, no likelihood is ever
 * stated, and nothing tells anyone what is wrong with them.
 *
 * Why categories: a flat list of fifteen symptoms made the reader scan for
 * their own words and give up when none matched. Asking for the body area
 * first halves the list before they read it, and lets the list grow past
 * fifteen without becoming unusable.
 */

/* Its own icon set rather than borrowing the catalogue's: a treatment card and
   a body-area chip are different concerns, and sharing the union would force
   one list to carry the other's names. */
export const CATEGORY_ICONS = [
    "chest", "tummy", "skin", "bones", "head", "mind",
    "womens", "child", "heart", "senses", "checks", "unsure",
] as const;
export type CategoryIcon = (typeof CATEGORY_ICONS)[number];

export interface SymptomCategory {
    readonly id: string;
    readonly label: string;
    /** Plain-language examples. People match on these, not on the label. */
    readonly hint: string;
    readonly icon: CategoryIcon;
}

export const SYMPTOM_CATEGORIES: readonly SymptomCategory[] = [
    { id: "chest", icon: "chest", label: "Chest & breathing", hint: "Cough, wheeze, breathlessness" },
    { id: "tummy", icon: "tummy", label: "Stomach & digestion", hint: "Pain, indigestion, bowel changes" },
    { id: "skin", icon: "skin", label: "Skin, hair & nails", hint: "Rashes, moles, itching" },
    { id: "bones", icon: "bones", label: "Bones, joints & muscles", hint: "Back pain, knees, injuries that linger" },
    { id: "head", icon: "head", label: "Head & nerves", hint: "Headaches, dizziness, numbness" },
    { id: "mind", icon: "mind", label: "Mood & sleep", hint: "Low mood, anxiety, not sleeping" },
    { id: "womens", icon: "womens", label: "Women's health", hint: "Periods, contraception, menopause" },
    { id: "child", icon: "child", label: "Children", hint: "A child who is unwell or not developing as expected" },
    { id: "heart", icon: "heart", label: "Heart & circulation", hint: "Blood pressure, cholesterol, diabetes" },
    { id: "senses", icon: "senses", label: "Eyes, ears, nose & throat", hint: "Sore throat, earache, sinuses" },
    { id: "checks", icon: "checks", label: "Checks, screening & travel", hint: "Health checks, vaccines, going abroad" },
    { id: "unsure", icon: "unsure", label: "Something else", hint: "Not sure where it fits — that is fine" },
];

export interface CategorisedSymptom {
    readonly id: string;
    readonly category: string;
    readonly label: string;
    readonly department: string;
}

export const CATEGORISED_SYMPTOMS: readonly CategorisedSymptom[] = [
    { id: "cough", category: "chest", label: "Cough, sore throat or a cold that is not shifting", department: "general" },
    { id: "wheeze", category: "chest", label: "Wheezing or getting out of breath more easily", department: "general" },
    { id: "chest-tight", category: "chest", label: "Tightness in the chest when I exert myself", department: "cardiometabolic" },

    { id: "tummy-pain", category: "tummy", label: "Stomach pain or cramps", department: "general" },
    { id: "indigestion", category: "tummy", label: "Indigestion, reflux or heartburn", department: "general" },
    { id: "bowel", category: "tummy", label: "A change in how often I go, or how it looks", department: "general" },

    { id: "rash", category: "skin", label: "A rash or itching", department: "general" },
    { id: "mole", category: "skin", label: "A mole or skin patch that has changed", department: "general" },
    { id: "acne", category: "skin", label: "Acne or a long-running skin complaint", department: "general" },

    { id: "back", category: "bones", label: "Back or neck pain", department: "general" },
    { id: "joint", category: "bones", label: "A painful joint — knee, hip, shoulder", department: "general" },
    { id: "old-injury", category: "bones", label: "An injury that has not settled", department: "general" },

    { id: "headache", category: "head", label: "Headaches or migraines", department: "general" },
    { id: "dizzy", category: "head", label: "Dizziness or feeling off balance", department: "general" },
    { id: "numb", category: "head", label: "Pins and needles, or numbness that comes and goes", department: "general" },

    { id: "mood", category: "mind", label: "Low mood, or nothing feels worth doing", department: "mental-health" },
    { id: "anxiety", category: "mind", label: "Anxiety, worry or panic", department: "mental-health" },
    { id: "sleep", category: "mind", label: "Not sleeping", department: "mental-health" },
    { id: "stress", category: "mind", label: "Stress I am not coping with", department: "mental-health" },

    { id: "periods", category: "womens", label: "Periods — heavy, painful or irregular", department: "womens" },
    { id: "contraception", category: "womens", label: "Contraception", department: "womens" },
    { id: "menopause", category: "womens", label: "Menopause or perimenopause symptoms", department: "womens" },
    { id: "smear", category: "womens", label: "Cervical screening", department: "womens" },

    { id: "child-ill", category: "child", label: "My child is unwell", department: "paediatrics" },
    { id: "child-dev", category: "child", label: "I have concerns about my child's development", department: "paediatrics" },
    { id: "child-feed", category: "child", label: "Feeding, weaning or weight", department: "paediatrics" },

    { id: "bp", category: "heart", label: "Blood pressure", department: "cardiometabolic" },
    { id: "cholesterol", category: "heart", label: "Cholesterol", department: "cardiometabolic" },
    { id: "diabetes", category: "heart", label: "Diabetes, or thirst and weight change", department: "cardiometabolic" },
    { id: "palpitations", category: "heart", label: "Palpitations or a fluttering heartbeat", department: "cardiometabolic" },

    { id: "throat", category: "senses", label: "Sore throat or hoarseness", department: "general" },
    { id: "ear", category: "senses", label: "Earache or hearing changes", department: "general" },
    { id: "sinus", category: "senses", label: "Blocked nose or sinus pain", department: "general" },
    { id: "eye", category: "senses", label: "Sore, red or watering eyes", department: "general" },

    { id: "healthcheck", category: "checks", label: "A general health check", department: "general" },
    { id: "bloods", category: "checks", label: "Blood tests", department: "general" },
    { id: "jabs", category: "checks", label: "Vaccinations", department: "travel" },
    { id: "travel", category: "checks", label: "Going abroad and need travel advice", department: "travel" },

    { id: "tired", category: "unsure", label: "Tiredness that is not improving", department: "general" },
    { id: "weight", category: "unsure", label: "Weight change I cannot explain", department: "general" },
    { id: "other", category: "unsure", label: "Something else entirely", department: "general" },
];

export const FOR_WHOM = [
    { value: "self", label: "Myself" },
    { value: "child", label: "My child" },
    { value: "other", label: "Someone else" },
] as const;

export const DURATIONS = [
    { value: "today", label: "Started today" },
    { value: "days", label: "A few days" },
    { value: "weeks", label: "Weeks" },
    { value: "months", label: "Months or longer" },
] as const;

export const SEVERITIES = [
    { value: "mild", label: "Annoying, but I am coping" },
    { value: "moderate", label: "It is affecting my day" },
    { value: "severe", label: "It is severe or getting worse fast" },
] as const;

export type ForWhom = (typeof FOR_WHOM)[number]["value"];
export type Duration = (typeof DURATIONS)[number]["value"];
export type Severity = (typeof SEVERITIES)[number]["value"];

export interface Answers {
    readonly forWhom: ForWhom;
    readonly symptomId: string;
    readonly duration: Duration;
    readonly severity: Severity;
}

export interface Routing {
    readonly department: string;
    /** Why this department — shown to the patient, so it must read plainly. */
    readonly because: string;
    /** When true the page must offer urgent care, not a routine booking. */
    readonly urgent: boolean;
    readonly urgentBecause: string | null;
}

/**
 * Where this person is usually seen.
 *
 * Two overrides sit above the symptom's own department, and both are about
 * who is asking rather than what they described:
 *
 * - A child is seen by child health whatever the symptom. A paediatric
 *   assessment is a different skill, not the adult one done gently.
 * - "Severe or getting worse fast", started today or within days, is not a
 *   booking. It is offered urgent care instead, because the next free routine
 *   slot is the wrong answer to something that is accelerating.
 */
export function routeFor(answers: Answers): Routing | null {
    const symptom = CATEGORISED_SYMPTOMS.find((s) => s.id === answers.symptomId);
    if (symptom === undefined) return null;

    const child = answers.forWhom === "child";
    const department = child ? "paediatrics" : symptom.department;
    const because = child
        ? "Anyone under 16 is seen by our child health team, whatever the symptom."
        : "This is usually seen by this department.";

    const accelerating =
        answers.severity === "severe" &&
        (answers.duration === "today" || answers.duration === "days");

    return {
        department,
        because,
        urgent: accelerating,
        urgentBecause: accelerating
            ? "You have said this is severe and recent. The next routine appointment is the wrong answer to something moving that fast — urgent care will see you today."
            : null,
    };
}

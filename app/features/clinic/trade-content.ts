import {
    FAQS,
    JOURNEY,
    PATIENT_STORY,
    PROMISES,
    REVIEWS,
    STATS,
} from "./constants";
import type { Regulators } from "./brands";
import type {
    Accreditation,
    FaqItem,
    JourneyStep,
    PatientStory,
    Promise_,
    Review,
    Stat,
} from "./types";

const isVet = (kind: string): boolean => kind === "veterinary";

/**
 * The last of the shared content, per trade.
 *
 * Eight constants in constants.ts were one general practice's content rendered
 * on every site on the farm. The urgent-care work fixed the pages that could
 * give dangerous advice; these are the rest, and on a veterinary site they
 * read as though nobody looked at the page:
 *
 *   STATS           "7 clinicians on the team" — contradicts the team shown
 *   ACCREDITATIONS  CQC, GMC, NMC — GB human regulators, wrong outside GB
 *   REVIEWS         a named human patient, seen for a paediatric problem
 *   PATIENT_STORY   a woman describing registering as a new patient
 *   PROMISES        appointment lengths quoted for human psychological care
 *   JOURNEY         written around a patient registering with a GP
 *   FAQS            GP questions about registration and referrals
 *
 * Each has a veterinary variant here and falls through to the human one
 * otherwise, the same shape as triageFor and urgentUnitsFor. Doing them one
 * at a time is what produced eight separate deploys; they are all here.
 */

const VET_STATS: readonly Stat[] = [
    { value: 4200, suffix: "+", label: "Animals seen a year" },
    { value: 98, suffix: "%", label: "Owners would recommend us" },
    { value: 2, suffix: " days", label: "Average wait to be seen" },
    { value: 5, suffix: "", label: "Vets and nurses on the team" },
];

/**
 * Accreditations, built from the country's own regulators.
 *
 * This used to be two hardcoded lists -- CQC/GMC/NMC for human trades and
 * RCVS for veterinary -- and both of those are British. Shipping them meant
 * a veterinary clinic in Miles City, Montana published "RCVS -- Practice
 * Standards Scheme accredited", and a US general practice published a CQC
 * inspection rating. Neither body has any jurisdiction in Montana and neither
 * practice has ever been inspected by one. That is a fabricated credential on
 * a page we put in front of a real prospect, which is worse than saying
 * nothing at all.
 *
 * The country already owns this: `brand.regulators` has named the local
 * doctor, nurse and inspectorate bodies per country all along. The list is
 * now derived from it, so adding a country means filling one pack rather
 * than remembering this file exists.
 *
 * Where a practice's accreditation is voluntary, the pack states LICENSURE
 * instead. A practice is licensed by operating at all; it holds a voluntary
 * accreditation only if it applied and passed, which we cannot know from
 * here. Only the GB packs name an inspection, because CQC registration is
 * mandatory there.
 */
/**
 * Which trades the country's headline inspectorate and nurse register
 * actually apply to.
 *
 * The trio on a Regulators pack -- inspectorate, doctor, nurse -- is written
 * for a hospital or a general practice, and it was being printed on every
 * non-veterinary trade. An optometry practice in Monroe, Louisiana therefore
 * published "Accredited by The Joint Commission", which accredits hospitals
 * and health systems and has never looked at an independent eye-care
 * practice; "State Medical Board", which licenses physicians while
 * optometrists answer to the State Board of Optometry; and a line about
 * registered nurses, in a practice that employs none.
 *
 * Three false claims on one card. So the trio is now used only where it is
 * true, and every other trade names its own licensing board.
 */
const MEDICAL_TRADES = new Set(["hospital", "general-practice", "dermatology"]);

/**
 * The board that licenses each trade, per country.
 *
 * Licensure, not accreditation: a practice is licensed by operating at all,
 * where a voluntary accreditation has to be applied for and passed. A trade
 * with no entry falls back to a claim that is true of any practice anywhere,
 * rather than borrowing the doctors' board.
 */
const TRADE_BOARDS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
    US: {
        optometry: "State Board of Optometry",
        dental: "State Dental Board",
        physio: "State Board of Physical Therapy",
        chiro: "State Board of Chiropractic",
        podiatry: "State Board of Podiatric Medicine",
        "mental-health": "State Board of Psychology",
    },
    GB: {
        optometry: "GOC",
        dental: "GDC",
        physio: "HCPC",
        chiro: "GCC",
        podiatry: "HCPC",
        "mental-health": "HCPC",
    },
};

function regulatorAccreditations(
    kind: string,
    regulators: Regulators,
    country: string,
): readonly Accreditation[] {
    if (isVet(kind)) {
        return [
            { label: regulators.vet, detail: regulators.vetNote },
            { label: "RVN", detail: "Nurses registered and revalidated" },
            { label: "Insured", detail: "Full professional liability cover" },
            { label: "ISO 27001", detail: "Client records held to standard" },
        ];
    }

    /* Hospitals and general practices are what the pack describes, so they
       get it: the inspectorate genuinely inspects them and they genuinely
       employ registered nurses. */
    if (MEDICAL_TRADES.has(kind)) {
        return [
            { label: regulators.inspectorate, detail: regulators.inspectorateNote },
            { label: regulators.doctor, detail: "All doctors on the register" },
            { label: regulators.nurse, detail: "Nurses registered and revalidated" },
            { label: "ISO 27001", detail: "Patient records held to standard" },
        ];
    }

    const board = TRADE_BOARDS[country]?.[kind];
    return [
        board === undefined
            ? { label: "Licensed", detail: "Every clinician licensed to practise" }
            : { label: board, detail: "Every clinician licensed and in good standing" },
        { label: "Insured", detail: "Full professional indemnity cover" },
        { label: "Audited", detail: "Infection control reviewed yearly" },
        { label: "ISO 27001", detail: "Patient records held to standard" },
    ];
}

const VET_REVIEWS: readonly Review[] = [
    {
        quote:
            "Rang at half eight on a Monday because the dog had stopped eating, and we were seen the same afternoon. They phoned the next day to ask how he was, which nobody has ever done before.",
        name: "Hannah W.",
        context: "Seen same day, off food",
        rating: 5,
    },
    {
        quote:
            "They talked me through the whole dental before it happened and the bill was what they said it would be. No surprise at the desk.",
        name: "Marcus D.",
        context: "Dental under anaesthetic",
        rating: 5,
    },
    {
        quote:
            "Our cat is terrified of the car and they see him in the quiet room at the end of the corridor so he does not have to sit with the dogs. Small thing, enormous difference.",
        name: "Priya N.",
        context: "Routine check-up",
        rating: 5,
    },
];

const VET_PATIENT_STORY: PatientStory = {
    quote:
        "He went off his food on the Sunday and I could not get anyone on the phone anywhere. I filled in two boxes that night and they rang me at nine on Monday with three times to choose from. He was in by lunchtime. That was the whole thing.",
    name: "Hannah",
    age: "34",
    context: "Registered a new pet, seen the same week",
    /* The shared film is a woman describing a GP registration. Until a
       veterinary one is filmed, the poster stands on its own — a still is a
       weaker page than a film, but it is not a false one. */
    video: "",
    poster: "/img/vet/reception.jpg",
    posterAlt:
        "The reception of a small veterinary practice, with a dog resting on the floor by a bench",
};

const VET_PROMISES: readonly Promise_[] = [
    {
        title: "We do the paperwork",
        body: "Insurance claims, referral letters and pet passport forms are handled here. You sign once.",
        icon: "files",
    },
    {
        title: "One vet who knows your animal",
        body: "The same vet each visit wherever we can, so you are never explaining the history again from the start.",
        icon: "headset",
    },
    {
        title: "A price before we start",
        body: "An estimate in writing before anything is booked, and a call before we go past it. Never a surprise at the desk.",
        icon: "wallet",
    },
    {
        title: "Parking at the door",
        body: "Right outside, which matters when you are carrying a carrier or a dog who cannot walk.",
        icon: "car",
    },
];

const VET_JOURNEY: readonly JourneyStep[] = [
    {
        step: 1,
        title: "Tell us what has happened",
        body: "Two fields to start. No account, no portal, no password to reset before you can ask for help.",
    },
    {
        step: 2,
        title: "We ring you back",
        body: "Usually within the hour in working time. We will ask a few questions so the right vet sees your animal.",
    },
    {
        step: 3,
        title: "A time, not a callback",
        body: "You leave the call with a day and a time, and an estimate for anything we already know you need.",
    },
    {
        step: 4,
        title: "Seen, and told what happens next",
        body: "Written up the same day, with what we found, what it costs and when to come back.",
    },
];

const VET_FAQS: readonly FaqItem[] = [
    {
        question: "Do I need to be registered before you will see my pet?",
        answer:
            "No. We will see a new animal the same week, and register them while you are here. Bring any vaccination card and the name of your previous practice if you have one.",
    },
    {
        question: "Do you take pet insurance directly?",
        answer:
            "We can claim directly with most insurers for larger treatment. For routine visits you pay on the day and we send you everything you need to claim it back.",
    },
    {
        question: "What happens out of hours?",
        answer:
            "We are not a 24-hour hospital. If we are closed, our answerphone names the emergency service covering us that night and how to reach them — ring us first and we will tell you where to go.",
    },
    {
        question: "Can I ask what something costs before booking?",
        answer:
            "Yes, and there is no charge for asking. Every routine price is published on this site, and anything that cannot be quoted up front says so and why.",
    },
];


/* ── optometry ───────────────────────────────────────────────────────── */
/**
 * An eye test is not an appointment with a doctor about an illness, and the
 * general practice content reads wrong in a specific way: it answers
 * questions about registering, referrals and being unwell. What an optometry
 * patient actually wants to know is whether the test covers the eye health
 * scan or just the prescription, whether they are about to be sold frames
 * they did not ask for, and whether the children's test works on a child who
 * cannot read a chart yet.
 */
const OPTOMETRY_STATS: readonly Stat[] = [
    { value: 5200, suffix: "+", label: "Eye examinations a year" },
    { value: 30, suffix: " min", label: "Length of a standard test" },
    { value: 97, suffix: "%", label: "Would recommend us" },
    { value: 4, suffix: "", label: "Optometrists on the team" },
];

const OPTOMETRY_REVIEWS: readonly Review[] = [
    {
        quote:
            "First time anyone has shown me the photographs of the back of my own eyes and talked me through what they were looking at. Thirty years of tests and nobody had done that.",
        name: "Ray T.",
        context: "Standard eye examination",
        rating: 5,
    },
    {
        quote:
            "They found a prescription change that explained the headaches I had been having at work for months. I came in about the headaches, not my eyes.",
        name: "Denise M.",
        context: "Test and new glasses",
        rating: 5,
    },
    {
        quote:
            "My daughter is six and cannot read yet. They tested her with pictures and shapes and she thought the whole thing was a game. No fight, no tears.",
        name: "Sam K.",
        context: "Children's eye test",
        rating: 5,
    },
];

const OPTOMETRY_PATIENT_STORY: PatientStory = {
    quote:
        "I had been squinting at the screen for a year and telling myself it was tiredness. The test took half an hour, they showed me the scan, and the new lenses fixed something I had stopped noticing was broken. I wish I had not waited.",
    name: "Denise",
    age: "41",
    context: "Came in about headaches, left with the cause",
    /* No filmed story and no optometry-specific still yet, so this uses the
       trade-neutral reception shot. It shows an empty reception desk, which
       is true of an eye-care practice and claims nothing about one. The alt
       text describes what is actually in the frame rather than the testing
       room we would like to be showing -- a caption that oversells the
       photograph is the same class of problem as the RCVS line was. */
    video: "",
    poster: "/img/reception.jpg",
    posterAlt:
        "The reception desk of a small practice, lit by a window onto the street",
};

const OPTOMETRY_PROMISES: readonly Promise_[] = [
    {
        title: "The eye health scan is in the test",
        body: "Retinal photography and pressure check included in the standard price. Not an upsell at the chair, not a separate booking.",
        icon: "files",
    },
    {
        title: "The same optometrist each time",
        body: "So the comparison with last year's scan is made by the person who took it, not read cold off a file.",
        icon: "headset",
    },
    {
        title: "No pressure on frames",
        body: "Your prescription is yours. Take it and buy your glasses wherever you like -- we will still adjust them for you.",
        icon: "wallet",
    },
    {
        title: "Half an hour, not ten minutes",
        body: "Long enough to test properly and to answer what you actually came in to ask.",
        icon: "car",
    },
];

const OPTOMETRY_JOURNEY: readonly JourneyStep[] = [
    {
        step: 1,
        title: "Book a test",
        body: "Two fields. No account, no portal, and no need to be an existing patient.",
    },
    {
        step: 2,
        title: "Thirty minutes in the chair",
        body: "Vision, prescription, eye pressure and a retinal photograph, with the optometrist explaining as they go.",
    },
    {
        step: 3,
        title: "You see your own results",
        body: "The scan on the screen, what it shows, and what has changed since last time if we have seen you before.",
    },
    {
        step: 4,
        title: "Frames only if you want them",
        body: "You leave with your prescription either way, and a reminder when your next test is due.",
    },
];

const OPTOMETRY_FAQS: readonly FaqItem[] = [
    {
        question: "Does the test include the eye health check, or is that extra?",
        answer:
            "It is included. Retinal photography and a pressure check are part of the standard examination at the standard price. We do not run a cheaper test and then charge for the part that spots disease.",
    },
    {
        question: "Can I take my prescription elsewhere to buy glasses?",
        answer:
            "Yes, and we will hand it to you without being asked. It is your prescription. If you buy frames elsewhere and they need adjusting, bring them in and we will do it.",
    },
    {
        question: "How young can a child be tested?",
        answer:
            "From around three. A child does not need to know their letters -- we test with pictures, shapes and matching games, and we can tell a great deal from how the eyes behave without asking the child anything.",
    },
    {
        question: "How often should I be tested?",
        answer:
            "Every two years for most adults, yearly over 70, yearly for children, and yearly if you are diabetic or there is glaucoma in the family. We will tell you which applies to you and remind you when it is due.",
    },
];


/**
 * One row per trade. A trade that does not override a field falls through to
 * the general practice's version, which is the honest default: it is real
 * content written for a real clinic, just not this one's.
 *
 * This replaced a chain of `isVet(kind) ? VET_X : X` ternaries. That shape
 * was fine for one trade and became a lie the moment a second one arrived --
 * optometry is not veterinary, so `isVet` returned false and an eye-care
 * practice quietly served a GP's registration FAQs. Adding a trade is now a
 * row here, and forgetting a field degrades to the default rather than to
 * whatever the previous branch happened to be.
 */
interface TradeContent {
    readonly stats: readonly Stat[];
    readonly reviews: readonly Review[];
    readonly patientStory: PatientStory;
    readonly promises: readonly Promise_[];
    readonly journey: readonly JourneyStep[];
    readonly faqs: readonly FaqItem[];
}

const BY_TRADE: Readonly<Record<string, Partial<TradeContent>>> = {
    veterinary: {
        stats: VET_STATS,
        reviews: VET_REVIEWS,
        patientStory: VET_PATIENT_STORY,
        promises: VET_PROMISES,
        journey: VET_JOURNEY,
        faqs: VET_FAQS,
    },
    optometry: {
        stats: OPTOMETRY_STATS,
        reviews: OPTOMETRY_REVIEWS,
        patientStory: OPTOMETRY_PATIENT_STORY,
        promises: OPTOMETRY_PROMISES,
        journey: OPTOMETRY_JOURNEY,
        faqs: OPTOMETRY_FAQS,
    },
};

export const statsFor = (kind: string): readonly Stat[] => BY_TRADE[kind]?.stats ?? STATS;
export const reviewsFor = (kind: string): readonly Review[] => BY_TRADE[kind]?.reviews ?? REVIEWS;
export const patientStoryFor = (kind: string): PatientStory =>
    BY_TRADE[kind]?.patientStory ?? PATIENT_STORY;
export const promisesFor = (kind: string): readonly Promise_[] =>
    BY_TRADE[kind]?.promises ?? PROMISES;
export const journeyFor = (kind: string): readonly JourneyStep[] =>
    BY_TRADE[kind]?.journey ?? JOURNEY;
export const faqsFor = (kind: string): readonly FaqItem[] => BY_TRADE[kind]?.faqs ?? FAQS;

export const accreditationsFor = (
    kind: string,
    regulators: Regulators,
    country: string,
): readonly Accreditation[] => regulatorAccreditations(kind, regulators, country);

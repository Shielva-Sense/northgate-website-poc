import {
    ACCREDITATIONS,
    FAQS,
    JOURNEY,
    PATIENT_STORY,
    PROMISES,
    REVIEWS,
    STATS,
} from "./constants";
import type {
    Accreditation,
    FaqItem,
    JourneyStep,
    PatientStory,
    Promise_,
    Review,
    Stat,
} from "./types";

/**
 * The last of the shared content, per trade.
 *
 * Eight constants in constants.ts were one general practice's content rendered
 * on every site on the farm. The urgent-care work fixed the pages that could
 * give dangerous advice; these are the rest, and on a veterinary site they
 * read as though nobody looked at the page:
 *
 *   STATS           "7 clinicians on the team" — contradicts the team shown
 *   ACCREDITATIONS  CQC, GMC, NMC — human regulators, wrong for a vet anywhere
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

/* The RCVS is the veterinary regulator. CQC, GMC and NMC regulate human
   services and mean nothing on a veterinary practice — claiming one you are
   not inspected by is the worst of these to get wrong. */
const VET_ACCREDITATIONS: readonly Accreditation[] = [
    { label: "RCVS", detail: "Practice Standards Scheme accredited" },
    { label: "RCVS", detail: "All vets on the register, annually declared" },
    { label: "RVN", detail: "Nurses registered and revalidated" },
    { label: "ISO 27001", detail: "Client records held to standard" },
];

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

const isVet = (kind: string): boolean => kind === "veterinary";

export const statsFor = (kind: string): readonly Stat[] => (isVet(kind) ? VET_STATS : STATS);
export const accreditationsFor = (kind: string): readonly Accreditation[] =>
    isVet(kind) ? VET_ACCREDITATIONS : ACCREDITATIONS;
export const reviewsFor = (kind: string): readonly Review[] => (isVet(kind) ? VET_REVIEWS : REVIEWS);
export const patientStoryFor = (kind: string): PatientStory =>
    isVet(kind) ? VET_PATIENT_STORY : PATIENT_STORY;
export const promisesFor = (kind: string): readonly Promise_[] =>
    isVet(kind) ? VET_PROMISES : PROMISES;
export const journeyFor = (kind: string): readonly JourneyStep[] =>
    isVet(kind) ? VET_JOURNEY : JOURNEY;
export const faqsFor = (kind: string): readonly FaqItem[] => (isVet(kind) ? VET_FAQS : FAQS);

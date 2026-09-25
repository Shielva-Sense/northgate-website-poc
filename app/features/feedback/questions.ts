/**
 * The discovery panel.
 *
 * This is the commercial half of the demo: the prospect is already looking at
 * their own site in their own colours, and this captures everything needed to
 * quote and build the real one — while they are still interested, in one pass,
 * without a discovery call that takes a fortnight to schedule.
 *
 * Question design rules used throughout:
 *
 * - Every question is one a build genuinely blocks on. "What's your budget?"
 *   is not here because it does not change what we build, only whether.
 * - Options are written as the client would say them, not as we would spec
 *   them: "I use GoHighLevel" rather than "external CRM integration".
 * - Nothing is required except a way to reply. A panel that will not submit
 *   until twenty answers are given gets zero answers.
 * - Anything that implies a promise we cannot keep is worded as a question,
 *   never as a claim — particularly around data residency and compliance,
 *   where a confident wrong answer is a liability rather than a sale.
 */

export type QuestionKind = "single" | "multi" | "text";

export interface Question {
    readonly id: string;
    readonly label: string;
    /** Why we are asking. Shown under the question — it raises answer rates. */
    readonly why?: string;
    readonly kind: QuestionKind;
    readonly options?: readonly string[];
    readonly placeholder?: string;
}

export interface QuestionGroup {
    readonly id: string;
    readonly title: string;
    readonly blurb: string;
    readonly questions: readonly Question[];
}

export const GROUPS: readonly QuestionGroup[] = [
    {
        id: "look",
        title: "How it looks",
        blurb: "You are looking at one of four layouts and one of eight palettes. Tell us if it is wrong — swapping either is a setting, not a rebuild.",
        questions: [
            {
                id: "theme_ok",
                label: "Are these the right colours?",
                kind: "single",
                options: [
                    "Yes, keep them",
                    "Close, needs adjusting",
                    "No — we have brand colours to match",
                    "Not sure, show me options",
                ],
                why: "If you have a brand guide we match it exactly rather than guessing.",
            },
            {
                id: "layout_ok",
                label: "Is this the right layout?",
                kind: "single",
                options: [
                    "Yes, this one",
                    "Try a different one",
                    "Mix of two",
                    "Not sure yet",
                ],
            },
            {
                id: "tone",
                label: "Anything about the tone or wording that feels off?",
                kind: "text",
                placeholder: "Too formal, too casual, says something we would never say…",
            },
        ],
    },
    {
        id: "pages",
        title: "Pages and content",
        blurb: "What the site needs to cover, and what you already have to fill it with.",
        questions: [
            {
                id: "pages_needed",
                label: "Which pages do you need?",
                kind: "multi",
                options: [
                    "Home",
                    "Services / treatments",
                    "Find a doctor",
                    "Appointments",
                    "Urgent care / A&E",
                    "Health library",
                    "About / our story",
                    "Careers",
                    "Insurance and pricing",
                    "Contact",
                    "Patient portal login",
                    "Blog / news",
                ],
            },
            {
                id: "content_ready",
                label: "What do you already have?",
                kind: "multi",
                options: [
                    "Clinician photos",
                    "Clinician bios",
                    "Real prices",
                    "Logo and brand guide",
                    "Photos of the premises",
                    "Existing website copy",
                    "None of it yet",
                ],
                why: "Everything on this demo is placeholder — the imagery is generated and the practice is fictional. Real photos and real prices are what make it yours.",
            },
            {
                id: "languages",
                label: "Which languages does the site need?",
                kind: "text",
                placeholder: "English only, or English + Arabic, Hindi…",
            },
        ],
    },
    {
        id: "hosting",
        title: "Where it lives",
        blurb: "Where the site is hooked up, and who can change it after launch.",
        questions: [
            {
                id: "domain",
                label: "What domain should it run on?",
                kind: "text",
                placeholder: "yourclinic.com — and say if you do not own it yet",
                why: "If you do not control the DNS yet, that is usually the longest pole in the tent.",
            },
            {
                id: "existing_site",
                label: "Is there an existing site?",
                kind: "single",
                options: [
                    "Yes — replace it",
                    "Yes — keep it, this is additional",
                    "No, this is the first",
                ],
            },
            {
                id: "manage",
                label: "How do you want to edit pages afterwards?",
                why: "Plenty of clinics run pages through GoHighLevel already. If that is working for you we build into it rather than around it.",
                kind: "single",
                options: [
                    "We already use GoHighLevel — build into it",
                    "We use WordPress / Wix / Squarespace",
                    "Build us a proper editor of our own",
                    "We do not want to edit it — you maintain it",
                    "Not sure — recommend something",
                ],
            },
            {
                id: "editor_scope",
                label: "If we built you an editor, what must you be able to change without us?",
                kind: "multi",
                options: [
                    "Text on any page",
                    "Prices",
                    "Clinician profiles and photos",
                    "Opening hours",
                    "Availability and slots",
                    "News / blog posts",
                    "Adding whole new pages",
                ],
            },
        ],
    },
    {
        id: "data",
        title: "Where the data goes",
        blurb: "Patient enquiries are health data in almost every jurisdiction. This decides more of the build than anything else on this list.",
        questions: [
            {
                id: "data_home",
                label: "Where should enquiries and bookings be stored?",
                kind: "single",
                options: [
                    "Shielva hosts it for us",
                    "Into our CRM (GoHighLevel, HubSpot, Salesforce…)",
                    "Our own servers / database",
                    "Our practice management system",
                    "Email only, store nothing",
                    "Not sure — advise us",
                ],
            },
            {
                id: "residency",
                label: "Does the data have to stay in a particular country?",
                why: "This is a hard constraint, not a preference — it decides where anything can be hosted at all. Tell us the regulator if you know it.",
                kind: "single",
                options: [
                    "UK only",
                    "EU / EEA only",
                    "India only",
                    "United States only",
                    "No restriction",
                    "Not sure — we need advice",
                ],
            },
            {
                id: "compliance",
                label: "Which of these apply to you?",
                kind: "multi",
                options: [
                    "UK GDPR / ICO registered",
                    "EU GDPR",
                    "HIPAA (United States)",
                    "CQC registered",
                    "India DPDP Act",
                    "We need a data processing agreement",
                    "None that we know of",
                    "Not sure",
                ],
            },
            {
                id: "systems",
                label: "What does it need to talk to?",
                kind: "multi",
                options: [
                    "Practice management / EMR",
                    "Google Calendar",
                    "Outlook / Microsoft 365",
                    "Stripe or another payment provider",
                    "Xero / QuickBooks",
                    "Mailchimp or similar",
                    "Nothing yet",
                ],
            },
        ],
    },
    {
        id: "growth",
        title: "Booking and enquiries",
        blurb: "The website is the front door. This is what happens after someone knocks.",
        questions: [
            {
                id: "booking",
                label: "How should appointments work?",
                kind: "single",
                options: [
                    "Real-time booking against live availability",
                    "Request a time, reception confirms",
                    "Enquiry form only, we ring back",
                    "Phone only for now",
                ],
            },
            {
                id: "channels",
                label: "Where do your patients actually come from?",
                why: "We can route WhatsApp, Instagram and Messenger enquiries into the same place as the website ones, so nothing is answered twice or missed.",
                kind: "multi",
                options: [
                    "Google search",
                    "Instagram",
                    "WhatsApp",
                    "Facebook / Messenger",
                    "Word of mouth and referrals",
                    "Paid ads",
                    "Insurer directories",
                ],
            },
            {
                id: "automation",
                label: "Which of these would actually save you time?",
                kind: "multi",
                options: [
                    "Auto-reply to enquiries out of hours",
                    "Appointment reminders by SMS or WhatsApp",
                    "A bot that answers common questions",
                    "Voice agent that answers the phone",
                    "Follow-up when someone does not book",
                    "Reviews requested after a visit",
                    "None — just the website for now",
                ],
            },
            {
                id: "who_answers",
                label: "Who answers enquiries today, and how quickly?",
                kind: "text",
                placeholder: "Two receptionists, 9–5, usually within the hour…",
                why: "It decides whether booking should be instant or request-and-confirm. Instant booking with nobody watching the calendar goes wrong quickly.",
            },
        ],
    },
    {
        id: "practical",
        title: "Practicalities",
        blurb: "The last few things that decide the shape of a quote.",
        questions: [
            {
                id: "timeline",
                label: "When do you need it live?",
                kind: "single",
                options: [
                    "Within 2 weeks",
                    "Within a month",
                    "1–3 months",
                    "No fixed date",
                ],
            },
            {
                id: "tracking",
                label: "Do you need marketing tracking?",
                why: "Meta Pixel plus the Conversions API is the usual pairing — the Pixel alone now misses a large share of conversions.",
                kind: "multi",
                options: [
                    "Meta Pixel + Conversions API",
                    "Google Analytics",
                    "Google Ads conversion tracking",
                    "Call tracking",
                    "None",
                    "Not sure",
                ],
            },
            {
                id: "decider",
                label: "Who else needs to see this before you decide?",
                kind: "text",
                placeholder: "A partner, a practice manager, the board…",
            },
            {
                id: "anything",
                label: "Anything we have not asked about?",
                kind: "text",
                placeholder: "The thing you were expecting us to ask and we did not.",
            },
        ],
    },
];

/** Every question id, for validating what comes back without trusting it. */
export const QUESTION_IDS: readonly string[] = GROUPS.flatMap((group) =>
    group.questions.map((question) => question.id),
);

export const RATING_LABELS: readonly string[] = [
    "Not working",
    "Needs work",
    "Fine",
    "Good",
    "Exactly right",
];

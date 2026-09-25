/**
 * The service catalogue and the health library.
 *
 * Three groups, because that is how people actually look for care: by the
 * speciality they think they need, by the procedure they have been told to
 * have, or by the practical thing they want (a scan, a prescription, a second
 * opinion). Cleveland Clinic splits it the same way for the same reason.
 *
 * Every treatment maps to a department id from care.ts, so anything in the
 * catalogue can hand straight off to the booking flow.
 *
 * 🚨 The health-library text here is placeholder. It is deliberately general,
 * carries no dosages, no diagnoses and no treatment recommendations, and every
 * article ends by pointing at a person. Before a real practice publishes any
 * of it, a named clinician has to review and own it — see IMAGERY.md.
 */

export interface Treatment {
    readonly slug: string;
    readonly name: string;
    /** Department id from care.ts — this is what makes it bookable. */
    readonly department: string;
    readonly summary: string;
}

export interface AdditionalService {
    readonly slug: string;
    readonly name: string;
    readonly summary: string;
    /** Some of these are walk-in or referral-only rather than bookable. */
    readonly bookable: boolean;
}

export interface Article {
    readonly slug: string;
    readonly title: string;
    readonly topic: string;
    readonly summary: string;
    readonly sections: readonly { readonly heading: string; readonly body: string }[];
    /** Plain-language prompts to stop reading and speak to someone. */
    readonly seeSomeoneIf: readonly string[];
    readonly department: string;
}

export const TREATMENTS: readonly Treatment[] = [
    {
        slug: "blood-pressure-review",
        name: "Blood pressure review",
        department: "cardiometabolic",
        summary: "A reading, a look at the trend, and a plan you actually agree with.",
    },
    {
        slug: "diabetes-review",
        name: "Diabetes annual review",
        department: "cardiometabolic",
        summary: "Bloods, feet, eyes and medication, in one appointment rather than four.",
    },
    {
        slug: "cervical-screening",
        name: "Cervical screening",
        department: "womens",
        summary: "Booked with a female clinician as standard, and never rushed.",
    },
    {
        slug: "menopause-review",
        name: "Menopause review",
        department: "womens",
        summary: "Thirty minutes to go through symptoms, options and what you want from treatment.",
    },
    {
        slug: "contraception",
        name: "Contraception",
        department: "womens",
        summary: "Including fittings and removals, with time to talk through the choice.",
    },
    {
        slug: "mole-check",
        name: "Mole and skin check",
        department: "general",
        summary: "Dermatoscope examination, photographed so change can be compared later.",
    },
    {
        slug: "joint-injection",
        name: "Joint injection",
        department: "general",
        summary: "For shoulder, knee and small-joint pain, done here rather than in hospital.",
    },
    {
        slug: "childhood-vaccinations",
        name: "Childhood vaccinations",
        department: "paediatrics",
        summary: "The full schedule, with catch-up appointments if you have fallen behind.",
    },
    {
        slug: "talking-therapy-referral",
        name: "Talking therapy referral",
        department: "mental-health",
        summary: "A longer appointment first, then a referral we chase rather than hand over.",
    },
];

export const ADDITIONAL_SERVICES: readonly AdditionalService[] = [
    {
        slug: "imaging",
        name: "Imaging and X-ray",
        summary: "Referred on site, usually within a week, with results back to us directly.",
        bookable: false,
    },
    {
        slug: "labs",
        name: "Labs and phlebotomy",
        summary: "Blood taken here, most results back inside two working days.",
        bookable: true,
    },
    {
        slug: "pharmacy",
        name: "Prescriptions",
        summary: "Repeat prescriptions issued the same day, sent to the pharmacy you choose.",
        bookable: false,
    },
    {
        slug: "second-opinion",
        name: "Second opinions",
        summary: "A fresh read of a diagnosis or a plan, with your notes gathered for you.",
        bookable: true,
    },
    {
        slug: "urgent-same-day",
        name: "Same-day urgent slots",
        summary: "Held back each morning for things that cannot wait until next week.",
        bookable: true,
    },
    {
        slug: "occupational-health",
        name: "Occupational health",
        summary: "Fitness-to-work assessments and reports, usually for an employer.",
        bookable: true,
    },
];

export const ARTICLES: readonly Article[] = [
    {
        slug: "high-blood-pressure",
        title: "High blood pressure",
        topic: "Heart and circulation",
        summary:
            "Usually has no symptoms at all, which is why it is found at a check rather than felt.",
        sections: [
            {
                heading: "What it is",
                body: "Blood pressure is the force of blood against the walls of your arteries. It is written as two numbers. It goes up and down through the day, so a single high reading is not the same as having high blood pressure — which is why we usually measure more than once, and often ask you to take readings at home.",
            },
            {
                heading: "Why it matters",
                body: "Left high over years it puts strain on the heart, the arteries, the kidneys and the eyes. That happens quietly, which is the reason it is worth checking even when you feel completely well.",
            },
            {
                heading: "What a review involves",
                body: "A reading, a look at the trend rather than one number, blood and urine tests, and a conversation about the things that move it — sleep, alcohol, salt, weight, stress and, where it helps, medication.",
            },
        ],
        seeSomeoneIf: [
            "You have a reading of 180/120 or higher",
            "You have a severe headache with vision changes",
            "You are pregnant and your blood pressure is rising",
        ],
        department: "cardiometabolic",
    },
    {
        slug: "menopause",
        title: "Menopause and perimenopause",
        topic: "Women's health",
        summary:
            "Symptoms often start years before periods stop, and are frequently put down to something else.",
        sections: [
            {
                heading: "What is happening",
                body: "Perimenopause is the stretch before periods stop, when hormone levels swing rather than simply fall. That swinging is why symptoms come and go, and why they can be hard to connect to one cause.",
            },
            {
                heading: "What people notice",
                body: "Changes to periods, hot flushes, broken sleep, joint aches, low mood, anxiety, brain fog and changes to libido. Not everyone gets all of them, and the ones people find hardest are often not the ones they expected.",
            },
            {
                heading: "What can be done",
                body: "There are several options, including hormone replacement, non-hormonal medication and changes to sleep and exercise. Which is right depends on your symptoms, your history and what matters to you — which is a conversation, not a leaflet.",
            },
        ],
        seeSomeoneIf: [
            "You have bleeding after your periods have stopped",
            "Bleeding is much heavier than usual or between periods",
            "Low mood is affecting your daily life",
        ],
        department: "womens",
    },
    {
        slug: "child-fever",
        title: "Fever in children",
        topic: "Child health",
        summary: "Common, usually viral, and occasionally the one thing that should not wait.",
        sections: [
            {
                heading: "What a fever is",
                body: "A temperature of 38C or above. It is the body responding to infection, and the number on the thermometer matters less than how your child is behaving.",
            },
            {
                heading: "What to watch",
                body: "How alert they are, whether they are drinking, whether they are passing urine, their breathing, and their skin colour. A child who is drinking, alert between temperatures and playing is usually reassuring, whatever the number says.",
            },
        ],
        seeSomeoneIf: [
            "Your baby is under 3 months and has any fever — this needs urgent assessment",
            "A rash does not fade when pressed with a glass",
            "They are unusually drowsy, floppy, or hard to wake",
            "Breathing is fast, laboured or grunting",
        ],
        department: "paediatrics",
    },
    {
        slug: "low-mood-anxiety",
        title: "Low mood and anxiety",
        topic: "Mental health",
        summary: "Extremely common, treatable, and consistently left too long before asking.",
        sections: [
            {
                heading: "When it is worth raising",
                body: "There is no threshold you have to reach. If it is affecting your sleep, your work or the people around you, that is reason enough. You do not need to have a diagnosis, or to have tried everything else first.",
            },
            {
                heading: "What an appointment looks like",
                body: "A longer appointment than usual, because ten minutes is not enough. Mostly listening, then talking through options — which may be talking therapy, medication, both, or neither.",
            },
        ],
        seeSomeoneIf: [
            "You have thoughts of harming yourself — contact emergency services now",
            "You cannot keep yourself safe",
            "You have stopped eating or drinking normally",
        ],
        department: "mental-health",
    },
    {
        slug: "moles-and-skin-changes",
        title: "Moles and skin changes",
        topic: "Skin",
        summary: "Most changes are harmless. The ones that are not are best caught early.",
        sections: [
            {
                heading: "What to look for",
                body: "Changes in size, shape or colour, an uneven edge, more than one colour in the same mole, itching, bleeding, or a sore that does not heal within a few weeks. A mole that looks different from your others is worth showing someone.",
            },
            {
                heading: "What a check involves",
                body: "An examination with a dermatoscope, photographs so any change can be compared later, and a referral if anything needs a specialist opinion.",
            },
        ],
        seeSomeoneIf: [
            "A mole is changing quickly",
            "A mole is bleeding or will not heal",
            "A new mark looks different from all your others",
        ],
        department: "general",
    },
    {
        slug: "type-2-diabetes",
        title: "Type 2 diabetes",
        topic: "Heart and circulation",
        summary: "Often found on a routine blood test before anyone feels unwell.",
        sections: [
            {
                heading: "What it is",
                body: "A condition where blood sugar stays higher than it should, because the body either does not make enough insulin or does not respond to it properly. It develops gradually.",
            },
            {
                heading: "What a review covers",
                body: "Blood tests, blood pressure, weight, a foot check, a reminder about eye screening, and a look at medication. It is one appointment rather than several, which is the point of doing it annually.",
            },
        ],
        seeSomeoneIf: [
            "You are very thirsty and passing urine much more than usual",
            "You have lost weight without trying",
            "A cut or sore on your foot is not healing",
        ],
        department: "cardiometabolic",
    },
];

export function articleBySlug(slug: string): Article | undefined {
    return ARTICLES.find((a) => a.slug === slug);
}

export const ARTICLE_TOPICS: readonly string[] = [
    ...new Set(ARTICLES.map((article) => article.topic)),
];

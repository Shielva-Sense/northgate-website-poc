import type {
    Accreditation,
    PatientStory,
    Promise_,
    Clinician,
    Facility,
    FaqItem,
    JourneyStep,
    OpeningDay,
    Package,
    Review,
    Service,
    Stat,
} from "./types";

/**
 * Sample content for a fictional practice. Nothing here describes a real
 * clinic, clinician or patient — it exists to demonstrate the build.
 */

export const CLINIC = {
    name: "Northgate Family Health",
    strapline: "See a named doctor this week, not in three",
    phone: "+44 20 7946 0958",
    phoneHref: "tel:+442079460958",
    email: "reception@northgate.example",
    address: "42 Northgate Street, Manchester, M3 2WY",
    rating: "4.9",
    ratingCount: "1,240",
    emergencyNote:
        "If this is a medical emergency, call 999 or go to your nearest A&E. Do not use this form.",
} as const;

/** Rotating reassurance. Short enough to read in a glance at the top of the page. */
export const ANNOUNCEMENTS: readonly string[] = [
    "Same-week appointments, seven clinicians, one phone call",
    "Most blood results back inside two working days",
    "Evening clinics until 18:30, Monday to Thursday",
    "Fixed prices published in full — no consultation fee to ask",
];

export const STATS: readonly Stat[] = [
    { value: 12400, suffix: "+", label: "Appointments a year" },
    { value: 98, suffix: "%", label: "Would recommend us" },
    { value: 3, suffix: " days", label: "Average wait to be seen" },
    { value: 7, suffix: "", label: "Clinicians on the team" },
];

export const ACCREDITATIONS: readonly Accreditation[] = [
    { label: "CQC", detail: "Rated Good, last inspection 2025" },
    { label: "GMC", detail: "All doctors on the specialist register" },
    { label: "NMC", detail: "Nurses registered and revalidated" },
    { label: "ISO 27001", detail: "Patient records held to standard" },
];

export const CLINICIANS: readonly Clinician[] = [
    {
        name: "Dr Alice Whitfield",
        role: "GP Partner",
        focus: "Diabetes, heart health and long-term conditions",
        initials: "AW",
        departments: ["general", "cardiometabolic"],
        qualifications: "MBBS, MRCGP, DRCOG",
        rating: 4.9,
        reviews: 412,
        fee: "£68",
        years: 24,
        registration: "GMC 3•••421",
        languages: ["English"],
        site: "Northgate Street",
        nextSlot: { day: "Tomorrow", time: "09:20" },
        photo: "/img/team/whitfield.jpg",
    },
    {
        name: "Dr Priya Nandakumar",
        role: "GP",
        focus: "Women's health, menopause and mental health",
        initials: "PN",
        departments: ["womens", "mental-health", "general"],
        qualifications: "MBBS, MRCGP, DFSRH",
        rating: 5.0,
        reviews: 388,
        fee: "£68",
        years: 16,
        registration: "GMC 6•••095",
        languages: ["English", "Hindi", "Tamil"],
        site: "Northgate Street",
        nextSlot: { day: "Tomorrow", time: "14:00" },
        photo: "/img/team/nandakumar.jpg",
    },
    {
        name: "Samuel Okonkwo",
        role: "Advanced Nurse Practitioner",
        focus: "Minor illness, child health and same-day triage",
        initials: "SO",
        departments: ["general", "paediatrics"],
        qualifications: "RN, MSc Advanced Practice",
        rating: 4.9,
        reviews: 260,
        fee: "£48",
        years: 12,
        registration: "NMC 1•••7C",
        languages: ["English", "Igbo"],
        site: "Northgate Street",
        nextSlot: { day: "Today", time: "16:45" },
        photo: "/img/team/okonkwo.jpg",
    },
    {
        name: "Mariana Duarte",
        role: "Practice Nurse",
        focus: "Vaccinations, travel health and health checks",
        initials: "MD",
        departments: ["travel", "paediatrics"],
        qualifications: "RN, BSc Nursing",
        rating: 4.8,
        reviews: 180,
        fee: "£38",
        years: 9,
        registration: "NMC 2•••4B",
        languages: ["English", "Portuguese", "Spanish"],
        site: "Northgate Street",
        nextSlot: { day: "Today", time: "17:10" },
        photo: "/img/team/duarte.jpg",
    },
    /* No headshot for these yet, so the card renders the designed monogram.
       A stock face on a named clinician would be a lie about a real person,
       which is the one thing this page cannot do. */
    {
        name: "Dr Ifeoma Bello",
        role: "Consultant Paediatrician",
        focus: "Childhood illness, asthma and development",
        initials: "IB",
        departments: ["paediatrics"],
        qualifications: "MBBS, MRCPCH",
        rating: 4.9,
        reviews: 268,
        fee: "£95",
        years: 17,
        registration: "GMC 6•••118",
        languages: ["English", "Yoruba"],
        site: "Northgate Street",
        nextSlot: { day: "Today", time: "15:30" },
    },
    {
        name: "Dr Hannah Sorensen",
        role: "Women's Health Lead",
        focus: "Menopause, contraception and gynaecology",
        initials: "HS",
        departments: ["womens"],
        qualifications: "MBChB, MRCGP, DFSRH",
        rating: 4.8,
        reviews: 331,
        fee: "£78",
        years: 15,
        registration: "GMC 7•••902",
        languages: ["English", "Danish"],
        site: "Southbank Road",
        nextSlot: { day: "Tomorrow", time: "10:40" },
    },
    {
        name: "Dr Omar Haddad",
        role: "GP & Travel Medicine",
        focus: "Travel risk, vaccination and general practice",
        initials: "OH",
        departments: ["travel", "general"],
        qualifications: "MBBS, MRCGP, DTM&H",
        rating: 4.7,
        reviews: 194,
        fee: "£68",
        years: 11,
        registration: "GMC 7•••455",
        languages: ["English", "Arabic", "French"],
        site: "Southbank Road",
        nextSlot: { day: "Thu 2 Oct", time: "11:20" },
    },
    {
        name: "Ruth Ellery",
        role: "Clinical Psychologist",
        focus: "Anxiety, low mood and sleep",
        initials: "RE",
        departments: ["mental-health"],
        qualifications: "DClinPsy, HCPC registered",
        rating: 4.9,
        reviews: 142,
        fee: "£110",
        years: 13,
        registration: "HCPC PYL•••27",
        languages: ["English"],
        site: "Northgate Street",
        nextSlot: { day: "Tomorrow", time: "16:00" },
    },
    {
        name: "Dr Wei Lin Chen",
        role: "Consultant Cardiologist",
        focus: "Blood pressure, rhythm and cardiovascular risk",
        initials: "WC",
        departments: ["cardiometabolic"],
        qualifications: "MBBS, MRCP, PhD",
        rating: 5.0,
        reviews: 97,
        fee: "£145",
        years: 21,
        registration: "GMC 4•••730",
        languages: ["English", "Mandarin", "Cantonese"],
        site: "Southbank Road",
        nextSlot: { day: "Fri 3 Oct", time: "09:00" },
    },
];

export const SERVICES: readonly Service[] = [
    {
        slug: "gp",
        name: "General practice",
        summary:
            "Routine appointments, ongoing conditions and anything you would normally see your GP about.",
        duration: "15 min",
        icon: "stethoscope",
    },
    {
        slug: "vaccinations",
        name: "Vaccinations & travel",
        summary:
            "Seasonal jabs, childhood schedules and travel vaccines with a destination risk check.",
        duration: "20 min",
        icon: "syringe",
    },
    {
        slug: "health-checks",
        name: "Health checks",
        summary:
            "Blood pressure, cholesterol, diabetes screening and a written summary you keep.",
        duration: "30 min",
        icon: "heartPulse",
    },
    {
        slug: "child-health",
        name: "Child health",
        summary: "Development reviews, common childhood illness and feeding support.",
        duration: "20 min",
        icon: "baby",
    },
    {
        slug: "mental-health",
        name: "Mental health",
        summary:
            "Longer appointments for low mood, anxiety and sleep, with onward referral where it helps.",
        duration: "30 min",
        icon: "brain",
    },
    {
        slug: "bloods",
        name: "Bloods & diagnostics",
        summary: "On-site phlebotomy with most results back inside two working days.",
        duration: "10 min",
        icon: "flaskConical",
    },
];

export const PACKAGES: readonly Package[] = [
    {
        slug: "single",
        name: "Single appointment",
        price: "£68",
        cadence: "per visit",
        summary: "One appointment with the clinician you choose. Nothing to join.",
        includes: [
            "20 minutes with a named clinician",
            "Written summary of what was said",
            "Prescription issued the same day",
            "A follow-up message if results are pending",
        ],
    },
    {
        slug: "family",
        name: "Family cover",
        price: "£39",
        cadence: "per month",
        summary: "Two adults and up to three children, seen as often as you need.",
        includes: [
            "Unlimited appointments for everyone named",
            "Same-week booking, guaranteed in writing",
            "Annual health check for each adult",
            "Childhood vaccinations at no extra cost",
            "Blood tests on site, results in two days",
            "Cancel any month, no notice period",
        ],
        featured: true,
    },
    {
        slug: "checkup",
        name: "Full health check",
        price: "£190",
        cadence: "one off",
        summary: "A morning of tests and an hour to go through every result.",
        includes: [
            "Bloods, blood pressure, ECG and lung function",
            "60-minute review with a GP partner",
            "Written report you keep and can share",
            "Referral letters arranged where needed",
        ],
    },
];

export const JOURNEY: readonly JourneyStep[] = [
    {
        step: 1,
        title: "Tell us what you need",
        body: "Two fields to start. No account, no portal, no password to reset before you can ask for help.",
    },
    {
        step: 2,
        title: "We confirm a real time",
        body: "Within the hour during opening hours, with the clinician's name on it — not a promise to ring you back at some point.",
    },
    {
        step: 3,
        title: "You are seen, unhurried",
        body: "Twenty minutes as standard, thirty for anything mental health related. We run to time because we book to time.",
    },
    {
        step: 4,
        title: "Everything in writing",
        body: "A summary of what was said, what happens next, and who to contact. Results follow as soon as they land.",
    },
];

export const REVIEWS: readonly Review[] = [
    {
        quote:
            "Rang at half eight on a Monday with a poorly toddler and had a nurse appointment at twenty past four the same day. I have never had that anywhere else.",
        name: "Hannah W.",
        context: "Child health, seen same day",
        rating: 5,
    },
    {
        quote:
            "Dr Nandakumar gave me half an hour and actually listened. After two years of being told it was stress, I finally have a diagnosis and a plan.",
        name: "Ruth A.",
        context: "Menopause care",
        rating: 5,
    },
    {
        quote:
            "The price is on the website, which is why I called. No consultation fee to ask a question, and the bill was exactly what it said it would be.",
        name: "Idris M.",
        context: "Full health check",
        rating: 5,
    },
    {
        quote:
            "Bloods on the Tuesday, results and a phone call from the doctor on the Thursday morning. That is how it should work.",
        name: "Peter S.",
        context: "Diabetes review",
        rating: 5,
    },
    {
        quote:
            "Twenty minutes, and nobody looked at the clock once. I did not realise how much I had stopped expecting that.",
        name: "Aoife D.",
        context: "Mental health appointment",
        rating: 5,
    },
    {
        quote:
            "They sorted the insurance pre-authorisation themselves. I did not make a single phone call.",
        name: "Tom B.",
        context: "Minor procedure",
        rating: 5,
    },
    {
        quote:
            "My son sees the same nurse every time. He actually asks for her now, which tells you everything.",
        name: "Priya R.",
        context: "Child health",
        rating: 5,
    },
];

export const FACILITIES: readonly Facility[] = [
    {
        src: "/img/waiting.jpg",
        alt: "Sunlit waiting area with soft linen armchairs, a large fig tree and pale oak floors",
        title: "Somewhere you do not mind waiting",
        points: ["Daylight and quiet", "Seats you can wait in", "Step-free throughout"],
    },
    {
        src: "/img/reception.jpg",
        alt: "Uncluttered reception counter in pale oak and sage-green joinery with fresh eucalyptus",
        title: "A person, not a queuing system",
        points: ["Reception answers in person", "No phone queue at 08:00", "Registration done before you arrive"],
    },
    {
        src: "/img/consulting.jpg",
        alt: "Bright consulting room with an examination couch, wooden desk and a window with sheer curtains",
        title: "Consulting rooms with daylight",
        points: ["Twenty minutes as standard", "Chaperone on request", "Same room as your last visit"],
    },
    {
        src: "/img/treatment.jpg",
        alt: "Spotless minor-procedures room with a sterile instrument trolley and overhead surgical light",
        title: "Minor procedures on site",
        points: ["Moles, cysts and joint injections", "No hospital referral needed", "Sterile service audited yearly"],
    },
    {
        src: "/img/recovery.jpg",
        alt: "Quiet recovery room with a made bed, sage throw and an armchair beside a window onto trees",
        title: "A quiet room to come round in",
        points: ["Private and unhurried", "Someone with you throughout", "Leave when you are ready"],
    },
    {
        src: "/img/exterior.jpg",
        alt: "Red-brick Victorian practice building with a modern glazed entrance on a leafy street",
        title: "Five minutes from Victoria",
        points: ["Two accessible parking bays", "Level entrance from the street", "Bike racks at the rear"],
    },
];

export const OPENING: readonly OpeningDay[] = [
    { day: "Monday – Thursday", hours: "08:00 – 18:30" },
    { day: "Friday", hours: "08:00 – 17:00" },
    { day: "Saturday", hours: "09:00 – 13:00" },
    { day: "Sunday", hours: "Closed" },
];

export const FAQS: readonly FaqItem[] = [
    {
        question: "How quickly will I hear back?",
        answer:
            "Requests sent during opening hours are answered the same day, usually inside the hour. Anything that arrives overnight or at the weekend is answered first thing when we reopen, and you will get a confirmation either way rather than silence.",
    },
    {
        question: "Do I need to be registered to book?",
        answer:
            "No. New patients can request an appointment here and we will send the registration form with the confirmation, so it is done before you arrive rather than in the waiting room.",
    },
    {
        question: "Can I request a specific clinician?",
        answer:
            "Yes, and the form lets you choose. If they are not available in your preferred window we will offer the next slot with them as well as an earlier one with a colleague, and you decide which you would rather have.",
    },
    {
        question: "What does it cost, and are there hidden fees?",
        answer:
            "Every price is published on this page. There is no fee to ask a question, no charge for a prescription we have already agreed, and no separate booking fee. If something falls outside the published list we tell you the cost before we do it.",
    },
    {
        question: "Can I use my private health insurance?",
        answer:
            "Most major insurers are accepted. Give us the policy number when you book and we will check cover and tell you what, if anything, you will be asked to pay before your appointment rather than after it.",
    },
    {
        question: "Can I message you on WhatsApp?",
        answer:
            "Yes, and it is often the quickest route for a short question or to move an appointment. It is answered by reception during opening hours, not by a bot. Please do not send clinical photographs or test results that way — it is not the right place for them, and we will ask you to bring them in instead.",
    },
    {
        question: "Can another clinician refer a patient to you?",
        answer:
            "Yes. There is a referral form for GPs, consultants, dentists and other clinicians, and we contact the patient directly to arrange a time rather than sending it back through you. We write back once they have been seen. Urgent referrals are picked up the same working day.",
    },
    {
        question: "Do you offer video appointments?",
        answer:
            "For reviews, results and anything that does not need examining, yes. Book as you normally would and ask for video in the notes. If it turns out you need to be seen in person, we will say so rather than make do.",
    },
    {
        question: "How do I get a copy of my records?",
        answer:
            "Write to us and we will answer within one month, free of charge. You can also ask us to correct something you think is wrong. What we hold and why is set out in full in our privacy notice.",
    },
    {
        question: "What if I need to cancel?",
        answer:
            "Reply to the confirmation message. Cancelling frees the slot for someone else automatically, which is why we ask rather than rely on no-shows.",
    },
];

/**
 * The logistics the practice absorbs. Every major provider sells on these
 * rather than on clinical claims, because the thing patients actually dread is
 * the admin and the not-knowing, not the medicine.
 */
export const PROMISES: readonly Promise_[] = [
    {
        title: "We do the paperwork",
        body: "Registration, insurance pre-authorisation and referral letters are handled here. You sign once.",
        icon: "files",
    },
    {
        title: "One person owns your case",
        body: "A named coordinator sees it through, so you are never explaining your history to a stranger again.",
        icon: "headset",
    },
    {
        title: "The price before the visit",
        body: "You are told the cost, and what your insurer covers, before anything is booked. Never after.",
        icon: "wallet",
    },
    {
        title: "Parking and access sorted",
        body: "Two accessible bays held for booked appointments, level entry, and a lift to both floors.",
        icon: "car",
    },
];

export const PATIENT_STORY: PatientStory = {
    quote:
        "I had been putting it off for months because I could never get through on the phone. I filled in two boxes on a Sunday night and someone rang me at nine on Monday morning with three times to choose from. That was the whole thing. That was all it took.",
    name: "Hannah",
    age: "34",
    context: "Registered as a new patient, seen the same week",
    video: "/video/story-hannah.mp4",
    poster: "/img/story-hannah.jpg",
    posterAlt:
        "A woman in her thirties sitting on a sofa in a sunlit living room, talking to camera",
};

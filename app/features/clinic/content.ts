import type { Brand } from "./brands";
import type { Department } from "./care";
import { ARTICLES } from "./catalogue";
import { FACILITIES } from "./constants";
import type { AdditionalService, Article, CatalogueIcon, Treatment } from "./catalogue";
import type { KindProfile, PracticeKind, Service } from "./practice-kinds";
import type { Clinician, Facility, Package } from "./types";

/**
 * What this practice actually offers, derived from its trade.
 *
 * Every site on the farm shipped one clinic's content: six general-practice
 * departments, nine named GP partners, and a price list in pounds. On a
 * dental practice in Ohio that is not merely generic, it is false — the page
 * offered cervical screening and travel vaccinations under a dentist's name,
 * listed a cardiometabolic department that does not exist, and quoted fees in
 * a currency the patient does not spend.
 *
 * So departments, treatments, additional services and appointment types are
 * all functions of the kind, and every price is a function of the country.
 * Nothing here is a general-practice default wearing another trade's name.
 *
 * Prices are indicative and the demo bar says so. They are held as index
 * numbers and scaled per market rather than written per country, because a
 * table of ten kinds times seven countries would rot the first time one of
 * them changed.
 */

/** An appointment someone can actually book, within a department. */
export interface AppointmentType {
    readonly id: string;
    readonly name: string;
    /** Department id this belongs to. The booking form filters on it. */
    readonly department: string;
    readonly minutes: number;
    /** Index price; format with `priceLabel`. Zero means "no charge". */
    readonly price: number;
    readonly note?: string;
}

export interface ClinicContent {
    readonly departments: readonly Department[];
    readonly treatments: readonly Treatment[];
    readonly additionalServices: readonly AdditionalService[];
    readonly appointmentTypes: readonly AppointmentType[];
    /** Filed under this practice's own departments, so the filters match. */
    readonly clinicians: readonly Clinician[];
    /** Price cards, built from the appointments above so they cannot disagree. */
    readonly packages: readonly Package[];
    /**
     * The health library, narrowed to this practice.
     *
     * The built-in articles were written for a general practice and filed
     * under its departments, so a dental site published a library about
     * contraception and travel vaccination. Only articles whose department
     * this practice actually has are kept, which usually means none — and a
     * library with nothing in it should not be linked at all.
     */
    readonly articles: readonly Article[];
    /**
     * How the numbers above should be read.
     *
     * The two sources of a price are scaled differently: trade defaults are
     * index numbers written against the UK and scaled per market, while a
     * price set on the registry row is already in that clinic's own money and
     * must be printed as given.
     *
     * A plain string, not a formatter closure. This object is resolved on the
     * server and handed to a Client Component, and a function cannot cross
     * that boundary — React refuses to serialise it, and the whole subtree
     * fails to render. Call `formatPrice(brand, value, mode)` instead.
     */
    readonly priceMode: PriceMode;
}

export type PriceMode = "index" | "local";

/** The one place a price becomes text. Works on either side of the boundary. */
export function formatPrice(brand: Brand, value: number, mode: PriceMode): string {
    return mode === "local" ? priceLabelLocal(brand, value) : priceLabel(brand, value);
}

interface DeptSpec {
    readonly id: string;
    readonly name: string;
    readonly summary: string;
    readonly image: string;
    readonly imageAlt: string;
    readonly services: readonly string[];
}

interface TreatSpec {
    readonly slug: string;
    readonly name: string;
    readonly icon: CatalogueIcon;
    readonly department: string;
    readonly summary: string;
}

interface ApptSpec {
    readonly id: string;
    readonly name: string;
    readonly department: string;
    readonly minutes: number;
    readonly price: number;
    readonly note?: string;
}

interface KindContent {
    readonly departments: readonly DeptSpec[];
    readonly treatments: readonly TreatSpec[];
    readonly additional: readonly AdditionalService[];
    readonly appointments: readonly ApptSpec[];
}

/* Seven photographs exist, all shot for a general practice. Each trade is
   mapped to the nearest honest one — a consulting room reads correctly for
   most of these — rather than given a picture of the wrong sort of room.
   Bespoke imagery per trade is worth doing and is not what makes the copy
   false, which is the thing being fixed here. */
const IMG = {
    room: "/img/dept/general.jpg",
    chairs: "/img/dept/womens.jpg",
    child: "/img/dept/paediatrics.jpg",
    calm: "/img/dept/mental-health.jpg",
    bench: "/img/dept/cardiometabolic.jpg",
    desk: "/img/dept/travel.jpg",
    skin: "/img/dept/skin.jpg",
} as const;

const ALT = {
    room: "A tidy consulting-room desk with a stethoscope, notebook and blood pressure cuff",
    chairs: "Two comfortable chairs turned toward each other beside a softly curtained window",
    child: "A bright corner of a clinic with wooden toys, picture books and a child-height chair",
    calm: "A softly lit room with a deep armchair, a wool throw and a window onto green leaves",
    bench: "A clinic bench laid out with monitoring equipment",
    desk: "A clinic reception desk with a journal and sealed supplies",
    skin: "A treatment room with a bright examination lamp and a covered couch",
} as const;

const GENERAL_PRACTICE: KindContent = {
    departments: [
        { id: "general", name: "General medicine", summary: "First port of call for anything undifferentiated, and ongoing conditions.", image: IMG.room, imageAlt: ALT.room, services: ["gp", "health-checks", "bloods"] },
        { id: "womens", name: "Women's health", summary: "Contraception, menopause, gynaecological symptoms and screening.", image: IMG.chairs, imageAlt: ALT.chairs, services: ["gp", "health-checks"] },
        { id: "paediatrics", name: "Child health", summary: "Babies and children — illness, feeding, development and vaccinations.", image: IMG.child, imageAlt: ALT.child, services: ["child-health", "vaccinations"] },
        { id: "mental-health", name: "Mental health", summary: "Low mood, anxiety, sleep and stress, with longer appointments as standard.", image: IMG.calm, imageAlt: ALT.calm, services: ["mental-health"] },
        { id: "cardiometabolic", name: "Heart & diabetes", summary: "Blood pressure, cholesterol, diabetes review and cardiovascular risk.", image: IMG.bench, imageAlt: ALT.bench, services: ["health-checks", "bloods", "gp"] },
        { id: "travel", name: "Travel health", summary: "Destination risk assessment, vaccinations and antimalarials.", image: IMG.desk, imageAlt: ALT.desk, services: ["vaccinations"] },
    ],
    treatments: [
        { slug: "blood-pressure-review", name: "Blood pressure review", icon: "activity", department: "cardiometabolic", summary: "A reading, a look at the trend, and a plan you actually agree with." },
        { slug: "diabetes-review", name: "Diabetes annual review", icon: "droplet", department: "cardiometabolic", summary: "Bloods, feet, eyes and medication in one appointment rather than four." },
        { slug: "cervical-screening", name: "Cervical screening", icon: "shield", department: "womens", summary: "Booked with a female clinician as standard, and never rushed." },
        { slug: "menopause-review", name: "Menopause review", icon: "flower", department: "womens", summary: "Thirty minutes to go through symptoms, options and what you want." },
        { slug: "contraception", name: "Contraception", icon: "shield", department: "womens", summary: "Including fittings and removals, with time to talk through the choice." },
        { slug: "mole-check", name: "Mole and skin check", icon: "scan", department: "general", summary: "Dermatoscope examination, photographed so change can be compared." },
        { slug: "joint-injection", name: "Joint injection", icon: "scissors", department: "general", summary: "For shoulder, knee and small-joint pain, done here rather than in hospital." },
        { slug: "childhood-vaccinations", name: "Childhood vaccinations", icon: "baby", department: "paediatrics", summary: "The full schedule, with catch-up appointments if you have fallen behind." },
        { slug: "talking-therapy", name: "Talking therapy referral", icon: "brain", department: "mental-health", summary: "A longer appointment first, then a referral we chase rather than hand over." },
    ],
    additional: [
        { slug: "bloods", name: "Blood tests", icon: "microscope", summary: "Taken on site, most results back inside two working days.", bookable: true },
        { slug: "letters", name: "Medical letters", icon: "clipboard", summary: "Fitness to work, travel and insurance letters, priced before we start.", bookable: true },
        { slug: "repeat-prescriptions", name: "Repeat prescriptions", icon: "pill", summary: "Requested online and ready the next working day.", bookable: false },
    ],
    appointments: [
        { id: "gp-standard", name: "Standard appointment", department: "general", minutes: 20, price: 68 },
        { id: "gp-long", name: "Extended appointment", department: "general", minutes: 30, price: 95, note: "For anything with more than one problem in it." },
        { id: "womens-review", name: "Women's health review", department: "womens", minutes: 30, price: 95 },
        { id: "child", name: "Child appointment", department: "paediatrics", minutes: 20, price: 60 },
        { id: "mh-first", name: "First mental health appointment", department: "mental-health", minutes: 45, price: 120 },
        { id: "cardio-review", name: "Annual review", department: "cardiometabolic", minutes: 40, price: 110 },
        { id: "travel-consult", name: "Travel consultation", department: "travel", minutes: 25, price: 55, note: "Vaccines charged separately." },
    ],
};

const HOSPITAL: KindContent = {
    departments: [
        { id: "emergency", name: "Emergency", summary: "Open every hour of every day. No appointment, no referral.", image: IMG.room, imageAlt: ALT.room, services: ["emergency"] },
        { id: "surgery", name: "Surgery", summary: "Planned procedures with a named surgeon and a date in the diary.", image: IMG.bench, imageAlt: ALT.bench, services: ["surgery"] },
        { id: "maternity", name: "Maternity", summary: "Antenatal care, birth, and the weeks that follow it.", image: IMG.chairs, imageAlt: ALT.chairs, services: ["maternity"] },
        { id: "diagnostics", name: "Imaging & diagnostics", summary: "MRI, CT, ultrasound and bloods, most reported the same week.", image: IMG.desk, imageAlt: ALT.desk, services: ["diagnostics"] },
        { id: "outpatients", name: "Outpatient clinics", summary: "Referral and self-pay clinics across every specialty.", image: IMG.room, imageAlt: ALT.room, services: ["outpatients"] },
        { id: "paediatrics", name: "Children's services", summary: "A separate children's area, staffed by people who work only with children.", image: IMG.child, imageAlt: ALT.child, services: ["outpatients"] },
    ],
    treatments: [
        { slug: "mri", name: "MRI scan", icon: "scan", department: "diagnostics", summary: "Reported by a consultant radiologist, usually inside five working days." },
        { slug: "ct", name: "CT scan", icon: "scan", department: "diagnostics", summary: "Same-week appointments, with the report sent to whoever referred you." },
        { slug: "ultrasound", name: "Ultrasound", icon: "activity", department: "diagnostics", summary: "Performed by a sonographer, with findings explained before you leave." },
        { slug: "day-surgery", name: "Day surgery", icon: "scissors", department: "surgery", summary: "In and home the same day, with a named surgeon and a follow-up call." },
        { slug: "antenatal", name: "Antenatal clinic", icon: "baby", department: "maternity", summary: "Scheduled through the pregnancy, with continuity of midwife." },
        { slug: "outpatient-consult", name: "Consultant clinic", icon: "clipboard", department: "outpatients", summary: "A named consultant, with the letter copied to you as well as your GP." },
    ],
    additional: [
        { slug: "pharmacy", name: "On-site pharmacy", icon: "pill", summary: "Dispensing during opening hours, so you leave with the medication.", bookable: false },
        { slug: "pathology", name: "Pathology", icon: "microscope", summary: "Bloods and samples processed in our own laboratory.", bookable: true },
        { slug: "physio", name: "Physiotherapy", icon: "activity", summary: "Rehabilitation after surgery and injury, in the same building.", bookable: true },
    ],
    appointments: [
        { id: "outpatient-new", name: "New consultant appointment", department: "outpatients", minutes: 30, price: 220 },
        { id: "outpatient-follow", name: "Follow-up", department: "outpatients", minutes: 15, price: 140 },
        { id: "imaging-mri", name: "MRI scan", department: "diagnostics", minutes: 45, price: 480 },
        { id: "imaging-ultrasound", name: "Ultrasound", department: "diagnostics", minutes: 30, price: 210 },
        { id: "surgical-assessment", name: "Surgical assessment", department: "surgery", minutes: 30, price: 240 },
        { id: "antenatal-booking", name: "Antenatal booking", department: "maternity", minutes: 45, price: 180 },
    ],
};

const DENTAL: KindContent = {
    departments: [
        { id: "general-dentistry", name: "General dentistry", summary: "Check-ups, hygiene and the everyday work that prevents the rest.", image: IMG.room, imageAlt: ALT.room, services: ["check-up", "fillings"] },
        { id: "cosmetic", name: "Cosmetic dentistry", summary: "Whitening, veneers and bonding, with the price agreed before we start.", image: IMG.chairs, imageAlt: ALT.chairs, services: ["whitening"] },
        { id: "orthodontics", name: "Orthodontics", summary: "Clear aligners and fixed braces for adults and teenagers.", image: IMG.desk, imageAlt: ALT.desk, services: ["orthodontics"] },
        { id: "implants", name: "Implants & restorative", summary: "Replacing missing teeth, from a single implant to a full arch.", image: IMG.bench, imageAlt: ALT.bench, services: ["implants"] },
        { id: "emergency-dental", name: "Emergency dental", summary: "Same-day appointments held back every morning for pain.", image: IMG.room, imageAlt: ALT.room, services: ["emergency-dental"] },
    ],
    treatments: [
        { slug: "check-up", name: "Examination & hygiene", icon: "clipboard", department: "general-dentistry", summary: "Examination, scale and polish, and a written plan you agree to." },
        { slug: "filling", name: "Filling", icon: "shield", department: "general-dentistry", summary: "Tooth-coloured, matched to the tooth, done in one visit where possible." },
        { slug: "root-canal", name: "Root canal treatment", icon: "scissors", department: "general-dentistry", summary: "Under local anaesthetic, with the tooth saved rather than removed." },
        { slug: "extraction", name: "Extraction", icon: "scissors", department: "emergency-dental", summary: "When a tooth cannot be saved, with aftercare explained before you leave." },
        { slug: "whitening", name: "Whitening", icon: "flower", department: "cosmetic", summary: "Supervised, with trays made from your own impressions." },
        { slug: "veneers", name: "Veneers", icon: "shield", department: "cosmetic", summary: "Planned on a model first, so you see the result before anything is cut." },
        { slug: "aligners", name: "Clear aligners", icon: "activity", department: "orthodontics", summary: "Scanned, planned and reviewed every six weeks." },
        { slug: "implant", name: "Dental implant", icon: "microscope", department: "implants", summary: "Assessment, placement and the crown, with the total price up front." },
    ],
    additional: [
        { slug: "xray", name: "Dental X-ray", icon: "scan", summary: "Taken here, shown to you on screen and explained.", bookable: true },
        { slug: "sedation", name: "Sedation", icon: "pill", summary: "For anyone who finds treatment difficult. Discussed at assessment.", bookable: true },
        { slug: "plan", name: "Membership plan", icon: "clipboard", summary: "Check-ups and hygiene spread over monthly payments.", bookable: false },
    ],
    appointments: [
        { id: "new-patient", name: "New patient examination", department: "general-dentistry", minutes: 40, price: 85, note: "Includes X-rays where needed." },
        { id: "check-up", name: "Check-up", department: "general-dentistry", minutes: 20, price: 55 },
        { id: "hygiene", name: "Hygiene appointment", department: "general-dentistry", minutes: 30, price: 70 },
        { id: "emergency", name: "Emergency appointment", department: "emergency-dental", minutes: 20, price: 95, note: "Same-day slots held back each morning." },
        { id: "cosmetic-consult", name: "Cosmetic consultation", department: "cosmetic", minutes: 30, price: 0, note: "No charge, and no obligation." },
        { id: "ortho-consult", name: "Orthodontic consultation", department: "orthodontics", minutes: 30, price: 60 },
        { id: "implant-assessment", name: "Implant assessment", department: "implants", minutes: 45, price: 120 },
    ],
};

const PHYSIO: KindContent = {
    departments: [
        { id: "musculoskeletal", name: "Musculoskeletal", summary: "Back, neck, shoulder and knee pain — assessment and hands-on treatment.", image: IMG.room, imageAlt: ALT.room, services: ["assessment", "manual-therapy"] },
        { id: "sports", name: "Sports injury", summary: "Assessment, treatment and a return-to-play plan with dates in it.", image: IMG.bench, imageAlt: ALT.bench, services: ["sports"] },
        { id: "rehab", name: "Rehabilitation", summary: "After surgery or injury, at a pace that fits the rest of your week.", image: IMG.desk, imageAlt: ALT.desk, services: ["rehab"] },
        { id: "classes", name: "Clinical Pilates", summary: "Small groups led by a physiotherapist, not a general class.", image: IMG.chairs, imageAlt: ALT.chairs, services: ["pilates"] },
    ],
    treatments: [
        { slug: "assessment", name: "Initial assessment", icon: "clipboard", department: "musculoskeletal", summary: "Forty-five minutes to find the cause, not just the sore part." },
        { slug: "manual-therapy", name: "Manual therapy", icon: "activity", department: "musculoskeletal", summary: "Hands-on treatment for joints and soft tissue." },
        { slug: "acupuncture", name: "Acupuncture", icon: "scissors", department: "musculoskeletal", summary: "Used alongside treatment for pain, never instead of a diagnosis." },
        { slug: "sports-injury", name: "Sports injury treatment", icon: "activity", department: "sports", summary: "Treatment and a graded plan back to your sport." },
        { slug: "post-op", name: "Post-operative rehab", icon: "clipboard", department: "rehab", summary: "Following the surgeon's protocol, reviewed as you progress." },
        { slug: "pilates", name: "Clinical Pilates", icon: "flower", department: "classes", summary: "Six to a class, so your technique is actually watched." },
    ],
    additional: [
        { slug: "gait", name: "Gait analysis", icon: "scan", summary: "Filmed and reviewed with you, with the findings written down.", bookable: true },
        { slug: "home-visit", name: "Home visits", icon: "clipboard", summary: "For anyone who cannot travel. Arranged by phone.", bookable: false },
        { slug: "workplace", name: "Workplace assessment", icon: "clipboard", summary: "Desk and lifting assessment, so it does not come straight back.", bookable: true },
    ],
    appointments: [
        { id: "initial", name: "Initial assessment", department: "musculoskeletal", minutes: 45, price: 75 },
        { id: "follow-up", name: "Follow-up session", department: "musculoskeletal", minutes: 30, price: 55 },
        { id: "sports-initial", name: "Sports injury assessment", department: "sports", minutes: 45, price: 80 },
        { id: "rehab-session", name: "Rehabilitation session", department: "rehab", minutes: 45, price: 65 },
        { id: "pilates-class", name: "Clinical Pilates class", department: "classes", minutes: 55, price: 22 },
    ],
};

const CHIRO: KindContent = {
    departments: [
        { id: "spinal", name: "Spinal care", summary: "Back and neck pain, assessed properly before anything is adjusted.", image: IMG.room, imageAlt: ALT.room, services: ["assessment", "adjustment"] },
        { id: "soft-tissue", name: "Soft tissue", summary: "Massage and release work alongside adjustment.", image: IMG.bench, imageAlt: ALT.bench, services: ["soft-tissue"] },
        { id: "posture", name: "Posture & ergonomics", summary: "Desk, lifting and sleep, so the problem does not simply return.", image: IMG.desk, imageAlt: ALT.desk, services: ["posture"] },
    ],
    treatments: [
        { slug: "consultation", name: "Initial consultation", icon: "clipboard", department: "spinal", summary: "History, examination and a clear plan before treatment begins." },
        { slug: "adjustment", name: "Chiropractic adjustment", icon: "activity", department: "spinal", summary: "Spinal and joint treatment tailored to the assessment." },
        { slug: "soft-tissue", name: "Soft tissue therapy", icon: "flower", department: "soft-tissue", summary: "Massage and release work for muscle and fascia." },
        { slug: "posture-review", name: "Posture assessment", icon: "scan", department: "posture", summary: "Filmed and explained, with changes you can actually make." },
    ],
    additional: [
        { slug: "xray-referral", name: "X-ray referral", icon: "scan", summary: "Referred out where imaging would change the plan — not routinely.", bookable: false },
        { slug: "orthotics", name: "Orthotics", icon: "clipboard", summary: "Assessed and fitted where the feet are part of the problem.", bookable: true },
    ],
    appointments: [
        { id: "initial", name: "Initial consultation", department: "spinal", minutes: 45, price: 70 },
        { id: "adjustment", name: "Adjustment", department: "spinal", minutes: 20, price: 45 },
        { id: "soft-tissue", name: "Soft tissue session", department: "soft-tissue", minutes: 45, price: 60 },
        { id: "posture", name: "Posture assessment", department: "posture", minutes: 40, price: 65 },
    ],
};

const DERMATOLOGY: KindContent = {
    departments: [
        { id: "skin-cancer", name: "Skin cancer & moles", summary: "Full-body dermoscopy, photographed so change can be compared.", image: IMG.skin, imageAlt: ALT.skin, services: ["mole-check"] },
        { id: "medical-derm", name: "Medical dermatology", summary: "Acne, rosacea, eczema and psoriasis, managed over time.", image: IMG.room, imageAlt: ALT.room, services: ["acne", "eczema"] },
        { id: "skin-surgery", name: "Minor skin surgery", summary: "Removal and biopsy, with histology reported back to you.", image: IMG.bench, imageAlt: ALT.bench, services: ["surgery"] },
        { id: "cosmetic-derm", name: "Cosmetic dermatology", summary: "Only where it is clinically sensible, and priced plainly.", image: IMG.chairs, imageAlt: ALT.chairs, services: ["cosmetic"] },
    ],
    treatments: [
        { slug: "mole-check", name: "Full mole check", icon: "scan", department: "skin-cancer", summary: "Whole-body dermoscopy with photographs kept for comparison." },
        { slug: "lesion-removal", name: "Lesion removal", icon: "scissors", department: "skin-surgery", summary: "Removed and sent for histology, with the result explained to you." },
        { slug: "acne", name: "Acne & rosacea", icon: "droplet", department: "medical-derm", summary: "Medical treatment with review, not a product list." },
        { slug: "eczema", name: "Eczema & psoriasis", icon: "shield", department: "medical-derm", summary: "Long-term management that does not rely on steroids alone." },
        { slug: "patch-testing", name: "Patch testing", icon: "microscope", department: "medical-derm", summary: "For contact allergy, read over three visits in one week." },
    ],
    additional: [
        { slug: "histology", name: "Histology", icon: "microscope", summary: "Processed by an accredited laboratory, reported back in writing.", bookable: false },
        { slug: "phototherapy", name: "Phototherapy", icon: "activity", summary: "Courses of light treatment for psoriasis and eczema.", bookable: true },
    ],
    appointments: [
        { id: "new", name: "New patient consultation", department: "medical-derm", minutes: 30, price: 180 },
        { id: "mole-check", name: "Full mole check", department: "skin-cancer", minutes: 40, price: 220 },
        { id: "single-lesion", name: "Single lesion check", department: "skin-cancer", minutes: 15, price: 120 },
        { id: "minor-surgery", name: "Minor surgery", department: "skin-surgery", minutes: 45, price: 380, note: "Histology included." },
        { id: "cosmetic-consult", name: "Cosmetic consultation", department: "cosmetic-derm", minutes: 30, price: 90 },
    ],
};

const OPTOMETRY: KindContent = {
    departments: [
        { id: "eye-exams", name: "Eye examinations", summary: "Thirty minutes, including retinal photography as standard.", image: IMG.room, imageAlt: ALT.room, services: ["eye-test"] },
        { id: "contact-lenses", name: "Contact lenses", summary: "Fitting, trial and aftercare, included rather than added on.", image: IMG.bench, imageAlt: ALT.bench, services: ["contact-lenses"] },
        { id: "childrens", name: "Children's eyes", summary: "Tests designed for children who cannot read a chart yet.", image: IMG.child, imageAlt: ALT.child, services: ["childrens"] },
        { id: "eye-health", name: "Eye health", summary: "Glaucoma, cataract and macular monitoring, with imaging kept over time.", image: IMG.desk, imageAlt: ALT.desk, services: ["glaucoma"] },
    ],
    treatments: [
        { slug: "eye-test", name: "Eye examination", icon: "scan", department: "eye-exams", summary: "Thirty minutes, with retinal photography included." },
        { slug: "oct", name: "OCT scan", icon: "microscope", department: "eye-health", summary: "A cross-section of the retina, kept and compared year to year." },
        { slug: "contact-fitting", name: "Contact lens fitting", icon: "activity", department: "contact-lenses", summary: "Fitting, a trial pair and a follow-up, all in the price." },
        { slug: "childrens-test", name: "Children's eye test", icon: "baby", department: "childrens", summary: "Tests that work for a child who cannot yet read a chart." },
        { slug: "glaucoma", name: "Glaucoma screening", icon: "shield", department: "eye-health", summary: "Pressure, field and nerve imaging in a single visit." },
    ],
    additional: [
        { slug: "dry-eye", name: "Dry eye clinic", icon: "droplet", summary: "Assessment and treatment for persistent irritation.", bookable: true },
        { slug: "repairs", name: "Repairs & adjustments", icon: "clipboard", summary: "Walk in — no appointment and usually no charge.", bookable: false },
    ],
    appointments: [
        { id: "standard", name: "Eye examination", department: "eye-exams", minutes: 30, price: 45 },
        { id: "enhanced", name: "Enhanced examination with OCT", department: "eye-health", minutes: 45, price: 75 },
        { id: "contact-fitting", name: "Contact lens fitting", department: "contact-lenses", minutes: 45, price: 60 },
        { id: "childrens", name: "Children's eye test", department: "childrens", minutes: 30, price: 0, note: "No charge for under-16s." },
    ],
};

const MENTAL_HEALTH: KindContent = {
    departments: [
        { id: "individual", name: "Individual therapy", summary: "Fifty minutes, weekly, with the same therapist throughout.", image: IMG.calm, imageAlt: ALT.calm, services: ["individual"] },
        { id: "couples", name: "Couples therapy", summary: "Structured sessions with both partners present.", image: IMG.chairs, imageAlt: ALT.chairs, services: ["couples"] },
        { id: "cbt", name: "CBT", summary: "Short-course, goal-led work for anxiety and low mood.", image: IMG.room, imageAlt: ALT.room, services: ["cbt"] },
        { id: "assessment", name: "Assessment", summary: "A first appointment to work out what would actually help.", image: IMG.desk, imageAlt: ALT.desk, services: ["assessment"] },
    ],
    treatments: [
        { slug: "assessment", name: "Initial assessment", icon: "clipboard", department: "assessment", summary: "One appointment to decide together what would help." },
        { slug: "individual", name: "Individual therapy", icon: "brain", department: "individual", summary: "Fifty minutes, weekly, with the same therapist." },
        { slug: "cbt", name: "CBT", icon: "activity", department: "cbt", summary: "Structured, time-limited work with something to do between sessions." },
        { slug: "couples", name: "Couples therapy", icon: "flower", department: "couples", summary: "Both partners, in the room, with a therapist who keeps it fair." },
    ],
    additional: [
        { slug: "online", name: "Online sessions", icon: "clock", summary: "The same therapist and the same hour, from wherever you are.", bookable: true },
        { slug: "reports", name: "Reports & letters", icon: "clipboard", summary: "For employers or insurers, written only with your consent.", bookable: false },
    ],
    appointments: [
        { id: "assessment", name: "Initial assessment", department: "assessment", minutes: 60, price: 110 },
        { id: "individual", name: "Therapy session", department: "individual", minutes: 50, price: 85 },
        { id: "cbt", name: "CBT session", department: "cbt", minutes: 50, price: 90 },
        { id: "couples", name: "Couples session", department: "couples", minutes: 75, price: 130 },
    ],
};

const PODIATRY: KindContent = {
    departments: [
        { id: "routine", name: "Routine foot care", summary: "Nails, callus and the things that make walking hurt.", image: IMG.room, imageAlt: ALT.room, services: ["routine"] },
        { id: "diabetic", name: "Diabetic foot care", summary: "Regular checks, because this is where small problems get big.", image: IMG.bench, imageAlt: ALT.bench, services: ["diabetic"] },
        { id: "biomechanics", name: "Biomechanics", summary: "Gait assessment and custom insoles where they will actually help.", image: IMG.desk, imageAlt: ALT.desk, services: ["biomechanics"] },
        { id: "nail-surgery", name: "Nail surgery", summary: "Ingrown toenails treated under local anaesthetic.", image: IMG.skin, imageAlt: ALT.skin, services: ["nail-surgery"] },
    ],
    treatments: [
        { slug: "routine", name: "Routine treatment", icon: "clipboard", department: "routine", summary: "Nails, corns and callus, with advice that prevents the next visit." },
        { slug: "diabetic-check", name: "Diabetic foot check", icon: "shield", department: "diabetic", summary: "Circulation and sensation tested and recorded each time." },
        { slug: "gait", name: "Gait assessment", icon: "scan", department: "biomechanics", summary: "Filmed, measured and explained before anything is prescribed." },
        { slug: "orthotics", name: "Custom orthotics", icon: "clipboard", department: "biomechanics", summary: "Made to your cast, reviewed once you have worn them in." },
        { slug: "nail-surgery", name: "Nail surgery", icon: "scissors", department: "nail-surgery", summary: "Under local anaesthetic, with a follow-up dressing included." },
    ],
    additional: [
        { slug: "verruca", name: "Verruca treatment", icon: "droplet", summary: "Several approaches; we will say which is worth trying first.", bookable: true },
        { slug: "home-visit", name: "Home visits", icon: "clock", summary: "For anyone who cannot get to the clinic.", bookable: false },
    ],
    appointments: [
        { id: "initial", name: "Initial assessment", department: "routine", minutes: 45, price: 60 },
        { id: "routine", name: "Routine treatment", department: "routine", minutes: 30, price: 45 },
        { id: "diabetic", name: "Diabetic foot check", department: "diabetic", minutes: 30, price: 55 },
        { id: "biomechanics", name: "Biomechanical assessment", department: "biomechanics", minutes: 60, price: 95 },
        { id: "nail-surgery", name: "Nail surgery", department: "nail-surgery", minutes: 60, price: 280, note: "Includes follow-up dressings." },
    ],
};

const VETERINARY: KindContent = {
    departments: [
        { id: "consultations", name: "Consultations", summary: "Fifteen minutes, longer for anything complicated.", image: IMG.room, imageAlt: ALT.room, services: ["consultations"] },
        { id: "preventive", name: "Vaccination & prevention", summary: "Puppy and kitten courses, boosters, worming and flea treatment.", image: IMG.desk, imageAlt: ALT.desk, services: ["vaccinations"] },
        { id: "surgery", name: "Surgery", summary: "Routine and soft-tissue, with a call before and after.", image: IMG.bench, imageAlt: ALT.bench, services: ["surgery"] },
        { id: "dentistry", name: "Dentistry", summary: "Scale, polish and extractions under anaesthetic.", image: IMG.skin, imageAlt: ALT.skin, services: ["dentistry"] },
        { id: "out-of-hours", name: "Out of hours", summary: "An emergency line that reaches a vet, not a message.", image: IMG.room, imageAlt: ALT.room, services: ["emergency-vet"] },
    ],
    treatments: [
        { slug: "consultation", name: "Consultation", icon: "clipboard", department: "consultations", summary: "Fifteen minutes with a vet who has read the history first." },
        { slug: "vaccination", name: "Vaccination", icon: "shield", department: "preventive", summary: "Primary courses and annual boosters, with a reminder sent." },
        { slug: "neutering", name: "Neutering", icon: "scissors", department: "surgery", summary: "Day procedure, home the same evening, with a call to check." },
        { slug: "dental", name: "Dental treatment", icon: "activity", department: "dentistry", summary: "Scale and polish under anaesthetic, extractions where needed." },
        { slug: "emergency", name: "Emergency appointment", icon: "clock", department: "out-of-hours", summary: "Call first — someone will tell you whether to come straight in." },
    ],
    additional: [
        { slug: "microchip", name: "Microchipping", icon: "scan", summary: "Done in a normal consultation, registered before you leave.", bookable: true },
        { slug: "plan", name: "Health plan", icon: "clipboard", summary: "Vaccinations, worming and check-ups over monthly payments.", bookable: false },
        { slug: "lab", name: "In-house laboratory", icon: "microscope", summary: "Bloods run here, so most results come back the same visit.", bookable: false },
    ],
    appointments: [
        { id: "consult", name: "Standard consultation", department: "consultations", minutes: 15, price: 48 },
        { id: "consult-long", name: "Extended consultation", department: "consultations", minutes: 30, price: 72 },
        { id: "vaccination", name: "Vaccination appointment", department: "preventive", minutes: 15, price: 45 },
        { id: "neuter", name: "Neutering", department: "surgery", minutes: 60, price: 240 },
        { id: "dental", name: "Dental procedure", department: "dentistry", minutes: 90, price: 320, note: "Quoted after assessment." },
        { id: "emergency", name: "Emergency appointment", department: "out-of-hours", minutes: 20, price: 140 },
    ],
};

const BY_KIND: Readonly<Record<PracticeKind, KindContent>> = {
    hospital: HOSPITAL,
    "general-practice": GENERAL_PRACTICE,
    dental: DENTAL,
    physio: PHYSIO,
    chiro: CHIRO,
    dermatology: DERMATOLOGY,
    optometry: OPTOMETRY,
    "mental-health": MENTAL_HEALTH,
    podiatry: PODIATRY,
    veterinary: VETERINARY,
};

/**
 * What a unit of price is worth in each market.
 *
 * Index numbers are written once, against the United Kingdom, and scaled here.
 * Writing a price table per country would rot the first time one changed, and
 * quoting pounds to a patient in Ohio is the specific bug being fixed.
 */
const PRICE_FACTOR: Readonly<Record<string, number>> = {
    GB: 1, IE: 1.15, MT: 1, US: 1.6, AU: 1.9, AE: 4.6, IN: 28,
};

/** How coarsely a market's prices are rounded, so no total reads as spurious. */
const PRICE_ROUND: Readonly<Record<string, number>> = {
    GB: 1, IE: 1, MT: 1, US: 5, AU: 5, AE: 25, IN: 100,
};

/**
 * A price in this practice's own currency.
 *
 * Zero is "no charge" rather than a free-looking "£0", because a consultation
 * offered at no cost is a selling point and a zero is a typo.
 */
export function priceLabelLocal(brand: Brand, amount: number): string {
    if (amount <= 0) return "No charge";
    return `${brand.currency}${Math.round(amount).toLocaleString("en-GB")}`;
}

export function priceLabel(brand: Brand, index: number): string {
    if (index <= 0) return "No charge";
    const country = brand.country.toUpperCase();
    const factor = PRICE_FACTOR[country] ?? 1;
    const step = PRICE_ROUND[country] ?? 1;
    const raw = index * factor;
    const rounded = Math.max(step, Math.round(raw / step) * step);
    return `${brand.currency}${rounded.toLocaleString("en-GB")}`;
}

/**
 * What one clinic has told us it actually offers.
 *
 * Every field is optional and every one replaces the trade default wholesale
 * rather than merging into it. Replacement is the predictable rule: a clinic
 * that sends four departments has four, not four plus whichever of the trade's
 * six did not collide. Merging arrays by id reads as helpful and produces
 * departments nobody asked for.
 *
 * Prices here are in the clinic's own currency, already. They are not scaled,
 * because a number typed by someone looking at that clinic's price list is a
 * real price, not an index.
 */
export interface ContentOverrides {
    /**
     * The headline service list — the footer's four, and the `availableService`
     * entries in the structured data. Separate from `treatments` because this
     * is what the practice says it does, and treatments are the individual
     * things you can book.
     */
    readonly services?: readonly Service[];
    /** This clinic's own health-library articles, images and all. */
    readonly articles?: readonly Article[];
    readonly departments?: readonly Department[];
    readonly treatments?: readonly Treatment[];
    readonly additionalServices?: readonly AdditionalService[];
    readonly appointmentTypes?: readonly AppointmentType[];
    readonly clinicians?: readonly Clinician[];
    readonly packages?: readonly Package[];
}

/** Everything this practice offers, in its own terms. */
export function contentFor(
    profile: KindProfile,
    brand: Brand,
    overrides?: ContentOverrides | null,
): ClinicContent {
    const set = BY_KIND[profile.kind] ?? GENERAL_PRACTICE;
    const o = overrides ?? {};

    /* Anything the row supplied is already in local money; anything from the
       trade table is an index to be scaled. Where a row supplies appointments
       but not packages, the packages derived from those appointments are local
       too, which is why this is decided per field rather than per site. */
    const priceMode: PriceMode =
        o.appointmentTypes !== undefined || o.packages !== undefined ? "local" : "index";
    const format = (value: number): string => formatPrice(brand, value, priceMode);

    const appointmentTypes = o.appointmentTypes ?? set.appointments;
    const departments = o.departments ?? set.departments;

    return {
        departments,
        treatments: o.treatments ?? set.treatments,
        additionalServices: o.additionalServices ?? set.additional,
        appointmentTypes,
        clinicians: o.clinicians ?? cliniciansFor(profile, brand),
        articles:
            o.articles ??
            (profile.hasHealthLibrary
                ? ARTICLES.filter((a) => departments.some((d) => d.id === a.department))
                : []),
        packages: o.packages ?? packagesFor(profile, brand, appointmentTypes, format),
        priceMode,
    };
}

/** The appointment types bookable within one department. */
export function appointmentsFor(
    content: ClinicContent,
    departmentId: string | null,
): readonly AppointmentType[] {
    if (departmentId === null) return content.appointmentTypes;
    return content.appointmentTypes.filter((a) => a.department === departmentId);
}

/* ────────────────────────────────────────────────────────────────
   Clinicians

   The directory held nine named GP partners whose department ids were a
   general practice's. Once departments started following the trade, every
   filter on a dental or veterinary site matched nobody — the department chips
   listed dental departments and the people were all filed under "general" and
   "cardiometabolic". That is the broken filter: not the logic, the data.

   So the team is generated from the trade, deterministically from the
   identifier. Two practices get different people; the same practice gets the
   same people every time, which matters because a prospect may look twice.
   The demo bar already says the team shown is illustrative.
   ──────────────────────────────────────────────────────────────── */

/** A deterministic, well-mixed sequence from a string. Not security-grade. */
function seeded(slug: string): () => number {
    let h = 2166136261;
    for (let i = 0; i < slug.length; i += 1) {
        h ^= slug.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return () => {
        h ^= h << 13;
        h ^= h >>> 17;
        h ^= h << 5;
        return Math.abs(h) / 2147483647;
    };
}

/* Deliberately varied. A clinic list of nine British surnames is its own tell,
   and these sites are shown to practices in Ohio, Dubai and Melbourne. */
const FIRST_NAMES = [
    "Amara", "Priya", "Daniel", "Sofia", "Omar", "Grace", "Tomas", "Leila",
    "Marcus", "Hannah", "Ravi", "Elena", "Joseph", "Yasmin", "Peter", "Nadia",
    "Claire", "Adam", "Mei", "Samuel", "Rosa", "Idris", "Anna", "Victor",
] as const;

/**
 * Surnames we hold a portrait for.
 *
 * Drawn from first, so most cards on a site show a face rather than a
 * monogram. A grid of initials reads as a placeholder, which is exactly the
 * impression a proposal site cannot afford — and the demo bar already says
 * the people shown are illustrative.
 */
const PHOTO_NAMES = ["Whitfield", "Nandakumar", "Okonkwo", "Duarte"] as const;

const LAST_NAMES = [
    "Whitfield", "Okafor", "Nandakumar", "Bennett", "Haddad", "Lindqvist",
    "Moreau", "Silva", "Kaur", "Donnelly", "Ferreira", "Novak", "Osei",
    "Marchetti", "Ahmed", "Rasmussen", "Bright", "Calder", "Ibrahim",
    "Petrov", "Lawson", "Duarte", "Chen", "Mbeki", "Okonkwo",
] as const;

interface RoleSpec {
    readonly title: string;
    readonly role: string;
    readonly qualifications: string;
    readonly focus: string;
    readonly departments: readonly string[];
}

const ROLES: Readonly<Record<PracticeKind, readonly RoleSpec[]>> = {
    hospital: [
        { title: "Dr", role: "Consultant physician", qualifications: "MBBS, MRCP", focus: "General medicine and complex diagnosis", departments: ["outpatients"] },
        { title: "Mr", role: "Consultant surgeon", qualifications: "MBBS, FRCS", focus: "General and day-case surgery", departments: ["surgery"] },
        { title: "Dr", role: "Consultant radiologist", qualifications: "MBBS, FRCR", focus: "Cross-sectional imaging and reporting", departments: ["diagnostics"] },
        { title: "Dr", role: "Consultant obstetrician", qualifications: "MBBS, MRCOG", focus: "Antenatal care and birth", departments: ["maternity"] },
        { title: "Dr", role: "Consultant paediatrician", qualifications: "MBBS, MRCPCH", focus: "Children's medicine", departments: ["paediatrics"] },
        { title: "Dr", role: "Emergency consultant", qualifications: "MBBS, FRCEM", focus: "Acute and emergency presentations", departments: ["emergency"] },
    ],
    "general-practice": [
        { title: "Dr", role: "GP Partner", qualifications: "MBBS, MRCGP", focus: "Long-term conditions and heart health", departments: ["general", "cardiometabolic"] },
        { title: "Dr", role: "GP", qualifications: "MBChB, MRCGP, DRCOG", focus: "Women's health and contraception", departments: ["womens", "general"] },
        { title: "Dr", role: "GP", qualifications: "MBBS, MRCGP, DCH", focus: "Children, feeding and development", departments: ["paediatrics"] },
        { title: "Dr", role: "GP", qualifications: "MBBS, MRCGP", focus: "Mental health and longer appointments", departments: ["mental-health", "general"] },
        { title: "", role: "Practice nurse", qualifications: "RN, BSc", focus: "Vaccinations, bloods and travel health", departments: ["travel", "general"] },
    ],
    dental: [
        { title: "Dr", role: "Principal dentist", qualifications: "BDS, MFDS", focus: "Implants and complex restorative work", departments: ["implants", "general-dentistry"] },
        { title: "Dr", role: "Dentist", qualifications: "BDS", focus: "General dentistry and nervous patients", departments: ["general-dentistry", "emergency-dental"] },
        { title: "Dr", role: "Cosmetic dentist", qualifications: "BDS, PGDip", focus: "Veneers, bonding and whitening", departments: ["cosmetic"] },
        { title: "Dr", role: "Orthodontist", qualifications: "BDS, MOrth RCS", focus: "Aligners and fixed braces", departments: ["orthodontics"] },
        { title: "", role: "Dental hygienist", qualifications: "Dip DH", focus: "Gum health and prevention", departments: ["general-dentistry"] },
    ],
    physio: [
        { title: "", role: "Clinical lead physiotherapist", qualifications: "BSc (Hons), MCSP", focus: "Backs, necks and persistent pain", departments: ["musculoskeletal"] },
        { title: "", role: "Physiotherapist", qualifications: "MSc, MCSP", focus: "Sports injury and return to play", departments: ["sports"] },
        { title: "", role: "Physiotherapist", qualifications: "BSc (Hons), MCSP", focus: "Post-operative rehabilitation", departments: ["rehab"] },
        { title: "", role: "Physiotherapist", qualifications: "BSc, APPI", focus: "Clinical Pilates and movement", departments: ["classes"] },
    ],
    chiro: [
        { title: "Dr", role: "Principal chiropractor", qualifications: "MChiro, DC", focus: "Spinal assessment and adjustment", departments: ["spinal"] },
        { title: "Dr", role: "Chiropractor", qualifications: "MChiro", focus: "Neck pain and headaches", departments: ["spinal", "posture"] },
        { title: "", role: "Soft tissue therapist", qualifications: "BSc, Sports Massage", focus: "Muscle and fascia work", departments: ["soft-tissue"] },
    ],
    dermatology: [
        { title: "Dr", role: "Consultant dermatologist", qualifications: "MBBS, FRCP", focus: "Skin cancer and mole checks", departments: ["skin-cancer", "skin-surgery"] },
        { title: "Dr", role: "Consultant dermatologist", qualifications: "MBChB, MRCP", focus: "Acne, rosacea and eczema", departments: ["medical-derm"] },
        { title: "", role: "Dermatology nurse", qualifications: "RN, BSc", focus: "Phototherapy and patch testing", departments: ["medical-derm"] },
        { title: "Dr", role: "Dermatologist", qualifications: "MBBS, MRCP", focus: "Cosmetic and laser dermatology", departments: ["cosmetic-derm"] },
    ],
    optometry: [
        { title: "", role: "Principal optometrist", qualifications: "BSc (Hons), MCOptom", focus: "Glaucoma and retinal imaging", departments: ["eye-health", "eye-exams"] },
        { title: "", role: "Optometrist", qualifications: "MCOptom", focus: "Contact lens fitting and aftercare", departments: ["contact-lenses"] },
        { title: "", role: "Optometrist", qualifications: "BSc (Hons), MCOptom", focus: "Children's vision", departments: ["childrens", "eye-exams"] },
    ],
    "mental-health": [
        { title: "Dr", role: "Clinical psychologist", qualifications: "DClinPsy, HCPC", focus: "Anxiety, trauma and low mood", departments: ["individual", "assessment"] },
        { title: "", role: "CBT therapist", qualifications: "PgDip, BABCP", focus: "Structured, goal-led short courses", departments: ["cbt"] },
        { title: "", role: "Psychotherapist", qualifications: "MA, UKCP", focus: "Longer-term individual work", departments: ["individual"] },
        { title: "", role: "Couples therapist", qualifications: "MSc, COSRT", focus: "Relationships and communication", departments: ["couples"] },
    ],
    podiatry: [
        { title: "", role: "Principal podiatrist", qualifications: "BSc (Hons), HCPC", focus: "Biomechanics and custom orthotics", departments: ["biomechanics", "routine"] },
        { title: "", role: "Podiatrist", qualifications: "BSc (Hons), HCPC", focus: "Diabetic foot care and wound review", departments: ["diabetic"] },
        { title: "", role: "Podiatric surgeon", qualifications: "BSc, MSc, HCPC", focus: "Nail surgery under local anaesthetic", departments: ["nail-surgery"] },
    ],
    veterinary: [
        { title: "Dr", role: "Principal veterinary surgeon", qualifications: "BVSc, MRCVS", focus: "Soft tissue surgery and orthopaedics", departments: ["surgery", "consultations"] },
        { title: "Dr", role: "Veterinary surgeon", qualifications: "BVetMed, MRCVS", focus: "Cats, and quiet handling", departments: ["consultations", "preventive"] },
        { title: "Dr", role: "Veterinary surgeon", qualifications: "MVB, MRCVS", focus: "Dentistry, pain management and out-of-hours cover", departments: ["dentistry", "out-of-hours"] },
        { title: "", role: "Registered veterinary nurse", qualifications: "RVN", focus: "Nurse clinics, weight and prevention", departments: ["preventive"] },
    ],
};

/**
 * This practice's team, in this trade's own terms.
 *
 * Every clinician is filed under a department this practice actually has, so
 * the directory filters match. Fees come from the department's own appointment
 * price rather than a separate number that could contradict the price list.
 */
export function cliniciansFor(profile: KindProfile, brand: Brand): readonly Clinician[] {
    const specs = ROLES[profile.kind] ?? ROLES["general-practice"];
    const set = BY_KIND[profile.kind] ?? GENERAL_PRACTICE;
    const next = seeded(brand.slug);

    /* Rotated from a per-site starting point rather than drawn at random:
       two clinicians with the same surname on one team reads as a mistake,
       and a random draw from 24 names collides more often than feels likely. */
    const photoStart = Math.floor(next() * PHOTO_NAMES.length);
    const firstStart = Math.floor(next() * FIRST_NAMES.length);
    const lastStart = Math.floor(next() * LAST_NAMES.length);

    return specs.map((spec, index) => {
        const first = FIRST_NAMES[(firstStart + index * 5) % FIRST_NAMES.length] ?? "Alex";
        const photographed = index < PHOTO_NAMES.length;
        const last = photographed
            ? (PHOTO_NAMES[(photoStart + index) % PHOTO_NAMES.length] ?? "Whitfield")
            : (LAST_NAMES[(lastStart + index * 7) % LAST_NAMES.length] ?? "Bennett");
        const name = `${spec.title === "" ? "" : `${spec.title} `}${first} ${last}`;

        /* The cheapest appointment in their own department, so the card and
           the price list can never disagree. */
        const own = set.appointments.filter((a) => spec.departments.includes(a.department));
        const cheapest = own.reduce<number>(
            (low, a) => (a.price > 0 && a.price < low ? a.price : low),
            Number.MAX_SAFE_INTEGER,
        );
        const fee = cheapest === Number.MAX_SAFE_INTEGER ? 0 : cheapest;

        const languages = ["English", ...(next() > 0.55 ? [EXTRA_LANGUAGES[index % EXTRA_LANGUAGES.length] ?? "Spanish"] : [])];

        return {
            name,
            role: spec.role,
            focus: spec.focus,
            initials: `${first.charAt(0)}${last.charAt(0)}`,
            years: 6 + Math.floor(next() * 24),
            registration: `Reg ${Math.floor(next() * 9) + 1}•••${Math.floor(next() * 900) + 100}`,
            qualifications: spec.qualifications,
            rating: Number((4.5 + next() * 0.5).toFixed(1)),
            reviews: 40 + Math.floor(next() * 400),
            fee: priceLabel(brand, fee),
            languages,
            site: index % 4 === 3 ? "second" : "main",
            ...(photographed ? { photo: `/img/team/${last.toLowerCase()}.jpg` } : {}),
            departments: spec.departments,
            nextSlot: {
                day: NEXT_DAYS[index % NEXT_DAYS.length] ?? "This week",
                time: SLOT_TIMES[index % SLOT_TIMES.length] ?? "09:20",
            },
        };
    });
}

const EXTRA_LANGUAGES = ["Spanish", "Arabic", "Hindi", "Mandarin", "Portuguese", "French"] as const;
const NEXT_DAYS = ["Today", "Tomorrow", "Thursday", "Tomorrow", "Friday", "Today"] as const;
const SLOT_TIMES = ["09:20", "11:40", "14:10", "16:30", "08:50", "15:00"] as const;

/* ────────────────────────────────────────────────────────────────
   Packages

   Three cards priced in pounds and written for a general practice —
   "childhood vaccinations at no extra cost", "60-minute review with a GP
   partner" — shown on dental, veterinary and optometry sites alike.

   Derived rather than written out ten times over. The single visit and the
   thorough one are this trade's own cheapest and longest appointments, so
   they can never contradict the price list on the same page. Only the
   membership plan needs saying per trade, because what a plan covers is the
   one part that is genuinely a commercial choice.
   ──────────────────────────────────────────────────────────────── */

interface PlanSpec {
    readonly name: string;
    readonly price: number;
    readonly summary: string;
    readonly includes: readonly string[];
}

const PLANS: Readonly<Record<PracticeKind, PlanSpec>> = {
    hospital: { name: "Outpatient membership", price: 55, summary: "Direct access to consultant clinics without a referral wait.", includes: ["Two consultant appointments a year", "Priority imaging slots", "Results explained by phone", "Cancel any month"] },
    "general-practice": { name: "Family cover", price: 39, summary: "Two adults and up to three children, seen as often as you need.", includes: ["Unlimited appointments for everyone named", "Same-week booking, guaranteed in writing", "Annual health check for each adult", "Blood tests on site, results in two days", "Cancel any month, no notice period"] },
    dental: { name: "Dental plan", price: 22, summary: "Check-ups and hygiene spread over monthly payments.", includes: ["Two examinations a year", "Two hygiene appointments", "X-rays when they are needed", "20% off treatment", "Worldwide dental trauma cover"] },
    physio: { name: "Recovery plan", price: 45, summary: "A course of sessions at a lower rate than booking one at a time.", includes: ["Four sessions a month", "A written programme, reviewed each visit", "Direct message access between sessions", "Cancel any month"] },
    chiro: { name: "Maintenance plan", price: 40, summary: "Regular adjustment at a lower rate than single visits.", includes: ["Three adjustments a month", "Posture review every quarter", "Priority booking", "Cancel any month"] },
    dermatology: { name: "Skin surveillance", price: 30, summary: "Annual mole mapping with the photographs kept for comparison.", includes: ["Yearly full-body dermoscopy", "Images stored and compared", "One lesion check included", "Priority appointments for anything new"] },
    optometry: { name: "Eye care plan", price: 15, summary: "Examinations and lens supply on a monthly payment.", includes: ["Annual examination with OCT", "Contact lenses delivered", "Aftercare appointments included", "Repairs and adjustments free"] },
    "mental-health": { name: "Weekly therapy", price: 320, summary: "A standing hour each week with the same therapist.", includes: ["Four sessions a month", "The same hour held for you", "Between-session message support", "Four weeks' notice to end"] },
    podiatry: { name: "Foot care plan", price: 25, summary: "Routine treatment at the interval your feet actually need.", includes: ["Treatment every six weeks", "Diabetic checks included", "Nail care and callus", "Priority booking"] },
    veterinary: { name: "Pet health plan", price: 18, summary: "Vaccinations, worming and check-ups spread over the year.", includes: ["Annual booster and health check", "Year-round flea and worm treatment", "Two nurse clinics a year", "10% off food and treatment"] },
};

/**
 * Three price cards for this practice, in its own currency.
 *
 * The first and third are real appointments from the list above, so the cards
 * and the price table are the same numbers by construction.
 */
export function packagesFor(
    profile: KindProfile,
    brand: Brand,
    appointments: readonly AppointmentType[],
    format: (value: number) => string,
): readonly Package[] {
    const paid = appointments.filter((a) => a.price > 0);
    const cheapest = paid.reduce<AppointmentType | null>((low, a) => (low === null || a.price < low.price ? a : low), null);
    const longest = appointments.reduce<AppointmentType | null>(
        (top, a) => (top === null || a.minutes > top.minutes ? a : top),
        null,
    );
    const plan = PLANS[profile.kind] ?? PLANS["general-practice"];

    const packages: Package[] = [];

    if (cheapest !== null) {
        packages.push({
            slug: "single",
            name: `Single ${profile.visit}`,
            price: format(cheapest.price),
            cadence: "per visit",
            summary: `One ${profile.visit} with the ${profile.clinician} you choose. Nothing to join.`,
            includes: [
                `${cheapest.minutes} minutes with a named ${profile.clinician}`,
                "Written summary of what was said",
                "A price agreed before anything starts",
                "A follow-up message if results are pending",
            ],
        });
    }

    packages.push({
        slug: "plan",
        name: plan.name,
        price: priceLabel(brand, plan.price),
        cadence: "per month",
        summary: plan.summary,
        includes: plan.includes,
        featured: true,
    });

    if (longest !== null && longest.id !== cheapest?.id) {
        packages.push({
            slug: "thorough",
            name: longest.name,
            price: format(longest.price),
            cadence: "one off",
            summary: `${longest.minutes} minutes, and time afterwards to go through every result.`,
            includes: [
                `${longest.minutes} minutes with a ${profile.clinician}`,
                ...(longest.note === undefined ? [] : [longest.note]),
                "A written report you keep and can share",
                "Referral letters arranged where needed",
            ],
        });
    }

    return packages;
}

/* ────────────────────────────────────────────────────────────────
   Triage

   The "not sure where to go?" cards were written for human medicine and
   shown on every site. On a veterinary practice they told pet owners to
   watch for chest pain and signs of a stroke, and to call the national
   ambulance service — which does not come for a dog, and reads as though
   nobody looked at the page before sending it.

   Only the veterinary wording genuinely differs. A dental or physiotherapy
   patient having a stroke should absolutely call an ambulance, so the human
   copy is correct for every practice that treats people.
   ──────────────────────────────────────────────────────────────── */

export interface TriageCopy {
    readonly emergency: string;
    readonly urgent: string;
    readonly routine: string;
    /** What to do when this practice is not the place to come. */
    readonly noEmergencyAdvice: (emergencyNumber: string, phone: string) => string;
    /** How the emergency card advises someone who should come here. */
    readonly emergencyAdvice: (aeLine: string, emergencyNumber: string) => string;
}

const HUMAN_TRIAGE: TriageCopy = {
    emergency:
        "Chest pain, difficulty breathing, signs of a stroke, heavy bleeding, a baby under " +
        "three months with a fever, or thoughts of harming yourself.",
    urgent:
        "Pain that is getting worse, a suspected infection, swelling, or something that has " +
        "changed since yesterday.",
    routine: "Check-ups, reviews, ongoing treatment, and anything you have been meaning to get looked at.",
    noEmergencyAdvice: (emergencyNumber) =>
        `We are not an emergency service. Call ${emergencyNumber} for an ambulance, or go ` +
        "straight to your nearest hospital emergency department. Do not wait to hear back " +
        "from us, and do not book here.",
    emergencyAdvice: (aeLine, emergencyNumber) =>
        `Come straight to our emergency department — it is open 24 hours and you do not need ` +
        `an appointment. Ring our emergency line on ${aeLine} on the way, or ${emergencyNumber} ` +
        "for an ambulance if you cannot travel. Do not book here.",
};

const VET_TRIAGE: TriageCopy = {
    emergency:
        "Difficulty breathing, collapse, a swollen or painful belly, repeated retching without " +
        "bringing anything up, a seizure, a suspected poisoning, a road accident, or straining " +
        "to pass urine with nothing coming.",
    urgent:
        "Vomiting or diarrhoea that will not settle, a wound, a limp that is getting worse, a " +
        "sore or closed eye, or an animal that has stopped eating.",
    routine: "Vaccinations, dentals, a lump you want checked, and anything you have been meaning to book.",
    /* No ambulance service comes for an animal, so the advice is to ring
       ahead and travel — which is what every out-of-hours vet asks for. */
    noEmergencyAdvice: (_emergencyNumber, phone) =>
        `Ring us on ${phone} before you set off, whatever the hour. If we cannot see you we ` +
        "will tell you straight away who can, so you are not driving between closed doors.",
    emergencyAdvice: (aeLine) =>
        `Ring us on ${aeLine} before you set off so we can be ready for you, then come ` +
        "straight in. Do not book online for this — telling us you are coming is what matters.",
};

const TRIAGE: Readonly<Partial<Record<PracticeKind, TriageCopy>>> = {
    veterinary: VET_TRIAGE,
};

export function triageFor(kind: PracticeKind): TriageCopy {
    return TRIAGE[kind] ?? HUMAN_TRIAGE;
}

/* ────────────────────────────────────────────────────────────────
   Photography

   Every site used the same eight photographs: a consulting room, a
   reception desk, a corridor, a treatment room. They were shot for a human
   clinic, and on a veterinary practice there is not an animal anywhere in
   them — which a vet notices in about a second.

   A trade that has its own photography gets it. A trade that does not falls
   back to the originals, which are neutral enough to pass for most human
   practices. Falling back is deliberate: a stock waiting room is a weak
   image, but a picture of the wrong sort of room is a wrong one.
   ──────────────────────────────────────────────────────────────── */

export interface SiteMedia {
    readonly exterior: string;
    readonly reception: string;
    readonly consulting: string;
    readonly consultation: string;
    readonly treatment: string;
    readonly waiting: string;
    readonly corridor: string;
}

const DEFAULT_MEDIA: SiteMedia = {
    exterior: "/img/exterior.jpg",
    reception: "/img/reception.jpg",
    consulting: "/img/consulting.jpg",
    consultation: "/img/consultation.jpg",
    treatment: "/img/treatment.jpg",
    waiting: "/img/waiting.jpg",
    corridor: "/img/corridor.jpg",
};

/**
 * Only the shots a trade actually has.
 *
 * Partial on purpose. Commissioning seven photographs for ten trades is
 * seventy pictures, and they will arrive a few at a time; a trade with three
 * of its own should use those three rather than wait for the set. Anything
 * missing falls back to the original, which is a weak image but a real file
 * — listing a path for a photograph that does not exist would put a broken
 * image on a prospect's page.
 */
const MEDIA: Readonly<Partial<Record<PracticeKind, Partial<SiteMedia>>>> = {
    veterinary: {
        exterior: "/img/vet/exterior.jpg",
        reception: "/img/vet/reception.jpg",
        consulting: "/img/vet/consulting.jpg",
        consultation: "/img/vet/consultation.jpg",
        treatment: "/img/vet/treatment.jpg",
        waiting: "/img/vet/waiting.jpg",
        corridor: "/img/vet/corridor.jpg",
    },
};

export function mediaFor(kind: PracticeKind): SiteMedia {
    return { ...DEFAULT_MEDIA, ...(MEDIA[kind] ?? {}) };
}

/* ────────────────────────────────────────────────────────────────
   The gallery

   Four rooms, with a line about each. The shared set is written about a
   human clinic — "registration done before you arrive", a fig tree in the
   waiting room — and points at human clinic photographs. A veterinary
   practice gets its own rooms and its own reasons.
   ──────────────────────────────────────────────────────────────── */

const VET_FACILITIES: readonly Facility[] = [
    {
        src: "/img/vet/waiting.jpg",
        alt: "Waiting area with a wooden bench, a cat in a carrier on the floor and light from a window",
        title: "Somewhere an anxious animal can settle",
        points: ["Separate space for cats", "Seats away from the door", "In and seen, not left waiting"],
    },
    {
        src: "/img/vet/reception.jpg",
        alt: "Reception area of a small veterinary practice with a dog resting on the floor by a bench",
        title: "A person, not a queuing system",
        points: ["Reception answers in person", "No phone queue at opening", "We know your animal's name"],
    },
    {
        src: "/img/vet/consulting.jpg",
        alt: "Veterinary consulting room with an examination table, daylight and pale wood cabinetry",
        title: "Room to examine properly",
        points: ["Unhurried appointments", "Everything explained as we go", "The same vet where we can"],
    },
    {
        src: "/img/vet/treatment.jpg",
        alt: "Veterinary treatment room with stainless surfaces, a surgical lamp and instrument trays",
        title: "Surgery and dentistry on site",
        points: ["Day procedures, home the same evening", "A call before and after", "Bloods run here, most back same visit"],
    },
];

const FACILITY_SETS: Readonly<Partial<Record<PracticeKind, readonly Facility[]>>> = {
    veterinary: VET_FACILITIES,
};

export function facilitiesFor(kind: PracticeKind): readonly Facility[] {
    return FACILITY_SETS[kind] ?? FACILITIES;
}

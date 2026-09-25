import { FAQS, OPENING, SERVICES } from "@/app/features/clinic/constants";
import type { Brand } from "@/app/features/clinic/brands";
import type { KindProfile, PracticeKind } from "@/app/features/clinic/practice-kinds";

/**
 * Canonical origin. Read from the environment so the same build can be served
 * from the gated preview host and from the client's own domain without a code
 * change — a hardcoded URL here silently poisons every canonical and sitemap
 * entry the moment the site moves.
 */
export function siteUrl(): string {
    return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Whether this deployment may be indexed at all.
 *
 * The invite gate and indexing are mutually exclusive: a crawler has no cookie,
 * so every URL it requests answers with the login page. While the gate is on we
 * say so honestly in robots and in the per-page metadata rather than publishing
 * a sitemap of URLs that all resolve to a sign-in form.
 */
export function isIndexable(): boolean {
    return process.env.POC_PASSWORD === undefined || process.env.POC_PASSWORD === "";
}

/** Opening hours in the schema.org shorthand crawlers expect. */
const HOURS_SPEC = [
    { days: ["Monday", "Tuesday", "Wednesday", "Thursday"], opens: "08:00", closes: "18:30" },
    { days: ["Friday"], opens: "08:00", closes: "17:00" },
    { days: ["Saturday"], opens: "09:00", closes: "13:00" },
] as const;

/**
 * The schema.org type for each trade.
 *
 * Every site declared itself a MedicalClinic, which is wrong for a dental
 * practice and plainly false for a veterinary one. These are the types search
 * engines actually recognise for each business; where none fits well enough to
 * be worth the risk of claiming it, MedicalClinic is the honest general case.
 */
const SCHEMA_TYPE: Readonly<Record<PracticeKind, string>> = {
    hospital: "Hospital",
    "general-practice": "MedicalClinic",
    dental: "Dentist",
    physio: "Physiotherapy",
    chiro: "Chiropractic",
    dermatology: "Dermatology",
    optometry: "Optician",
    "mental-health": "MedicalClinic",
    podiatry: "Podiatric",
    veterinary: "VeterinaryCare",
};

export function clinicJsonLd(brand: Brand, profile: KindProfile): Record<string, unknown> {
    const url = siteUrl();
    return {
        "@context": "https://schema.org",
        "@type": SCHEMA_TYPE[profile.kind] ?? "MedicalClinic",
        "@id": `${url}/#clinic`,
        name: brand.name,
        url,
        telephone: brand.phone,
        email: brand.email,
        address: {
            "@type": "PostalAddress",
            streetAddress: brand.address,
            addressLocality: brand.city,
            addressCountry: brand.country,
        },
        openingHoursSpecification: HOURS_SPEC.map((entry) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: entry.days,
            opens: entry.opens,
            closes: entry.closes,
        })),
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: brand.rating,
            reviewCount: brand.ratingCount.replace(/,/g, ""),
        },
        // This practice's own services. Publishing a general practice's list
        // under a dentist's name is a claim about what they provide, and the
        // one place a machine reads it rather than a person.
        availableService: profile.services.map((service) => ({
            "@type": "MedicalProcedure",
            name: service.name,
            description: service.blurb,
            url: `${url}/services/${service.slug}`,
        })),
        /* No `employee`. It was nine invented GP partners, published as
           structured data under a real business's name — the one falsehood
           here that a machine would take as fact, and nothing is lost by
           omitting it. The page still says who the team are, under a banner
           that says they are placeholders. */
        // OPENING is the copy shown on the page; keep the two from drifting.
        description: `${brand.name}. ${OPENING.map((d) => `${d.day}: ${d.hours}`).join(". ")}.`,
    };
}

export function faqJsonLd(): Record<string, unknown> {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
    };
}

export function serviceJsonLd(slug: string): Record<string, unknown> | null {
    const service = SERVICES.find((item) => item.slug === slug);
    if (!service) return null;
    const url = siteUrl();
    return {
        "@context": "https://schema.org",
        "@type": "MedicalProcedure",
        name: service.name,
        description: service.summary,
        url: `${url}/services/${service.slug}`,
        provider: { "@id": `${url}/#clinic` },
    };
}

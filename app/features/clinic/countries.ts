import type { Regulators } from "./brands";

/**
 * What changes when the clinic is in a different country.
 *
 * Without this every site inherited the United Kingdom: a clinic in Texas told
 * its patients to call 999, priced in pounds and cited the GMC. The emergency
 * number is the part that matters — a site that prints the wrong one is worse
 * than a site with no number at all, because it looks authoritative.
 *
 * The vocabulary matters nearly as much. "A&E" is meaningless to an American
 * and "ER" reads as television to a Briton; "surgery" means an operation in
 * half these markets and a doctor's office in the other half. Getting it wrong
 * is the tell that a site was written somewhere else.
 */

export interface CountryPack {
    readonly code: string;
    readonly name: string;
    /** The number to call for an ambulance. Never guessed. */
    readonly emergencyNumber: string;
    readonly currency: string;
    /** A plausible default city, used only until a record supplies one. */
    readonly defaultCity: string;
    /** Sample dialling format, so a placeholder number looks local. */
    readonly samplePhone: string;

    /** What this market calls the emergency department. */
    readonly emergencyDept: string;
    /** Short form used in running copy: "A&E", "the ER". */
    readonly emergencyShort: string;
    /** What a family doctor is called here. */
    readonly generalist: string;
    /** Plural, for headings. */
    readonly generalistPlural: string;

    readonly regulators: Regulators | null;
}

const GB_REG: Regulators = {
    doctor: "GMC",
    nurse: "NMC",
    inspectorate: "CQC",
    inspectorateNote: "Registered with the Care Quality Commission",
    retentionAuthority: "the ICO",
    vet: "RCVS",
    vetNote: "All vets on the register, annually declared",
};

const US_REG: Regulators = {
    doctor: "State Medical Board",
    nurse: "State Board of Nursing",
    inspectorate: "The Joint Commission",
    inspectorateNote: "Accredited by The Joint Commission",
    retentionAuthority: "HHS under HIPAA",
    vet: "State Veterinary Board",
    vetNote: "Every veterinarian licensed in this state",
};

const AU_REG: Regulators = {
    doctor: "AHPRA",
    nurse: "AHPRA",
    inspectorate: "ACSQHC",
    inspectorateNote: "Accredited to the National Safety and Quality Health Service Standards",
    retentionAuthority: "the OAIC",
    vet: "Veterinary Practitioners Board",
    vetNote: "Every veterinarian registered in this state",
};

const AE_REG: Regulators = {
    doctor: "DHA",
    nurse: "DHA",
    inspectorate: "DHA",
    inspectorateNote: "Licensed by the Dubai Health Authority",
    retentionAuthority: "the UAE Data Office",
    vet: "MOCCAE",
    vetNote: "Veterinarians licensed by the Ministry",
};

const MT_REG: Regulators = {
    doctor: "Medical Council of Malta",
    nurse: "Council for Nurses and Midwives",
    inspectorate: "Superintendence of Public Health",
    inspectorateNote: "Licensed by the Superintendence of Public Health",
    retentionAuthority: "the IDPC",
    vet: "Veterinary Regulation Directorate",
    vetNote: "Veterinary surgeons on the national register",
};

/**
 * Markets we have checked. A country not listed here gets no regulator and no
 * emergency number claim — see `packFor`. Inventing either would be worse than
 * omitting it.
 */
export const COUNTRIES: Readonly<Record<string, CountryPack>> = {
    /* ── the WhatsApp-first markets ──────────────────────────────────────
       Added when outreach moved into countries where WhatsApp is how a
       clinic actually talks to patients. Each one is here for one concrete
       reason: the unknown-country fallback prints 112, and a demo built for
       a dental practice in Guadalajara told its visitors to call 112 in an
       emergency. Mexico retired 112 in favour of 911 in 2016.

       `regulators` stays null for all of these. The generic licensure claims
       are true of any practice anywhere; naming a board we have not checked
       is the mistake this file has already made twice. Fill one in only
       after verifying it. */
    MX: {
        code: "MX", name: "Mexico",
        emergencyNumber: "911", currency: "$",
        defaultCity: "Guadalajara", samplePhone: "+52 33 1234 5678",
        emergencyDept: "emergency room", emergencyShort: "urgencias",
        generalist: "family doctor", generalistPlural: "doctors",
        regulators: null,
    },
    BR: {
        /* 192 is SAMU, the ambulance service. 193 reaches the fire service,
           who also attend medical calls; 192 is the one to print. */
        code: "BR", name: "Brazil",
        emergencyNumber: "192", currency: "R$",
        defaultCity: "Rio de Janeiro", samplePhone: "+55 21 91234 5678",
        emergencyDept: "emergency room", emergencyShort: "pronto-socorro",
        generalist: "family doctor", generalistPlural: "doctors",
        regulators: null,
    },
    CO: {
        code: "CO", name: "Colombia",
        emergencyNumber: "123", currency: "$",
        defaultCity: "Bogotá", samplePhone: "+57 601 234 5678",
        emergencyDept: "emergency room", emergencyShort: "urgencias",
        generalist: "family doctor", generalistPlural: "doctors",
        regulators: null,
    },
    AR: {
        /* 107 is the medical emergency line (SAME). 911 reaches the police
           in much of the country, so it is the wrong number to print on a
           clinic page. */
        code: "AR", name: "Argentina",
        emergencyNumber: "107", currency: "$",
        defaultCity: "Buenos Aires", samplePhone: "+54 11 1234 5678",
        emergencyDept: "emergency room", emergencyShort: "guardia",
        generalist: "family doctor", generalistPlural: "doctors",
        regulators: null,
    },
    SA: {
        code: "SA", name: "Saudi Arabia",
        emergencyNumber: "997", currency: "SR",
        defaultCity: "Riyadh", samplePhone: "+966 11 234 5678",
        emergencyDept: "emergency department", emergencyShort: "emergency",
        generalist: "family doctor", generalistPlural: "doctors",
        regulators: null,
    },
    ZA: {
        code: "ZA", name: "South Africa",
        emergencyNumber: "10177", currency: "R",
        defaultCity: "Johannesburg", samplePhone: "+27 11 234 5678",
        emergencyDept: "emergency room", emergencyShort: "casualty",
        generalist: "GP", generalistPlural: "GPs",
        regulators: null,
    },
    ID: {
        code: "ID", name: "Indonesia",
        emergencyNumber: "119", currency: "Rp",
        defaultCity: "Jakarta", samplePhone: "+62 21 1234 5678",
        emergencyDept: "emergency room", emergencyShort: "UGD",
        generalist: "family doctor", generalistPlural: "doctors",
        regulators: null,
    },
    MA: {
        code: "MA", name: "Morocco",
        emergencyNumber: "150", currency: "DH",
        defaultCity: "Casablanca", samplePhone: "+212 522 123 456",
        emergencyDept: "emergency department", emergencyShort: "urgences",
        generalist: "family doctor", generalistPlural: "doctors",
        regulators: null,
    },
    GB: {
        code: "GB", name: "United Kingdom",
        emergencyNumber: "999", currency: "£",
        defaultCity: "Manchester", samplePhone: "+44 20 7946 0958",
        emergencyDept: "emergency department", emergencyShort: "A&E",
        generalist: "GP", generalistPlural: "GPs",
        regulators: GB_REG,
    },
    US: {
        code: "US", name: "United States",
        emergencyNumber: "911", currency: "$",
        defaultCity: "Columbus", samplePhone: "+1 614 555 0142",
        emergencyDept: "emergency room", emergencyShort: "the ER",
        generalist: "primary care physician", generalistPlural: "physicians",
        regulators: US_REG,
    },
    AU: {
        code: "AU", name: "Australia",
        emergencyNumber: "000", currency: "A$",
        defaultCity: "Melbourne", samplePhone: "+61 3 9555 0142",
        emergencyDept: "emergency department", emergencyShort: "Emergency",
        generalist: "GP", generalistPlural: "GPs",
        regulators: AU_REG,
    },
    AE: {
        code: "AE", name: "United Arab Emirates",
        emergencyNumber: "998", currency: "AED",
        defaultCity: "Dubai", samplePhone: "+971 4 555 0142",
        emergencyDept: "emergency department", emergencyShort: "Emergency",
        generalist: "family doctor", generalistPlural: "doctors",
        regulators: AE_REG,
    },
    MT: {
        code: "MT", name: "Malta",
        emergencyNumber: "112", currency: "€",
        defaultCity: "Sliema", samplePhone: "+356 2122 0142",
        emergencyDept: "emergency department", emergencyShort: "Emergency",
        generalist: "family doctor", generalistPlural: "doctors",
        regulators: MT_REG,
    },
    IE: {
        code: "IE", name: "Ireland",
        emergencyNumber: "112", currency: "€",
        defaultCity: "Dublin", samplePhone: "+353 1 555 0142",
        emergencyDept: "emergency department", emergencyShort: "A&E",
        generalist: "GP", generalistPlural: "GPs",
        regulators: null,
    },
    IN: {
        code: "IN", name: "India",
        emergencyNumber: "112", currency: "₹",
        defaultCity: "Bengaluru", samplePhone: "+91 80 5555 0142",
        emergencyDept: "emergency department", emergencyShort: "Emergency",
        generalist: "family physician", generalistPlural: "physicians",
        regulators: null,
    },
};

export const DEFAULT_COUNTRY = "GB";

/**
 * The pack for a country code.
 *
 * An unknown code falls back to the shape of the default but keeps `regulators`
 * null, so an unchecked market never claims a regulator it may not answer to.
 * The emergency number is the one field that is never inherited from the
 * fallback — 112 is correct across the EU and reaches an operator in most of
 * the world, which is the safest thing to print when we do not know.
 */
export function packFor(code: string | undefined): CountryPack {
    const key = (code ?? DEFAULT_COUNTRY).toUpperCase();
    const known = COUNTRIES[key];
    if (known !== undefined) return known;

    const base = COUNTRIES[DEFAULT_COUNTRY] as CountryPack;
    return {
        ...base,
        code: key,
        name: key,
        emergencyNumber: "112",
        regulators: null,
    };
}

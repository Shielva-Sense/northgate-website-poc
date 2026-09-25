import type { BookingForm, ContactMethod, TimeWindow, Urgency } from "./types";

export const EMPTY_FORM: BookingForm = {
    fullName: "",
    patientType: "existing",
    phone: "",
    email: "",
    service: "",
    clinician: "any",
    window: "any",
    urgency: "routine",
    contactMethod: "phone",
    notes: "",
    consent: false,
} as const;

export const URGENCY_LABELS: Readonly<Record<Urgency, string>> = {
    routine: "Routine — next few weeks",
    soon: "Soon — within a week",
    urgent: "Urgent — I need to be seen quickly",
} as const;

export const WINDOW_LABELS: Readonly<Record<TimeWindow, string>> = {
    any: "Any time that is free",
    morning: "Weekday morning",
    afternoon: "Weekday afternoon",
    evening: "Weekday after 17:00",
    saturday: "Saturday morning",
} as const;

export const CONTACT_LABELS: Readonly<Record<ContactMethod, string>> = {
    phone: "Phone call",
    sms: "Text message",
    email: "Email",
    whatsapp: "WhatsApp",
} as const;

/** Urgent requests are escalated rather than queued. */
export const URGENT_NOTICE =
    "We will call you back rather than wait for you to reply. If you cannot get through and it is getting worse, call 111.";

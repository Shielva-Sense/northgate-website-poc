export const PATIENT_TYPES = ["existing", "new"] as const;
export type PatientType = (typeof PATIENT_TYPES)[number];

export const URGENCIES = ["routine", "soon", "urgent"] as const;
export type Urgency = (typeof URGENCIES)[number];

export const CONTACT_METHODS = ["phone", "sms", "email", "whatsapp"] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const TIME_WINDOWS = ["morning", "afternoon", "evening", "saturday", "any"] as const;
export type TimeWindow = (typeof TIME_WINDOWS)[number];

export interface BookingForm {
    fullName: string;
    patientType: PatientType;
    phone: string;
    email: string;
    service: string;
    clinician: string;
    window: TimeWindow;
    urgency: Urgency;
    contactMethod: ContactMethod;
    notes: string;
    consent: boolean;
}

export type BookingErrors = Partial<Record<keyof BookingForm, string>>;

export type SubmitState = "idle" | "submitting" | "sent";

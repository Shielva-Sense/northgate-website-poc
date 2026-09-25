import type { BookingErrors, BookingForm } from "./types";

// Deliberately permissive: a form that rejects a valid foreign number or a
// plus-addressed email costs more bookings than it saves.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_DIGITS = /\d/g;

export function validate(form: BookingForm): BookingErrors {
    const errors: BookingErrors = {};

    if (form.fullName.trim().length < 2) {
        errors.fullName = "Please tell us your name.";
    }

    const digits = form.phone.match(PHONE_DIGITS)?.length ?? 0;
    const hasPhone = digits >= 7;
    const hasEmail = EMAIL.test(form.email.trim());

    // One contactable route is the real requirement, not both fields.
    if (!hasPhone && !hasEmail) {
        errors.phone = "We need either a phone number or an email address to reply to.";
    } else {
        if (form.phone.trim() !== "" && !hasPhone) {
            errors.phone = "That does not look like a complete phone number.";
        }
        if (form.email.trim() !== "" && !hasEmail) {
            errors.email = "That email address looks incomplete.";
        }
    }

    // The chosen reply route must actually be reachable.
    if ((form.contactMethod === "email") && !hasEmail) {
        errors.email = "You asked us to reply by email, so we need an email address.";
    }
    if ((form.contactMethod === "phone" || form.contactMethod === "sms" ||
         form.contactMethod === "whatsapp") && !hasPhone) {
        errors.phone = "You asked us to reply by phone, so we need a number we can reach.";
    }

    if (form.service === "") {
        errors.service = "Please choose what the appointment is for.";
    }

    if (!form.consent) {
        errors.consent = "We need your permission to contact you about this request.";
    }

    return errors;
}

export function hasErrors(errors: BookingErrors): boolean {
    return Object.keys(errors).length > 0;
}

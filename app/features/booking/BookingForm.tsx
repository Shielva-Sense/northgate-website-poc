"use client";

import { useState } from "react";
import { LocaleLink as Link } from "@/app/components/ui/LocaleLink";
import { AlertTriangle, CalendarCheck, Loader2, Phone } from "lucide-react";
import { Field, Input, Textarea } from "@/app/components/ui/Field";
import { Checkbox, ChoiceGroup } from "@/app/components/ui/Choice";
import type { ChoiceOption } from "@/app/components/ui/Choice";
import { Button } from "@/app/components/ui/Button";
import { CONTACT_LABELS, EMPTY_FORM, URGENCY_LABELS, URGENT_NOTICE, WINDOW_LABELS } from "./constants";
import { hasErrors, validate } from "./validate";
import type {
    BookingErrors,
    BookingForm as BookingFormValues,
    ContactMethod,
    PatientType,
    SubmitState,
    TimeWindow,
    Urgency,
} from "./types";
import { useBrand, useContent } from "@/app/features/clinic/BrandContext";
import styles from "./BookingForm.module.scss";
import { useLocale } from "@/app/features/clinic/LocaleContext";
import { tr } from "@/app/core/content-ar";

const PATIENT_OPTIONS: readonly ChoiceOption<PatientType>[] = [
    { value: "existing", label: "I am already registered" },
    { value: "new", label: "I am a new patient" },
];

const URGENCY_OPTIONS: readonly ChoiceOption<Urgency>[] = (
    Object.keys(URGENCY_LABELS) as Urgency[]
).map((value) => ({ value, label: URGENCY_LABELS[value] }));

/* Both lists belong to whichever practice this host is, so neither can be a
   module constant. At module scope they were one general practice's services
   and one general practice's nine partners — offered as the choices on a
   dental site, where none of them existed.

   The appointment list is grouped by department and the clinician list is
   narrowed to whoever staffs the chosen one, because "what is it for" and
   "who would you like to see" are the same question asked twice otherwise. */
function appointmentOptions(
    departments: readonly { readonly id: string; readonly name: string }[],
    types: readonly { readonly id: string; readonly name: string; readonly department: string }[],
): readonly ChoiceOption<string>[] {
    const grouped = departments.flatMap((department) =>
        types
            .filter((type) => type.department === department.id)
            .map((type) => ({
                value: type.id,
                label: `${department.name} — ${type.name}`,
            })),
    );
    return [...grouped, { value: "other", label: "Something else" }];
}

function clinicianOptions(
    team: readonly { readonly name: string; readonly departments: readonly string[] }[],
    types: readonly { readonly id: string; readonly department: string }[],
    chosen: string,
): readonly ChoiceOption<string>[] {
    const department = types.find((type) => type.id === chosen)?.department;
    const relevant =
        department === undefined
            ? team
            : team.filter((person) => person.departments.includes(department));
    /* Falling back to the whole team rather than showing an empty list: a
       department with nobody in it is a data bug, and the person booking
       should still be able to finish. */
    const shown = relevant.length > 0 ? relevant : team;
    return [
        { value: "any", label: "No preference" },
        ...shown.map((person) => ({ value: person.name, label: person.name })),
    ];
}

const WINDOW_OPTIONS: readonly ChoiceOption<TimeWindow>[] = (
    Object.keys(WINDOW_LABELS) as TimeWindow[]
).map((value) => ({ value, label: WINDOW_LABELS[value] }));

const CONTACT_OPTIONS: readonly ChoiceOption<ContactMethod>[] = (
    Object.keys(CONTACT_LABELS) as ContactMethod[]
).map((value) => ({ value, label: CONTACT_LABELS[value] }));

export function BookingForm(): React.JSX.Element {
    const { locale } = useLocale();
    const { t } = useLocale();
    const brand = useBrand();
    const { departments, appointmentTypes, clinicians } = useContent();
    const [form, setForm] = useState<BookingFormValues>(EMPTY_FORM);
    const [errors, setErrors] = useState<BookingErrors>({});
    const [state, setState] = useState<SubmitState>("idle");
    const [submitError, setSubmitError] = useState<string | null>(null);

    function set<K extends keyof BookingFormValues>(key: K, value: BookingFormValues[K]): void {
        setForm((previous) => ({ ...previous, [key]: value }));
        // Clear a field's error the moment the user starts fixing it.
        setErrors((previous) => {
            if (!(key in previous)) return previous;
            const next = { ...previous };
            delete next[key];
            return next;
        });
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        const found = validate(form);
        setErrors(found);
        if (hasErrors(found)) {
            // Send focus to the first thing that is wrong.
            const firstInvalid = document.querySelector<HTMLElement>('[aria-invalid="true"]');
            firstInvalid?.focus();
            return;
        }
        setState("submitting");
        setSubmitError(null);
        try {
            const response = await fetch("/api/enquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!response.ok) {
                const body: unknown = await response.json().catch(() => null);
                const message =
                    typeof body === "object" && body !== null && "error" in body
                        ? String((body as Record<string, unknown>).error)
                        : "We could not send that. Please ring us instead.";
                setSubmitError(message);
                setState("idle");
                return;
            }
            setState("sent");
        } catch {
            // Offline, DNS, blocked — say so rather than showing a false success.
            setSubmitError(
                "We could not reach the practice. Please check your connection, or ring us.",
            );
            setState("idle");
        }
    }

    if (state === "sent") {
        return (
            <div className={styles.card}>
                <div className={styles.done} role="status">
                    <span className={styles.doneIcon} aria-hidden="true">
                        <CalendarCheck size={26} />
                    </span>
                    <h3 className={styles.doneTitle}>{tr("Request received", locale)}</h3>
                    <p className={styles.doneBody}>
                        Thank you, {form.fullName.split(" ")[0]}. We will confirm a time by{" "}
                        {CONTACT_LABELS[form.contactMethod].toLowerCase()}.
                        {form.urgency === "urgent" ? ` ${URGENT_NOTICE}` : ""}
                    </p>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setForm(EMPTY_FORM);
                            setState("idle");
                        }}
                    >{tr("Make another request", locale)}</Button>
                </div>
            </div>
        );
    }

    const busy = state === "submitting";

    return (
        <form className={styles.card} onSubmit={handleSubmit} noValidate>
            <p className={styles.emergency}>
                <AlertTriangle size={16} aria-hidden="true" />
                <span>
                    If this is a medical emergency, come straight to our emergency
                    department — open 24 hours, no appointment needed — or ring our
                    A&amp;E line on {brand.aeLine}. Do not use this form.
                </span>
            </p>

            <ChoiceGroup
                legend={tr("Are you already registered with us?", locale)}
                name="patientType"
                value={form.patientType}
                options={PATIENT_OPTIONS}
                onChange={(value) => set("patientType", value)}
            />

            <Field label={t("yourName")} required error={errors.fullName}>
                {(id, describedBy) => (
                    <Input
                        id={id}
                        name="fullName"
                        autoComplete="name"
                        value={form.fullName}
                        aria-required="true"
                        aria-invalid={errors.fullName ? true : undefined}
                        aria-describedby={describedBy}
                        onChange={(event) => set("fullName", event.target.value)}
                    />
                )}
            </Field>

            <div className={styles.row}>
                <Field label={tr("Phone", locale)} help={tr("Mobile is best for reminders.", locale)} error={errors.phone}>
                    {(id, describedBy) => (
                        <Input
                            id={id}
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            value={form.phone}
                            aria-invalid={errors.phone ? true : undefined}
                            aria-describedby={describedBy}
                            onChange={(event) => set("phone", event.target.value)}
                        />
                    )}
                </Field>

                <Field label={tr("Email", locale)} error={errors.email}>
                    {(id, describedBy) => (
                        <Input
                            id={id}
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            aria-invalid={errors.email ? true : undefined}
                            aria-describedby={describedBy}
                            onChange={(event) => set("email", event.target.value)}
                        />
                    )}
                </Field>
            </div>

            {/* Chips, not native selects. Every list here is short enough to
                show in full, and a <select> hides the options behind a tap,
                truncates the long ones ("No preference — soonest ava…") and
                looks like a different site on every platform. These are real
                radios in a real fieldset, so arrow keys and screen-reader
                grouping work unchanged. */}
            <ChoiceGroup
                legend={tr("What is it for?", locale)}
                name="service"
                value={form.service}
                options={appointmentOptions(departments, appointmentTypes)}
                onChange={(value) => set("service", value)}
                error={errors.service}
            />

            <ChoiceGroup
                legend={tr("Preferred clinician", locale)}
                name="clinician"
                value={form.clinician}
                options={clinicianOptions(clinicians, appointmentTypes, form.service)}
                onChange={(value) => set("clinician", value)}
            />

            <ChoiceGroup
                legend={tr("When suits you?", locale)}
                name="window"
                value={form.window}
                options={WINDOW_OPTIONS}
                onChange={(value) => set("window", value)}
            />

            <ChoiceGroup
                legend={tr("How soon do you need to be seen?", locale)}
                name="urgency"
                value={form.urgency}
                options={URGENCY_OPTIONS}
                onChange={(value) => set("urgency", value)}
            />

            {form.urgency === "urgent" ? (
                <p className={styles.urgent} role="status">
                    <Phone size={16} aria-hidden="true" />
                    <span>{URGENT_NOTICE}</span>
                </p>
            ) : null}

            <ChoiceGroup
                legend={tr("How should we reply?", locale)}
                name="contactMethod"
                value={form.contactMethod}
                options={CONTACT_OPTIONS}
                onChange={(value) => set("contactMethod", value)}
            />

            <Field
                label={tr("Anything we should know?", locale)}
                help={tr("Optional. Please do not include sensitive clinical detail here.", locale)}
            >
                {(id, describedBy) => (
                    <Textarea
                        id={id}
                        name="notes"
                        rows={3}
                        value={form.notes}
                        aria-describedby={describedBy}
                        onChange={(event) => set("notes", event.target.value)}
                    />
                )}
            </Field>

            <Checkbox
                checked={form.consent}
                onChange={(checked) => set("consent", checked)}
                error={errors.consent}
            >
                I agree to be contacted about this request. What you write here may include
                health information; we keep it only as long as needed to arrange your appointment
                and you can withdraw this at any time. See our{" "}
                <Link href="/privacy">privacy notice</Link>.
            </Checkbox>

            {submitError ? (

                <p className={styles.alert} role="alert">

                    <AlertTriangle size={17} aria-hidden="true" />

                    <span>{submitError}</span>

                </p>

            ) : null}

            <Button
                type="submit"
                size="lg"
                fullWidth
                disabled={busy}
                leftIcon={
                    busy ? (
                        <Loader2 size={16} className={styles.spin} aria-hidden="true" />
                    ) : (
                        <CalendarCheck size={16} aria-hidden="true" />
                    )
                }
            >
                {busy ? "Sending…" : "Request an appointment"}
            </Button>

            <p className={styles.formNote}>{tr("Sample build — this request is not transmitted anywhere. In a live site it writes straight into the practice CRM.", locale)}</p>
        </form>
    );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarCheck, Loader2, Phone } from "lucide-react";
import { Field, Input, Select, Textarea } from "@/app/components/ui/Field";
import { Checkbox, ChoiceGroup } from "@/app/components/ui/Choice";
import type { ChoiceOption } from "@/app/components/ui/Choice";
import { Button } from "@/app/components/ui/Button";
import { CLINICIANS, SERVICES } from "@/app/features/clinic/constants";
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
import { useBrand } from "@/app/features/clinic/BrandContext";
import styles from "./BookingForm.module.scss";

const PATIENT_OPTIONS: readonly ChoiceOption<PatientType>[] = [
    { value: "existing", label: "I am already registered" },
    { value: "new", label: "I am a new patient" },
];

const URGENCY_OPTIONS: readonly ChoiceOption<Urgency>[] = (
    Object.keys(URGENCY_LABELS) as Urgency[]
).map((value) => ({ value, label: URGENCY_LABELS[value] }));

const CONTACT_OPTIONS: readonly ChoiceOption<ContactMethod>[] = (
    Object.keys(CONTACT_LABELS) as ContactMethod[]
).map((value) => ({ value, label: CONTACT_LABELS[value] }));

export function BookingForm(): React.JSX.Element {
    const brand = useBrand();
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
                    <h3 className={styles.doneTitle}>Request received</h3>
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
                    >
                        Make another request
                    </Button>
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
                    If this is a medical emergency, call {brand.emergencyNumber} or go to
                    your nearest emergency department. Do not use this form.
                </span>
            </p>

            <ChoiceGroup
                legend="Are you already registered with us?"
                name="patientType"
                value={form.patientType}
                options={PATIENT_OPTIONS}
                onChange={(value) => set("patientType", value)}
            />

            <Field label="Your name" required error={errors.fullName}>
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
                <Field label="Phone" help="Mobile is best for reminders." error={errors.phone}>
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

                <Field label="Email" error={errors.email}>
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

            <div className={styles.row}>
                <Field label="What is it for?" required error={errors.service}>
                    {(id, describedBy) => (
                        <Select
                            id={id}
                            name="service"
                            value={form.service}
                            aria-required="true"
                            aria-invalid={errors.service ? true : undefined}
                            aria-describedby={describedBy}
                            onChange={(event) => set("service", event.target.value)}
                        >
                            <option value="">Please choose…</option>
                            {SERVICES.map((service) => (
                                <option key={service.slug} value={service.slug}>
                                    {service.name}
                                </option>
                            ))}
                            <option value="other">Something else</option>
                        </Select>
                    )}
                </Field>

                <Field label="Preferred clinician">
                    {(id) => (
                        <Select
                            id={id}
                            name="clinician"
                            value={form.clinician}
                            onChange={(event) => set("clinician", event.target.value)}
                        >
                            <option value="any">No preference — soonest available</option>
                            {CLINICIANS.map((person) => (
                                <option key={person.name} value={person.name}>
                                    {person.name} — {person.role}
                                </option>
                            ))}
                        </Select>
                    )}
                </Field>
            </div>

            <Field label="When suits you?">
                {(id) => (
                    <Select
                        id={id}
                        name="window"
                        value={form.window}
                        onChange={(event) => set("window", event.target.value as TimeWindow)}
                    >
                        {(Object.keys(WINDOW_LABELS) as TimeWindow[]).map((value) => (
                            <option key={value} value={value}>
                                {WINDOW_LABELS[value]}
                            </option>
                        ))}
                    </Select>
                )}
            </Field>

            <ChoiceGroup
                legend="How soon do you need to be seen?"
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
                legend="How should we reply?"
                name="contactMethod"
                value={form.contactMethod}
                options={CONTACT_OPTIONS}
                onChange={(value) => set("contactMethod", value)}
            />

            <Field
                label="Anything we should know?"
                help="Optional. Please do not include sensitive clinical detail here."
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

            <p className={styles.formNote}>
                Sample build — this request is not transmitted anywhere. In a live site it writes
                straight into the practice CRM.
            </p>
        </form>
    );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import { Field, Input, Textarea } from "@/app/components/ui/Field";
import { Checkbox, ChoiceGroup } from "@/app/components/ui/Choice";
import type { ChoiceOption } from "@/app/components/ui/Choice";
import { Button } from "@/app/components/ui/Button";
import { useBrand, useContent } from "@/app/features/clinic/BrandContext";
import styles from "./Refer.module.scss";

/* Built from this practice's own departments rather than a module constant,
   which froze one clinic's list onto every site on the farm. */
function deptOptions(departments: readonly { readonly name: string }[]): readonly ChoiceOption<string>[] {
    return [
        { value: "", label: "Not sure — please triage" },
        ...departments.map((d) => ({ value: d.name, label: d.name })),
    ];
}

const URGENCY_OPTIONS: readonly ChoiceOption<string>[] = [
    { value: "routine", label: "Routine" },
    { value: "soon", label: "Soon — within a week" },
    { value: "urgent", label: "Urgent — same working day" },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Errors = Partial<Record<
    "referrerName" | "referrerEmail" | "patientName" | "patientContact" | "reason" | "consent",
    string
>>;

/**
 * Clinician-to-clinician referral.
 *
 * Structurally different from the patient booking form, and deliberately so.
 * The person filling this in is not the data subject — they are handing over
 * someone else's clinical information — so the form asks who they are, who
 * the patient is, and makes them confirm the patient agreed to it. That
 * confirmation is the lawful basis for us holding any of it, and without the
 * checkbox the form does not submit.
 */
export function ReferClient(): React.JSX.Element {
    const brand = useBrand();
    const { departments } = useContent();
    const [referrerName, setReferrerName] = useState("");
    const [referrerPractice, setReferrerPractice] = useState("");
    const [referrerEmail, setReferrerEmail] = useState("");
    const [patientName, setPatientName] = useState("");
    const [patientDob, setPatientDob] = useState("");
    const [patientContact, setPatientContact] = useState("");
    const [department, setDepartment] = useState("");
    const [urgency, setUrgency] = useState("routine");
    const [reason, setReason] = useState("");
    const [consent, setConsent] = useState(false);
    const [errors, setErrors] = useState<Errors>({});
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState<string | null>(null);
    const [reference, setReference] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        const found: Errors = {};
        if (referrerName.trim().length < 2) found.referrerName = "Please give your name.";
        if (!EMAIL.test(referrerEmail.trim())) {
            found.referrerEmail = "We reply to you by email, so we need a working address.";
        }
        if (patientName.trim().length < 2) found.patientName = "Please give the patient's name.";
        if (patientContact.trim().length < 5) {
            found.patientContact = "We need a way to contact the patient to offer them a time.";
        }
        if (reason.trim().length < 10) {
            found.reason = "A sentence or two on the reason for referral, please.";
        }
        if (!consent) {
            found.consent = "We cannot accept a referral without confirming the patient agreed.";
        }
        setErrors(found);
        if (Object.keys(found).length > 0) {
            document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
            return;
        }

        setBusy(true);
        setFailed(null);
        try {
            const response = await fetch("/api/enquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: patientName,
                    phone: patientContact,
                    email: referrerEmail,
                    service: `Referral — ${department === "" ? "unspecified" : department}`,
                    clinician: `Referred by ${referrerName}${referrerPractice === "" ? "" : `, ${referrerPractice}`}`,
                    urgency,
                    notes: `DOB: ${patientDob || "not given"}. Reason: ${reason}`,
                    consent: true,
                }),
            });
            const body: unknown = await response.json().catch(() => null);
            if (!response.ok) {
                setFailed(
                    typeof body === "object" && body !== null && "error" in body
                        ? String((body as Record<string, unknown>).error)
                        : "We could not log that referral. Please ring us instead.",
                );
                setBusy(false);
                return;
            }
            const ref =
                typeof body === "object" && body !== null && "reference" in body
                    ? String((body as Record<string, unknown>).reference)
                    : "";
            setReference(ref);
        } catch {
            setFailed("We could not reach the practice. Please ring us instead.");
        }
        setBusy(false);
    }

    if (reference !== null) {
        return (
            <div className={styles.panel}>
                <span className={styles.doneIco} aria-hidden="true">
                    <Check size={24} />
                </span>
                <h2 className={styles.title} role="status">
                    Referral received
                </h2>
                <p className={styles.body}>
                    Reference <b>{reference}</b>. We will contact {patientName.trim()} directly to
                    offer a time, and write back to you at {referrerEmail.trim()} once they have
                    been seen.
                </p>
                <p className={styles.body}>
                    Urgent referrals are picked up the same working day. If this needs to be seen
                    sooner than that, ring us on <a href={brand.phoneHref}>{brand.phone}</a> and say
                    it is a referral.
                </p>
            </div>
        );
    }

    return (
        <form className={styles.panel} onSubmit={(event) => void handleSubmit(event)} noValidate>
            <h2 className={styles.title}>Refer a patient</h2>
            <p className={styles.body}>
                For GPs, consultants, dentists, physiotherapists and other clinicians. If you are a
                patient, please <Link href="/#book">book an appointment</Link> instead.
            </p>

            <fieldset className={styles.group}>
                <legend className={styles.legend}>About you</legend>
                <Field label="Your name" required error={errors.referrerName}>
                    {(id, describedBy) => (
                        <Input
                            id={id}
                            value={referrerName}
                            aria-invalid={errors.referrerName ? true : undefined}
                            aria-describedby={describedBy}
                            onChange={(event) => setReferrerName(event.target.value)}
                        />
                    )}
                </Field>
                <div className={styles.pair}>
                    <Field label="Your practice or organisation">
                        {(id) => (
                            <Input
                                id={id}
                                value={referrerPractice}
                                onChange={(event) => setReferrerPractice(event.target.value)}
                            />
                        )}
                    </Field>
                    <Field label="Your email" required error={errors.referrerEmail}>
                        {(id, describedBy) => (
                            <Input
                                id={id}
                                type="email"
                                value={referrerEmail}
                                aria-invalid={errors.referrerEmail ? true : undefined}
                                aria-describedby={describedBy}
                                onChange={(event) => setReferrerEmail(event.target.value)}
                            />
                        )}
                    </Field>
                </div>
            </fieldset>

            <fieldset className={styles.group}>
                <legend className={styles.legend}>About the patient</legend>
                <div className={styles.pair}>
                    <Field label="Patient name" required error={errors.patientName}>
                        {(id, describedBy) => (
                            <Input
                                id={id}
                                value={patientName}
                                aria-invalid={errors.patientName ? true : undefined}
                                aria-describedby={describedBy}
                                onChange={(event) => setPatientName(event.target.value)}
                            />
                        )}
                    </Field>
                    <Field label="Date of birth">
                        {(id) => (
                            <Input
                                id={id}
                                placeholder="DD/MM/YYYY"
                                value={patientDob}
                                onChange={(event) => setPatientDob(event.target.value)}
                            />
                        )}
                    </Field>
                </div>
                <Field
                    label="Patient phone or email"
                    required
                    error={errors.patientContact}
                    help="So we can offer them a time directly rather than going back through you."
                >
                    {(id, describedBy) => (
                        <Input
                            id={id}
                            value={patientContact}
                            aria-invalid={errors.patientContact ? true : undefined}
                            aria-describedby={describedBy}
                            onChange={(event) => setPatientContact(event.target.value)}
                        />
                    )}
                </Field>
            </fieldset>

            <fieldset className={styles.group}>
                <legend className={styles.legend}>The referral</legend>
                <div className={styles.pair}>
                </div>
                <ChoiceGroup
                    legend="Department"
                    name="department"
                    value={department}
                    options={deptOptions(departments)}
                    onChange={setDepartment}
                />

                <ChoiceGroup
                    legend="Urgency"
                    name="urgency"
                    value={urgency}
                    options={URGENCY_OPTIONS}
                    onChange={setUrgency}
                />

                <Field
                    label="Reason for referral"
                    required
                    error={errors.reason}
                    help="Relevant history, findings, and what you would like from us."
                >
                    {(id, describedBy) => (
                        <Textarea
                            id={id}
                            rows={5}
                            value={reason}
                            aria-invalid={errors.reason ? true : undefined}
                            aria-describedby={describedBy}
                            onChange={(event) => setReason(event.target.value)}
                        />
                    )}
                </Field>
            </fieldset>

            <Checkbox checked={consent} onChange={setConsent} error={errors.consent}>
                I confirm the patient has agreed to this referral and to their details being
                shared with {brand.name} for it.
            </Checkbox>

            {failed === null ? null : (
                <p className={styles.failed} role="alert">
                    {failed}
                </p>
            )}

            <Button type="submit" size="lg" disabled={busy}>
                {busy ? "Sending…" : "Send referral"}
            </Button>

            <p className={styles.note}>
                <ShieldCheck size={14} aria-hidden="true" />
                This form carries clinical information about someone who is not filling it in. It is
                held under the same terms as our own records — see our{" "}
                <Link href="/privacy">privacy notice</Link>. Please do not use it for anything that needs
                to be seen today; ring instead.
            </p>
        </form>
    );
}

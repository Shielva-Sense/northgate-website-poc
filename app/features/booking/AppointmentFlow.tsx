"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CalendarCheck, Check, Clock, ShieldCheck } from "lucide-react";
import { Field, Input, Textarea } from "@/app/components/ui/Field";
import { Button } from "@/app/components/ui/Button";
import { useBrand } from "@/app/features/clinic/BrandContext";
import { CLINICIANS } from "@/app/features/clinic/constants";
import { slotsFor } from "@/app/features/clinic/care";
import type { Slot } from "@/app/features/clinic/care";
import type { Clinician } from "@/app/features/clinic/types";
import styles from "./AppointmentFlow.module.scss";

type Step = "clinician" | "details" | "slot" | "done";

const STEP_LABELS: Readonly<Record<Exclude<Step, "done">, string>> = {
    clinician: "Choose a clinician",
    details: "Your details",
    slot: "Pick a time",
};

const ORDER: readonly Exclude<Step, "done">[] = ["clinician", "details", "slot"];

const PHONE_DIGITS = /\d/g;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * How to refer to someone in running copy. A doctor keeps the title and takes
 * the surname ("Dr Nandakumar"); everyone else takes their first name, because
 * "Okonkwo knows who is coming" reads like a summons.
 */
function familiarName(person: Clinician): string {
    const parts = person.name.split(" ").filter(Boolean);
    if (parts[0] === "Dr") return `Dr ${parts[parts.length - 1]}`;
    return parts[0] ?? person.name;
}

type Props = {
    /** Narrow the list — set when arriving from a service or a department. */
    readonly department?: string | undefined;
    readonly serviceName?: string | undefined;
};

/**
 * The booking journey: who, then who you are, then when.
 *
 * Deliberately in that order. Asking for a time before we know the clinician
 * means showing slots that may not exist for the person they actually want,
 * and asking for contact details last means losing everyone who abandons at
 * the calendar — by then we already know how to reach them.
 *
 * Each step is reachable backwards without losing what was entered, because a
 * patient changing their mind about a clinician should not have to retype
 * their phone number.
 */
export function AppointmentFlow({ department, serviceName }: Props): React.JSX.Element {
    const brand = useBrand();
    const [step, setStep] = useState<Step>("clinician");
    const [clinician, setClinician] = useState<Clinician | null>(null);
    const [slot, setSlot] = useState<Slot | null>(null);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [notes, setNotes] = useState("");
    const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string }>({});
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState<string | null>(null);

    const people = useMemo(
        () =>
            department === undefined
                ? CLINICIANS
                : CLINICIANS.filter((person) => person.departments.includes(department)),
        [department],
    );

    const slots = clinician === null ? [] : slotsFor(clinician.name);

    function chooseClinician(person: Clinician): void {
        setClinician(person);
        // Changing clinician invalidates a slot chosen from someone else's diary.
        setSlot(null);
        setStep("details");
    }

    function validateDetails(): boolean {
        const found: { name?: string; phone?: string; email?: string } = {};
        if (name.trim().length < 2) found.name = "Please tell us your name.";
        const digits = phone.match(PHONE_DIGITS)?.length ?? 0;
        const hasEmail = EMAIL.test(email.trim());
        if (digits < 7 && !hasEmail) {
            found.phone = "We need a phone number or an email address to confirm with.";
        } else if (phone.trim() !== "" && digits < 7) {
            found.phone = "That does not look like a complete phone number.";
        } else if (email.trim() !== "" && !hasEmail) {
            found.email = "That email address looks incomplete.";
        }
        setErrors(found);
        if (Object.keys(found).length > 0) {
            document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
            return false;
        }
        return true;
    }

    async function confirm(chosen: Slot): Promise<void> {
        setSlot(chosen);
        setBusy(true);
        setFailed(null);
        try {
            const response = await fetch("/api/enquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: name,
                    phone,
                    email,
                    service: serviceName ?? "Appointment",
                    clinician: clinician?.name ?? "",
                    window: `${chosen.day} ${chosen.time}`,
                    urgency: "routine",
                    notes,
                    consent: true,
                }),
            });
            if (!response.ok) {
                const body: unknown = await response.json().catch(() => null);
                setFailed(
                    typeof body === "object" && body !== null && "error" in body
                        ? String((body as Record<string, unknown>).error)
                        : "We could not confirm that. Please ring us instead.",
                );
                setBusy(false);
                return;
            }
            setStep("done");
        } catch {
            setFailed("We could not reach the practice. Please ring us instead.");
        }
        setBusy(false);
    }

    if (step === "done" && clinician !== null && slot !== null) {
        return (
            <div className={styles.panel}>
                <div className={styles.doneMark} aria-hidden="true">
                    <CalendarCheck size={30} />
                </div>
                <h2 className={styles.doneTitle} role="status">
                    Your appointment is scheduled
                </h2>
                <dl className={styles.summary}>
                    <div>
                        <dt>Who</dt>
                        <dd>
                            {clinician.name} &middot; {clinician.role}
                        </dd>
                    </div>
                    <div>
                        <dt>When</dt>
                        <dd>
                            {slot.day}, {slot.time}
                        </dd>
                    </div>
                    <div>
                        <dt>Where</dt>
                        <dd>{brand.address}</dd>
                    </div>
                    <div>
                        <dt>Confirmation to</dt>
                        <dd>{phone.trim() !== "" ? phone : email}</dd>
                    </div>
                </dl>
                <p className={styles.doneNote}>
                    We have sent a confirmation. Reply to it to move or cancel — cancelling frees
                    the slot for someone else, which is why we ask.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.panel}>
            <ol className={styles.steps} aria-label="Booking progress">
                {ORDER.map((id, index) => {
                    const position = ORDER.indexOf(step as Exclude<Step, "done">);
                    const state = index < position ? "done" : index === position ? "now" : "todo";
                    return (
                        <li key={id} className={styles.stepItem} data-state={state}>
                            <span className={styles.stepDot} aria-hidden="true">
                                {state === "done" ? <Check size={13} /> : index + 1}
                            </span>
                            <span className={styles.stepLabel}>{STEP_LABELS[id]}</span>
                        </li>
                    );
                })}
            </ol>

            {step === "clinician" ? (
                <>
                    <h2 className={styles.title}>
                        {serviceName === undefined
                            ? "Who would you like to see?"
                            : `Who would you like to see about ${serviceName.toLowerCase()}?`}
                    </h2>
                    <ul className={styles.people} role="list">
                        {people.map((person) => {
                            const free = slotsFor(person.name).filter((s) => s.taken !== true);
                            return (
                                <li key={person.name}>
                                    <button
                                        type="button"
                                        className={styles.person}
                                        onClick={() => chooseClinician(person)}
                                    >
                                        <span className={styles.portrait} aria-hidden="true">
                                            {person.photo === undefined ? (
                                                <span className={styles.monogram}>
                                                    {person.initials}
                                                </span>
                                            ) : (
                                                <Image
                                                    src={person.photo}
                                                    alt=""
                                                    width={120}
                                                    height={150}
                                                    className={styles.portraitImg}
                                                />
                                            )}
                                        </span>
                                        <span className={styles.personBody}>
                                            <span className={styles.personName}>{person.name}</span>
                                            <span className={styles.personRole}>{person.role}</span>
                                            <span className={styles.personFocus}>
                                                {person.focus}
                                            </span>
                                            <span className={styles.personFree}>
                                                <Clock size={13} aria-hidden="true" />
                                                {free.length === 0
                                                    ? "No free slots this week"
                                                    : `${free.length} free · next ${free[0]?.day} ${free[0]?.time}`}
                                            </span>
                                        </span>
                                        <ArrowRight size={18} aria-hidden="true" />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </>
            ) : null}

            {step === "details" && clinician !== null ? (
                <>
                    <h2 className={styles.title}>Your details</h2>
                    <p className={styles.sub}>
                        So {familiarName(clinician)} knows who is coming, and so we
                        can confirm.
                    </p>

                    <Field label="Your name" required error={errors.name}>
                        {(id, describedBy) => (
                            <Input
                                id={id}
                                autoComplete="name"
                                value={name}
                                aria-invalid={errors.name ? true : undefined}
                                aria-describedby={describedBy}
                                onChange={(event) => setName(event.target.value)}
                            />
                        )}
                    </Field>

                    <div className={styles.pair}>
                        <Field label="Mobile number" error={errors.phone}>
                            {(id, describedBy) => (
                                <Input
                                    id={id}
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    value={phone}
                                    aria-invalid={errors.phone ? true : undefined}
                                    aria-describedby={describedBy}
                                    onChange={(event) => setPhone(event.target.value)}
                                />
                            )}
                        </Field>
                        <Field label="Email" error={errors.email}>
                            {(id, describedBy) => (
                                <Input
                                    id={id}
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    aria-invalid={errors.email ? true : undefined}
                                    aria-describedby={describedBy}
                                    onChange={(event) => setEmail(event.target.value)}
                                />
                            )}
                        </Field>
                    </div>

                    <Field
                        label="Anything we should know"
                        help="Optional. Only what you are comfortable writing down."
                    >
                        {(id, describedBy) => (
                            <Textarea
                                id={id}
                                rows={3}
                                value={notes}
                                aria-describedby={describedBy}
                                onChange={(event) => setNotes(event.target.value)}
                            />
                        )}
                    </Field>

                    <div className={styles.actions}>
                        <Button
                            variant="ghost"
                            onClick={() => setStep("clinician")}
                            leftIcon={<ArrowLeft size={16} />}
                        >
                            Back
                        </Button>
                        <Button
                            size="lg"
                            rightIcon={<ArrowRight size={16} />}
                            onClick={() => {
                                if (validateDetails()) setStep("slot");
                            }}
                        >
                            See {familiarName(clinician)}&rsquo;s availability
                        </Button>
                    </div>
                </>
            ) : null}

            {step === "slot" && clinician !== null ? (
                <>
                    <h2 className={styles.title}>
                        When suits you, {name.trim().split(" ")[0]}?
                    </h2>
                    <p className={styles.sub}>
                        {clinician.name}&rsquo;s open slots. Greyed times are already taken.
                    </p>

                    {slots.length === 0 ? (
                        <p className={styles.empty}>
                            No published slots this week. Ring {brand.phone} and reception will
                            find one.
                        </p>
                    ) : (
                        <ul className={styles.slots} role="list">
                            {slots.map((option) => (
                                <li key={option.id}>
                                    <button
                                        type="button"
                                        className={styles.slot}
                                        disabled={option.taken === true || busy}
                                        onClick={() => void confirm(option)}
                                    >
                                        <span className={styles.slotDay}>{option.day}</span>
                                        <span className={styles.slotTime}>{option.time}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {failed === null ? null : (
                        <p className={styles.failed} role="alert">
                            {failed}
                        </p>
                    )}

                    <div className={styles.actions}>
                        <Button
                            variant="ghost"
                            onClick={() => setStep("details")}
                            leftIcon={<ArrowLeft size={16} />}
                        >
                            Back
                        </Button>
                        <p className={styles.privacy}>
                            <ShieldCheck size={14} aria-hidden="true" />
                            Used to arrange this appointment. Never passed on.
                        </p>
                    </div>
                </>
            ) : null}
        </div>
    );
}

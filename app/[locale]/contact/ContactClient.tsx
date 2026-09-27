"use client";

import { useState } from "react";
import { ArrowRight, Check, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { Field, Input, Textarea } from "@/app/components/ui/Field";
import { ChoiceGroup } from "@/app/components/ui/Choice";
import type { ChoiceOption } from "@/app/components/ui/Choice";
import { Button } from "@/app/components/ui/Button";
import { useContent, useBrand } from "@/app/features/clinic/BrandContext";
import styles from "./Contact.module.scss";
import { tr } from "@/app/core/content-ar";
import { useLocale } from "@/app/features/clinic/LocaleContext";

/* Built inside the component, not at module scope: the departments belong to
   whichever practice this host is, and a module constant froze one clinic's
   list onto every site on the farm. */
function aboutOptions(departments: readonly { readonly name: string }[]): readonly ChoiceOption<string>[] {
    return [
        { value: "", label: "General enquiry" },
        ...departments.map((d) => ({ value: d.name, label: d.name })),
    ];
}

const PHONE_DIGITS = /\d/g;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Prefilled so the first message says something useful, not "hi". */
const WHATSAPP_OPENER =
    "Hello, I would like to ask about an appointment. My name is ";

export function ContactClient(): React.JSX.Element {
    const { locale } = useLocale();
    const brand = useBrand();
    const { departments } = useContent();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [about, setAbout] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<{ name?: string; phone?: string; message?: string }>({});
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const waHref = `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(WHATSAPP_OPENER)}`;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        const found: { name?: string; phone?: string; message?: string } = {};
        if (name.trim().length < 2) found.name = "Please tell us your name.";
        const digits = phone.match(PHONE_DIGITS)?.length ?? 0;
        if (digits < 7 && !EMAIL.test(email.trim())) {
            found.phone = "We need a phone number or an email address to reply to.";
        }
        if (message.trim().length < 5) found.message = "Tell us briefly what it is about.";
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
                    fullName: name,
                    phone,
                    email,
                    service: about === "" ? "General enquiry" : about,
                    urgency: "routine",
                    notes: message,
                    consent: true,
                }),
            });
            if (!response.ok) {
                const body: unknown = await response.json().catch(() => null);
                setFailed(
                    typeof body === "object" && body !== null && "error" in body
                        ? String((body as Record<string, unknown>).error)
                        : "We could not send that. Please ring us instead.",
                );
                setBusy(false);
                return;
            }
            setSent(true);
        } catch {
            setFailed("We could not reach the practice. Please ring us instead.");
        }
        setBusy(false);
    }

    return (
        <div className={styles.grid}>
            {/* WhatsApp */}
            <a className={`${styles.route} ${styles.whatsapp}`} href={waHref} target="_blank" rel="noopener noreferrer">
                <span className={styles.routeIco} aria-hidden="true">
                    <MessageCircle size={22} />
                </span>
                <h2 className={styles.routeTitle}>{tr("WhatsApp", locale)}</h2>
                <p className={styles.routeBody}>{tr("Best for quick questions, moving an appointment, or asking whether you need one at all. Answered during opening hours.", locale)}</p>
                <span className={styles.routeAction}>{tr("Message us", locale)}<ArrowRight size={16} aria-hidden="true" />
                </span>
                <span className={styles.routeNote}>{tr("Opens WhatsApp. Please do not send clinical photographs or test results here.", locale)}</span>
            </a>

            {/* Phone */}
            <a className={styles.route} href={brand.phoneHref}>
                <span className={styles.routeIco} aria-hidden="true">
                    <Phone size={22} />
                </span>
                <h2 className={styles.routeTitle}>{tr("Call us", locale)}</h2>
                <p className={styles.routeBody}>{tr("Reception answers in person. Best if it is urgent, if you would rather talk, or if you need a same-day slot — ring before 10am for those.", locale)}</p>
                <span className={styles.routeAction}>
                    {brand.phone}
                    <ArrowRight size={16} aria-hidden="true" />
                </span>
                <span className={styles.routeNote}>
                    If it is an emergency, call {brand.emergencyNumber} instead.
                </span>
            </a>

            {/* Form */}
            <div className={`${styles.route} ${styles.formCard}`}>
                {sent ? (
                    <>
                        <span className={styles.doneIco} aria-hidden="true">
                            <Check size={22} />
                        </span>
                        <h2 className={styles.routeTitle} role="status">
                            Thank you, {name.trim().split(" ")[0]}
                        </h2>
                        <p className={styles.routeBody}>{tr("We have your message. During opening hours we reply the same day, and first thing the next morning otherwise.", locale)}</p>
                    </>
                ) : (
                    <form onSubmit={(event) => void handleSubmit(event)} noValidate>
                        <h2 className={styles.routeTitle}>{tr("Send a message", locale)}</h2>
                        <p className={styles.routeBody}>{tr("Best if it is not urgent and you would rather write it down.", locale)}</p>

                        <Field label={tr("Your name", locale)} required error={errors.name}>
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

                        <Field label={tr("Phone", locale)} error={errors.phone}>
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

                        <Field label={tr("Email", locale)}>
                            {(id) => (
                                <Input
                                    id={id}
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                />
                            )}
                        </Field>

                        <ChoiceGroup
                            legend={tr("What is it about", locale)}
                            name="about"
                            value={about}
                            options={aboutOptions(departments)}
                            onChange={setAbout}
                        />


                        <Field
                            label={tr("Your message", locale)}
                            required
                            error={errors.message}
                            help={tr("Only what you are comfortable writing down.", locale)}
                        >
                            {(id, describedBy) => (
                                <Textarea
                                    id={id}
                                    rows={4}
                                    value={message}
                                    aria-invalid={errors.message ? true : undefined}
                                    aria-describedby={describedBy}
                                    onChange={(event) => setMessage(event.target.value)}
                                />
                            )}
                        </Field>

                        {failed === null ? null : (
                            <p className={styles.failed} role="alert">
                                {failed}
                            </p>
                        )}

                        <Button type="submit" fullWidth size="lg" disabled={busy}>
                            {busy ? "Sending…" : "Send message"}
                        </Button>

                        <p className={styles.routeNote}>
                            <ShieldCheck size={14} aria-hidden="true" />{tr("Used to answer you and nothing else. Never passed on.", locale)}</p>
                    </form>
                )}
            </div>
        </div>
    );
}

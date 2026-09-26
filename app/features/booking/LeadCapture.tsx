"use client";

import { useState } from "react";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { Field, Input } from "@/app/components/ui/Field";
import { Button } from "@/app/components/ui/Button";
import styles from "./LeadCapture.module.scss";
import { useLocale } from "@/app/features/clinic/LocaleContext";

const PHONE_DIGITS = /\d/g;

/**
 * The two-field opener.
 *
 * Every extra field costs completions, so this asks only what is needed to ring
 * someone back. The full booking form lower down exists for people who would
 * rather give the detail up front; this exists for the ones who would not.
 */
export function LeadCapture(): React.JSX.Element {
    const { t } = useLocale();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
    const [sent, setSent] = useState(false);
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState<string | null>(null);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        const found: { name?: string; phone?: string } = {};
        if (name.trim().length < 2) found.name = "Please tell us your name.";
        if ((phone.match(PHONE_DIGITS)?.length ?? 0) < 7) {
            found.phone = "We need a number we can reach you on.";
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
                    fullName: name,
                    phone,
                    email: "",
                    service: "callback",
                    urgency: "routine",
                    notes: "Requested a call back from the home page.",
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
            setBusy(false);
        }
    }

    if (sent) {
        return (
            <div className={styles.panel}>
                <p className={styles.doneIcon} aria-hidden="true">
                    <Check size={22} />
                </p>
                <h2 className={styles.doneTitle} role="status">
                    Thank you, {name.trim().split(" ")[0]}
                </h2>
                <p className={styles.doneBody}>
                    Reception will ring you on {phone.trim()} with the next three openings. During
                    opening hours that is usually inside the hour.
                </p>
            </div>
        );
    }

    return (
        <form className={styles.panel} onSubmit={(event) => void handleSubmit(event)} noValidate>
            <h2 className={styles.title}>{t("leadTitle")}</h2>
            <p className={styles.sub}>
                {t("leadLede")}
            </p>

            <Field label={t("yourName")} required error={errors.name}>
                {(id, describedBy) => (
                    <Input
                        id={id}
                        name="name"
                        autoComplete="name"
                        value={name}
                        aria-invalid={errors.name ? true : undefined}
                        aria-describedby={describedBy}
                        onChange={(event) => setName(event.target.value)}
                    />
                )}
            </Field>

            <Field label={t("mobileNumber")} required error={errors.phone}>
                {(id, describedBy) => (
                    <Input
                        id={id}
                        name="phone"
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

            {failed ? (
                <p className={styles.failed} role="alert">
                    {failed}
                </p>
            ) : null}

            <Button
                type="submit"
                size="lg"
                fullWidth
                disabled={busy}
                rightIcon={<ArrowRight size={16} />}
            >
                {busy ? t("sending") : t("callMeBack")}
            </Button>

            <p className={styles.note}>
                <ShieldCheck size={14} aria-hidden="true" />
                {t("leadPrivacy")}
            </p>
        </form>
    );
}

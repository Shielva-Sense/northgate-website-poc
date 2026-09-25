"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, Phone, Stethoscope } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { LinkButton } from "@/app/components/ui/LinkButton";
import { AppointmentFlow } from "@/app/features/booking/AppointmentFlow";
import { useBrand } from "@/app/features/clinic/BrandContext";
import { departmentById, RED_FLAGS, SYMPTOMS } from "@/app/features/clinic/care";
import styles from "./FindDoctor.module.scss";

type Stage = "safety" | "symptom" | "book" | "emergency";

/**
 * "I don't know who to see."
 *
 * This signposts to a DEPARTMENT. It is not triage and it is not a diagnosis:
 * it never names a condition, never states a likelihood, and never tells anyone
 * what is wrong with them. The wording is "usually seen by", which is a fact
 * about how the practice is arranged rather than a claim about the patient.
 *
 * The red-flag screen comes first and cannot be skipped. Someone describing
 * chest pain must not find that the easiest available action is to book a
 * routine appointment for next Thursday — so that path does not exist here.
 */
export function FindDoctorClient(): React.JSX.Element {
    const brand = useBrand();
    const [stage, setStage] = useState<Stage>("safety");
    const [symptom, setSymptom] = useState<string | null>(null);

    const chosen = SYMPTOMS.find((s) => s.id === symptom);
    const department = chosen === undefined ? undefined : departmentById(chosen.department);

    if (stage === "emergency") {
        return (
            <div className={`${styles.panel} ${styles.emergency}`} role="alert">
                <span className={styles.emergencyMark} aria-hidden="true">
                    <AlertTriangle size={30} />
                </span>
                <h2 className={styles.emergencyTitle}>Please do not book an appointment</h2>
                <p className={styles.emergencyBody}>
                    What you have described needs to be seen now, not at the next free slot. Call{" "}
                    <b>{brand.emergencyNumber}</b> or go to your nearest emergency department.
                </p>
                <p className={styles.emergencyBody}>
                    If you would rather speak to us first, ring the practice on{" "}
                    <a href={brand.phoneHref}>{brand.phone}</a> and say it is urgent — reception
                    will not put you in a queue.
                </p>
                <div className={styles.emergencyActions}>
                    <LinkButton href={`tel:${brand.emergencyNumber}`} size="lg">
                        Call {brand.emergencyNumber}
                    </LinkButton>
                    <LinkButton href={brand.phoneHref} variant="ghost" size="lg">
                        Ring the practice
                    </LinkButton>
                </div>
                <button
                    type="button"
                    className={styles.back}
                    onClick={() => setStage("safety")}
                >
                    <ArrowLeft size={14} aria-hidden="true" />
                    None of these apply after all
                </button>
            </div>
        );
    }

    if (stage === "safety") {
        return (
            <div className={styles.panel}>
                <h2 className={styles.title}>First, one safety check</h2>
                <p className={styles.sub}>
                    Does any of this apply right now, to you or the person you are booking for?
                </p>
                <ul className={styles.flags} role="list">
                    {RED_FLAGS.map((flag) => (
                        <li key={flag.id}>{flag.label}</li>
                    ))}
                </ul>
                <div className={styles.actions}>
                    <Button variant="ghost" size="lg" onClick={() => setStage("emergency")}>
                        Yes, one of these applies
                    </Button>
                    <Button size="lg" onClick={() => setStage("symptom")}>
                        No, none of these
                    </Button>
                </div>
            </div>
        );
    }

    if (stage === "symptom") {
        return (
            <div className={styles.panel}>
                <h2 className={styles.title}>What is it about?</h2>
                <p className={styles.sub}>
                    Pick the closest. If nothing fits, choose anything and write the detail in the
                    notes — reception will route it properly.
                </p>
                <ul className={styles.symptoms} role="list">
                    {SYMPTOMS.map((option) => (
                        <li key={option.id}>
                            <button
                                type="button"
                                className={styles.symptom}
                                aria-pressed={symptom === option.id}
                                onClick={() => setSymptom(option.id)}
                            >
                                {option.label}
                            </button>
                        </li>
                    ))}
                </ul>

                {department === undefined ? null : (
                    <div className={styles.result}>
                        <p className={styles.resultKicker}>
                            <Stethoscope size={15} aria-hidden="true" />
                            Usually seen by
                        </p>
                        <h3 className={styles.resultName}>{department.name}</h3>
                        <p className={styles.resultBody}>{department.summary}</p>
                        <Button size="lg" onClick={() => setStage("book")}>
                            See who is available
                        </Button>
                    </div>
                )}

                <p className={styles.disclaimer}>
                    This points you at the right department. It is not medical advice and it is not
                    a diagnosis — nobody here has assessed you. If you are unsure or it gets worse,
                    ring us on <a href={brand.phoneHref}>{brand.phone}</a>.
                </p>

                <button type="button" className={styles.back} onClick={() => setStage("safety")}>
                    <ArrowLeft size={14} aria-hidden="true" />
                    Back
                </button>
            </div>
        );
    }

    return (
        <>
            <p className={styles.routed}>
                <Phone size={14} aria-hidden="true" />
                Booking with <b>{department?.name}</b>.{" "}
                <button type="button" className={styles.linkish} onClick={() => setStage("symptom")}>
                    Change
                </button>
            </p>
            <AppointmentFlow
                department={chosen?.department}
                serviceName={department?.name}
            />
            <p className={styles.footNote}>
                Would rather talk to a person? <Link href="/#book">Send us a message</Link> or ring{" "}
                <a href={brand.phoneHref}>{brand.phone}</a>.
            </p>
        </>
    );
}

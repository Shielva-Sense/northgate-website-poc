"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    Baby,
    Bone,
    Brain,
    CheckCircle2,
    Ear,
    Flower2,
    HeartPulse,
    HelpCircle,
    Phone,
    Pill,
    ShieldCheck,
    Sparkles,
    Stethoscope,
    Users,
} from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { LinkButton } from "@/app/components/ui/LinkButton";
import { AppointmentFlow } from "@/app/features/booking/AppointmentFlow";
import { useBrand, useContent, useProfile } from "@/app/features/clinic/BrandContext";
import { redFlagsFor } from "@/app/features/clinic/care";
import {
    CATEGORISED_SYMPTOMS,
    DURATIONS,
    FOR_WHOM,
    routeFor,
    SEVERITIES,
    SYMPTOM_CATEGORIES,
} from "@/app/features/clinic/triage";
import type { CategoryIcon, Duration, ForWhom, Severity } from "@/app/features/clinic/triage";
import { DoctorDirectory } from "./DoctorDirectory";
import styles from "./FindDoctor.module.scss";

type Stage = "safety" | "who" | "category" | "symptom" | "detail" | "result" | "book" | "emergency";

/* Two ways in. "Browse" is first because it is the common case: most people
   arriving here know roughly what they need and want to see who is there, what
   it costs and when. The guided flow is for the minority who genuinely do not
   know, and burying the directory behind four questions to serve them would be
   the wrong trade. */
type Mode = "browse" | "guided";

/* Module scope: rebuilding this map on every render would allocate twelve
   elements per keystroke elsewhere in the tree. */
const CATEGORY_ICON: Readonly<Record<CategoryIcon, React.ReactNode>> = {
    chest: <Activity size={20} />,
    tummy: <Pill size={20} />,
    skin: <Sparkles size={20} />,
    bones: <Bone size={20} />,
    head: <Brain size={20} />,
    mind: <Flower2 size={20} />,
    womens: <Flower2 size={20} />,
    child: <Baby size={20} />,
    heart: <HeartPulse size={20} />,
    senses: <Ear size={20} />,
    checks: <ShieldCheck size={20} />,
    unsure: <HelpCircle size={20} />,
};

/** The guided path, in order. The department shortcut deliberately skips it. */
const STEPS: readonly { readonly stage: Stage; readonly label: string }[] = [
    { stage: "who", label: "Who" },
    { stage: "category", label: "Area" },
    { stage: "symptom", label: "Symptom" },
    { stage: "detail", label: "Detail" },
    { stage: "result", label: "Who to see" },
];

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
 *
 * Asking who it is for, then the body area, then the symptom, then how long and
 * how bad, is not bureaucracy: each answer changes the destination. A child is
 * seen by child health whatever they describe, and "severe and started today"
 * is offered urgent care rather than the next free slot.
 */
export function FindDoctorClient(): React.JSX.Element {
    const brand = useBrand();
    const profile = useProfile();
    const { departments } = useContent();
    const [mode, setMode] = useState<Mode>("browse");
    const [stage, setStage] = useState<Stage>("safety");
    const [preferred, setPreferred] = useState<string | null>(null);
    const [forWhom, setForWhom] = useState<ForWhom>("self");
    const [category, setCategory] = useState<string | null>(null);
    const [symptom, setSymptom] = useState<string | null>(null);
    const [duration, setDuration] = useState<Duration>("days");
    const [severity, setSeverity] = useState<Severity>("moderate");
    /* Set when someone picks a department card rather than walking the flow. */
    const [direct, setDirect] = useState<string | null>(null);

    const routing =
        symptom === null ? null : routeFor({ forWhom, symptomId: symptom, duration, severity });
    const departmentId = direct ?? routing?.department;
    const department =
        departmentId === undefined ? undefined : departments.find((d) => d.id === departmentId);
    const inCategory = CATEGORISED_SYMPTOMS.filter((s) => s.category === category);

    function jump(next: Stage): void {
        setStage(next);
    }

    const stepper =
        stage === "who" ||
        stage === "category" ||
        stage === "symptom" ||
        stage === "detail" ||
        stage === "result" ? (
            <ol className={styles.steps} aria-label="Progress">
                {STEPS.map((step, index) => {
                    const current = STEPS.findIndex((s) => s.stage === stage);
                    const done = index < current;
                    return (
                        <li
                            key={step.stage}
                            className={`${styles.step} ${done ? styles.stepDone : ""} ${
                                index === current ? styles.stepOn : ""
                            }`}
                            aria-current={index === current ? "step" : undefined}
                        >
                            <span className={styles.stepMark} aria-hidden="true">
                                {done ? <CheckCircle2 size={14} /> : index + 1}
                            </span>
                            {step.label}
                        </li>
                    );
                })}
            </ol>
        ) : null;

    function backButton(to: Stage, label = "Back"): React.JSX.Element {
        return (
            <button type="button" className={styles.back} onClick={() => jump(to)}>
                <ArrowLeft size={14} aria-hidden="true" />
                {label}
            </button>
        );
    }

    const tabs = (
        <div className={styles.modes} role="tablist" aria-label="How to find a clinician">
            <button
                type="button"
                role="tab"
                className={styles.mode}
                aria-selected={mode === "browse"}
                onClick={() => setMode("browse")}
            >
                Browse our clinicians
            </button>
            <button
                type="button"
                role="tab"
                className={styles.mode}
                aria-selected={mode === "guided"}
                onClick={() => setMode("guided")}
            >
                I&rsquo;m not sure who to see
            </button>
        </div>
    );

    if (mode === "browse" && stage !== "book") {
        return (
            <>
                {tabs}
                <DoctorDirectory
                    onBook={(departmentId, clinician) => {
                        setDirect(departmentId);
                        setPreferred(clinician);
                        setSymptom(null);
                        jump("book");
                    }}
                />
            </>
        );
    }

    if (stage === "emergency") {
        return (
            <div className={`${styles.panel} ${styles.emergency}`} role="alert">
                <span className={styles.emergencyMark} aria-hidden="true">
                    <AlertTriangle size={30} />
                </span>
                <h2 className={styles.emergencyTitle}>Please do not book an appointment</h2>
                <p className={styles.emergencyBody}>
                    What you have described needs to be seen now, not at the next free slot. Come
                    straight to <b>our emergency department</b> — it is open 24 hours and you do
                    not need an appointment. Ring our A&amp;E line on <b>{brand.aeLine}</b> on the
                    way and we will be ready for you.
                </p>
                <p className={styles.emergencyBody}>
                    If you cannot travel safely, or someone is unconscious or struggling to
                    breathe, call <b>{brand.emergencyNumber}</b> for an ambulance instead — they
                    will be brought to us.
                </p>
                <div className={styles.emergencyActions}>
                    <LinkButton href={brand.aeLineHref} size="lg">
                        Call our A&amp;E — {brand.aeLine}
                    </LinkButton>
                    <LinkButton href="/urgent-care" variant="ghost" size="lg">
                        A&amp;E and urgent care
                    </LinkButton>
                </div>
                {backButton("safety", "None of these apply after all")}
            </div>
        );
    }

    if (stage === "safety") {
        return (
            <>
                {tabs}
                <div className={styles.panel}>
                <h2 className={styles.title}>First, one safety check</h2>
                <p className={styles.sub}>
                    Does any of this apply right now, to you or the person you are booking for?
                </p>
                <ul className={styles.flags} role="list">
                    {redFlagsFor(profile.kind).map((flag) => (
                        <li key={flag.id}>{flag.label}</li>
                    ))}
                </ul>
                <div className={styles.actions}>
                    <Button variant="ghost" size="lg" onClick={() => jump("emergency")}>
                        Yes, one of these applies
                    </Button>
                    <Button size="lg" onClick={() => jump("who")}>
                        No, none of these
                    </Button>
                    </div>
                </div>
            </>
        );
    }

    if (stage === "who") {
        return (
            <>
                {stepper}
                <div className={styles.panel}>
                    <h2 className={styles.title}>Who is this for?</h2>
                    <p className={styles.sub}>
                        It changes the answer — anyone under 16 is seen by our child health team
                        whatever the symptom.
                    </p>
                    <div className={styles.choiceRow}>
                        {FOR_WHOM.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={styles.choice}
                                aria-pressed={forWhom === option.value}
                                onClick={() => {
                                    setForWhom(option.value);
                                    setDirect(null);
                                    jump("category");
                                }}
                            >
                                <Users size={16} aria-hidden="true" />
                                {option.label}
                            </button>
                        ))}
                    </div>
                    {backButton("safety")}
                </div>
                {departmentBrowse()}
            </>
        );
    }

    if (stage === "category") {
        return (
            <>
                {stepper}
                <div className={styles.panel}>
                    <h2 className={styles.title}>Which part of the body?</h2>
                    <p className={styles.sub}>
                        Pick the closest area. If nothing fits, &ldquo;Something else&rdquo; is a
                        real answer and it goes to a general doctor.
                    </p>
                    <ul className={styles.catGrid} role="list">
                        {SYMPTOM_CATEGORIES.map((item) => (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    className={styles.catCard}
                                    aria-pressed={category === item.id}
                                    onClick={() => {
                                        setCategory(item.id);
                                        setSymptom(null);
                                        jump("symptom");
                                    }}
                                >
                                    <span className={styles.catIcon} aria-hidden="true">
                                        {CATEGORY_ICON[item.icon]}
                                    </span>
                                    <span className={styles.catLabel}>{item.label}</span>
                                    <span className={styles.catHint}>{item.hint}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    {backButton("who")}
                </div>
            </>
        );
    }

    if (stage === "symptom") {
        const cat = SYMPTOM_CATEGORIES.find((c) => c.id === category);
        return (
            <>
                {stepper}
                <div className={styles.panel}>
                    <h2 className={styles.title}>{cat?.label ?? "Your symptom"}</h2>
                    <p className={styles.sub}>
                        Which is closest? You can change this later, and nothing here is recorded
                        as a diagnosis.
                    </p>
                    <ul className={styles.symptoms} role="list">
                        {inCategory.map((option) => (
                            <li key={option.id}>
                                <button
                                    type="button"
                                    className={styles.symptom}
                                    aria-pressed={symptom === option.id}
                                    onClick={() => {
                                        setSymptom(option.id);
                                        setDirect(null);
                                        jump("detail");
                                    }}
                                >
                                    {option.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                    {backButton("category")}
                </div>
            </>
        );
    }

    if (stage === "detail") {
        return (
            <>
                {stepper}
                <div className={styles.panel}>
                    <h2 className={styles.title}>How long, and how bad?</h2>
                    <p className={styles.sub}>
                        This decides whether the right answer is an appointment or urgent care
                        today.
                    </p>

                    <p className={styles.fieldLabel} id="duration-label">
                        How long has it been going on?
                    </p>
                    <div className={styles.choiceRow} role="group" aria-labelledby="duration-label">
                        {DURATIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={styles.choice}
                                aria-pressed={duration === option.value}
                                onClick={() => setDuration(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <p className={styles.fieldLabel} id="severity-label">
                        How much is it affecting you?
                    </p>
                    <div className={styles.choiceRow} role="group" aria-labelledby="severity-label">
                        {SEVERITIES.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={styles.choice}
                                aria-pressed={severity === option.value}
                                onClick={() => setSeverity(option.value)}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <div className={styles.actions}>
                        <Button size="lg" onClick={() => jump("result")}>
                            See who I should be seeing
                        </Button>
                    </div>
                    {backButton("symptom")}
                </div>
            </>
        );
    }

    if (stage === "result") {
        return (
            <>
                {stepper}
                <div className={styles.panel}>
                    {routing?.urgent === true ? (
                        /* Severe and recent. The routine booking is still offered
                           below, but it is no longer the obvious thing to click. */
                        <div className={styles.urgentNudge} role="alert">
                            <p className={styles.urgentTag}>
                                <AlertTriangle size={15} aria-hidden="true" />
                                This should not wait for an appointment
                            </p>
                            <p className={styles.resultBody}>{routing.urgentBecause}</p>
                            <div className={styles.emergencyActions}>
                                <LinkButton href="/urgent-care" size="lg">
                                    Go to urgent care
                                </LinkButton>
                                <LinkButton href={brand.phoneHref} variant="ghost" size="lg">
                                    Ring {brand.phone}
                                </LinkButton>
                            </div>
                        </div>
                    ) : null}

                    {department === undefined ? (
                        <p className={styles.sub}>Pick a symptom first.</p>
                    ) : (
                        <div className={styles.result}>
                            <p className={styles.resultKicker}>
                                <Stethoscope size={15} aria-hidden="true" />
                                Usually seen by
                            </p>
                            <h3 className={styles.resultName}>{department.name}</h3>
                            <p className={styles.resultBody}>{department.summary}</p>
                            {routing === null ? null : (
                                <p className={styles.resultWhy}>{routing.because}</p>
                            )}
                            <Button size="lg" onClick={() => jump("book")}>
                                See who is available
                            </Button>
                        </div>
                    )}

                    <p className={styles.disclaimer}>
                        This points you at the right department. It is not medical advice and it is
                        not a diagnosis — nobody here has assessed you. If you are unsure or it gets
                        worse, ring us on <a href={brand.phoneHref}>{brand.phone}</a>.
                    </p>
                    {backButton("detail")}
                </div>
            </>
        );
    }

    return (
        <>
            <p className={styles.routed}>
                <Phone size={14} aria-hidden="true" />
                Booking with <b>{preferred ?? department?.name}</b>
                {preferred === null ? null : ` · ${department?.name ?? ""}`}.{" "}
                <button
                    type="button"
                    className={styles.linkish}
                    onClick={() => {
                        setPreferred(null);
                        jump(direct === null ? "result" : "browse" === mode ? "safety" : "who");
                    }}
                >
                    Change
                </button>
            </p>
            <AppointmentFlow department={departmentId} serviceName={department?.name} />
            <p className={styles.footNote}>
                Would rather talk to a person? <Link href="/#book">Send us a message</Link> or ring{" "}
                <a href={brand.phoneHref}>{brand.phone}</a>.
            </p>
        </>
    );

    /* Kept at the bottom because it is an alternative to the flow above, not a
       step in it: someone who already knows the department should not have to
       answer four questions to reach it. */
    function departmentBrowse(): React.JSX.Element {
        return (
            <div className={styles.panel}>
                <h2 className={styles.title}>Already know? Browse by department</h2>
                <p className={styles.sub}>
                    Skip the questions and go straight to who staffs it and when they are free.
                </p>
                <ul className={styles.deptGrid} role="list">
                    {departments.map((item) => (
                        <li key={item.id}>
                            <button
                                type="button"
                                className={styles.deptCard}
                                onClick={() => {
                                    setDirect(item.id);
                                    setSymptom(null);
                                    jump("book");
                                }}
                            >
                                <span className={styles.deptShot}>
                                    <Image
                                        src={item.image}
                                        alt={item.imageAlt}
                                        width={1200}
                                        height={800}
                                        sizes="(min-width: 760px) 300px, 90vw"
                                        className={styles.deptImg}
                                    />
                                </span>
                                <span className={styles.deptBody}>
                                    <span className={styles.deptName}>{item.name}</span>
                                    <span className={styles.deptSummary}>{item.summary}</span>
                                    <span className={styles.deptGo}>
                                        See who is available
                                        <ArrowRight size={15} aria-hidden="true" />
                                    </span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}

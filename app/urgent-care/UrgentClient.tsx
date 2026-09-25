"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    AlertTriangle,
    ArrowLeft,
    CheckCircle2,
    Clock,
    MapPin,
    Phone,
    Search,
    Timer,
    X,
} from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Checkbox } from "@/app/components/ui/Choice";
import { ChoiceGroup } from "@/app/components/ui/Choice";
import type { ChoiceOption } from "@/app/components/ui/Choice";
import { Field, Input, Textarea } from "@/app/components/ui/Field";
import { useBrand } from "@/app/features/clinic/BrandContext";
import { searchUrgent, URGENT_UNITS } from "@/app/features/clinic/urgent";
import type { UrgentUnit } from "@/app/features/clinic/urgent";
import styles from "./Urgent.module.scss";

/**
 * Arrival windows rather than appointment times.
 *
 * This is the whole point of the page: the patient is telling us when they will
 * walk through the door, not being given a slot. The copy stays in that voice
 * everywhere, because "14:40" on a confirmation would be read as a promise and
 * the first busy Saturday would break it.
 */
const ARRIVALS = [
    { value: "now", label: "On my way now" },
    { value: "hour", label: "Within the hour" },
    { value: "today", label: "Later today" },
] as const satisfies readonly ChoiceOption<string>[];

type Arrival = (typeof ARRIVALS)[number]["value"];

type Stage = "find" | "details" | "done";

interface Sent {
    readonly reference: string;
    readonly delivered: boolean;
    readonly unit: UrgentUnit;
    readonly arrival: Arrival;
}

export function UrgentClient(): React.JSX.Element {
    const brand = useBrand();
    const directions = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.address)}`;
    const [query, setQuery] = useState("");
    const [stage, setStage] = useState<Stage>("find");
    const [unit, setUnit] = useState<UrgentUnit | null>(null);
    const [arrival, setArrival] = useState<Arrival>("now");
    const [fullName, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [notes, setNotes] = useState("");
    const [consent, setConsent] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [sending, setSending] = useState(false);
    const [failed, setFailed] = useState("");
    const [sent, setSent] = useState<Sent | null>(null);

    /* Moving focus on a stage change is the difference between a sighted user
       seeing the page change and a screen-reader user hearing nothing at all. */
    const stageTop = useRef<HTMLDivElement>(null);

    const result = useMemo(() => searchUrgent(query), [query]);

    function go(next: Stage): void {
        setStage(next);
        window.requestAnimationFrame(() => stageTop.current?.focus());
    }

    function choose(next: UrgentUnit): void {
        setUnit(next);
        setFailed("");
        go("details");
    }

    async function submit(): Promise<void> {
        if (unit === null) return;

        const found: Record<string, string> = {};
        if (fullName.trim().length < 2) found.fullName = "Please tell us your name.";
        if (phone.replace(/\D/g, "").length < 7) {
            found.phone = "We need a number in case the desk has to ring you before you set off.";
        }
        if (!consent) found.consent = "We need your permission to hold this while you travel.";
        setErrors(found);
        if (Object.keys(found).length > 0) return;

        setSending(true);
        setFailed("");
        try {
            const response = await fetch("/api/enquiry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    phone,
                    email: "",
                    service: unit.name,
                    clinician: "",
                    window: ARRIVALS.find((a) => a.value === arrival)?.label ?? arrival,
                    urgency: "urgent-walk-in",
                    notes,
                    consent: true,
                }),
            });
            const body: unknown = await response.json().catch(() => ({}));
            if (!response.ok) {
                const message =
                    typeof body === "object" && body !== null && "error" in body
                        ? String((body as { error: unknown }).error)
                        : "We could not put you on the list.";
                setFailed(message);
                return;
            }
            const data = body as { reference?: string; delivered?: boolean };
            setSent({
                reference: data.reference ?? "—",
                delivered: data.delivered === true,
                unit,
                arrival,
            });
            go("done");
        } catch {
            setFailed("We could not reach the desk. Please ring instead — that always works.");
        } finally {
            setSending(false);
        }
    }

    /* We have an emergency department, so this panel points at our own front
       door as well as at the ambulance service. Telling a reader on a hospital
       website to find "your nearest emergency department" was nonsense — they
       are already on the site of one. */
    const emergency = (
        <aside className={styles.emergency} role="note" aria-labelledby="emergency-heading">
            <p className={styles.emergencyTag}>
                <AlertTriangle size={16} aria-hidden="true" />
                If this could be life-threatening
            </p>
            <h2 className={styles.emergencyTitle} id="emergency-heading">
                Come straight to A&amp;E, or call {brand.emergencyNumber}
            </h2>
            <p className={styles.emergencyBody}>
                Chest pain or tightness, sudden difficulty breathing, face drooping or slurred
                speech, bleeding that will not stop, a baby under three months with a fever, or
                thoughts of harming yourself. Our emergency department is open 24 hours and you do
                not need an appointment. Do not book, and do not wait for us to ring back.
            </p>
            <p className={styles.emergencyBody}>
                If you are too unwell to travel safely, call {brand.emergencyNumber} instead — an
                ambulance starts treating you on the way.
            </p>
            <div className={styles.emergencyActions}>
                <a className={styles.emergencyCall} href={`tel:${brand.emergencyNumber}`}>
                    <Phone size={17} aria-hidden="true" />
                    Call {brand.emergencyNumber}
                </a>
                <a
                    className={styles.emergencyWay}
                    href={directions}
                    target="_blank"
                    rel="noreferrer"
                >
                    <MapPin size={16} aria-hidden="true" />
                    A&amp;E entrance — {brand.address}
                </a>
            </div>
        </aside>
    );

    return (
        <>
            {emergency}

            <div className={styles.stageTop} ref={stageTop} tabIndex={-1} />

            {stage === "find" ? (
                <section className={styles.panel} aria-labelledby="find-heading">
                    <h2 className={styles.h2} id="find-heading">
                        What has happened?
                    </h2>
                    <p className={styles.lede}>
                        Describe it in your own words — &ldquo;cut my hand&rdquo;, &ldquo;fever
                        since last night&rdquo;, &ldquo;twisted ankle&rdquo;. We will show you which
                        door to come to. No slot to pick: you tell us you are coming, and the desk
                        expects you.
                    </p>

                    <div className={styles.searchRow}>
                        <Search className={styles.searchIcon} size={18} aria-hidden="true" />
                        <input
                            className={styles.search}
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Cut hand, fever, chest pain, child unwell…"
                            aria-label="Describe what has happened"
                            autoComplete="off"
                        />
                        {query === "" ? null : (
                            <button
                                className={styles.clear}
                                type="button"
                                onClick={() => setQuery("")}
                                aria-label="Clear search"
                            >
                                <X size={16} aria-hidden="true" />
                            </button>
                        )}
                    </div>

                    <p className={styles.live} role="status">
                        {result.redFlag !== null
                            ? "That needs our emergency department now, not this page."
                            : `${result.units.length} of ${URGENT_UNITS.length} showing`}
                    </p>

                    {result.redFlag === null ? null : (
                        /* The search matched a red flag. Everything bookable is
                           withheld — there is no "book anyway" affordance here,
                           deliberately. */
                        <div className={styles.stop}>
                            <p className={styles.stopTag}>
                                <AlertTriangle size={16} aria-hidden="true" />
                                Stop
                            </p>
                            <p className={styles.stopWhat}>{result.redFlag.label}</p>
                            <p className={styles.stopBody}>
                                This is not something to join a list for. Come straight to our
                                emergency department — it is open 24 hours, you do not need an
                                appointment, and you will be seen ahead of everyone waiting. If
                                you are too unwell to travel safely, call {brand.emergencyNumber}{" "}
                                and an ambulance will come to you.
                            </p>
                            <div className={styles.emergencyActions}>
                                <a
                                    className={styles.emergencyCall}
                                    href={`tel:${brand.emergencyNumber}`}
                                >
                                    <Phone size={17} aria-hidden="true" />
                                    Call {brand.emergencyNumber}
                                </a>
                                <a
                                    className={styles.emergencyWay}
                                    href={directions}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <MapPin size={16} aria-hidden="true" />
                                    A&amp;E entrance — {brand.address}
                                </a>
                            </div>
                        </div>
                    )}

                    {result.redFlag !== null ? null : result.units.length === 0 ? (
                        <div className={styles.none}>
                            <p className={styles.noneTitle}>Nothing matched those words</p>
                            <p className={styles.cardBody}>
                                That is a limit of the search, not a judgement about whether you
                                need seeing. Ring {brand.phone} and a person will sort it out, or
                                clear the box to see every urgent service we run.
                            </p>
                            <Button variant="ghost" onClick={() => setQuery("")}>
                                Show everything
                            </Button>
                        </div>
                    ) : (
                        <ul className={styles.units} role="list">
                            {result.units.map((item) => (
                                <li
                                    className={`${styles.unit} ${
                                        item.kind === "emergency" ? styles.unitEmergency : ""
                                    }`}
                                    key={item.id}
                                >
                                    <div className={styles.unitHead}>
                                        <h3 className={styles.unitName}>{item.name}</h3>
                                        <span
                                            className={
                                                item.kind === "emergency"
                                                    ? styles.openNow
                                                    : styles.walkIn
                                            }
                                        >
                                            {item.kind === "emergency"
                                                ? "Open now · 24h"
                                                : "Walk in"}
                                        </span>
                                    </div>
                                    <p className={styles.cardBody}>{item.summary}</p>
                                    <dl className={styles.meta}>
                                        <div className={styles.metaItem}>
                                            <dt>
                                                <Clock size={14} aria-hidden="true" />
                                                <span className="visually-hidden">Open</span>
                                            </dt>
                                            <dd>{item.hours}</dd>
                                        </div>
                                        <div className={styles.metaItem}>
                                            <dt>
                                                <Timer size={14} aria-hidden="true" />
                                                <span className="visually-hidden">
                                                    {item.kind === "emergency"
                                                        ? "How you are seen"
                                                        : "Typical wait"}
                                                </span>
                                            </dt>
                                            <dd>{item.wait}</dd>
                                        </div>
                                    </dl>
                                    <p className={styles.notFor}>
                                        <AlertTriangle size={13} aria-hidden="true" />
                                        {item.notFor}
                                    </p>
                                    <div className={styles.unitGo}>
                                        <Button onClick={() => choose(item)}>
                                            {item.kind === "emergency"
                                                ? "Tell A&E I am coming"
                                                : "Tell them I am coming"}
                                        </Button>
                                        {item.kind === "emergency" ? (
                                            <a
                                                className={styles.mapLink}
                                                href={directions}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                <MapPin size={15} aria-hidden="true" />
                                                Directions
                                            </a>
                                        ) : null}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            ) : null}

            {stage === "details" && unit !== null ? (
                <section className={styles.panel} aria-labelledby="details-heading">
                    <button className={styles.back} type="button" onClick={() => go("find")}>
                        <ArrowLeft size={15} aria-hidden="true" />
                        Back to urgent services
                    </button>
                    <h2 className={styles.h2} id="details-heading">
                        {unit.name}
                    </h2>
                    <p className={styles.lede}>
                        {unit.kind === "emergency"
                            ? "Come now — you do not need to fill this in first, and nothing here affects whether you are seen. It only lets the department know you are on your way."
                            : "Four details and you are on the list. There is no time to choose — you are added to today\u2019s queue and seen in turn, sooner if a clinician judges you need to be."}
                    </p>

                    <div className={styles.form}>
                        <Field label="Your name" required error={errors.fullName}>
                            {(id, describedBy) => (
                                <Input
                                    id={id}
                                    aria-describedby={describedBy}
                                    value={fullName}
                                    autoComplete="name"
                                    onChange={(event) => setName(event.target.value)}
                                />
                            )}
                        </Field>

                        <Field
                            label="Mobile number"
                            required
                            help="Only used to ring you before you travel if the queue changes."
                            error={errors.phone}
                        >
                            {(id, describedBy) => (
                                <Input
                                    id={id}
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    aria-describedby={describedBy}
                                    value={phone}
                                    onChange={(event) => setPhone(event.target.value)}
                                />
                            )}
                        </Field>

                        <ChoiceGroup
                            legend="When will you get here?"
                            name="arrival"
                            value={arrival}
                            options={ARRIVALS}
                            onChange={setArrival}
                        />

                        <Field
                            label="What has happened?"
                            help="A sentence is plenty. It lets the desk put the right person in front of you."
                        >
                            {(id, describedBy) => (
                                <Textarea
                                    id={id}
                                    rows={3}
                                    aria-describedby={describedBy}
                                    value={notes}
                                    onChange={(event) => setNotes(event.target.value)}
                                />
                            )}
                        </Field>

                        <Checkbox checked={consent} onChange={setConsent} error={errors.consent}>
                            The clinic may hold these details and contact me about this visit. See
                            the <Link href="/privacy">privacy notice</Link>.
                        </Checkbox>

                        {failed === "" ? null : (
                            <p className={styles.failed} role="alert">
                                {failed} You can always ring{" "}
                                <a href={brand.phoneHref}>{brand.phone}</a>.
                            </p>
                        )}

                        <Button
                            size="lg"
                            disabled={sending}
                            onClick={() => {
                                void submit();
                            }}
                        >
                            {sending
                                ? "Sending…"
                                : unit.kind === "emergency"
                                  ? "Let A&E know I am coming"
                                  : "Put me on the urgent list"}
                        </Button>
                    </div>
                </section>
            ) : null}

            {stage === "done" && sent !== null ? (
                <section className={styles.panel} aria-labelledby="done-heading">
                    <div className={styles.done}>
                        <span className={styles.doneIcon} aria-hidden="true">
                            <CheckCircle2 size={28} />
                        </span>
                        <h2 className={styles.h2} id="done-heading">
                            {sent.unit.kind === "emergency"
                                ? "A&E knows you are coming"
                                : "You are on the urgent list"}
                        </h2>
                        <p className={styles.lede}>
                            {sent.unit.kind === "emergency" ? (
                                <>
                                    Come straight to the emergency department entrance and give
                                    your name. You do not need an appointment, and you will be
                                    assessed on arrival — the order people are seen in is decided
                                    by how unwell they are, never by who arrived first.
                                </>
                            ) : (
                                <>
                                    {sent.unit.name} is expecting you{" "}
                                    {sent.arrival === "now"
                                        ? "now"
                                        : sent.arrival === "hour"
                                          ? "within the hour"
                                          : "later today"}
                                    . Come to the main entrance and give your name at the desk —
                                    there is nothing to print and nothing to show.
                                </>
                            )}
                        </p>

                        <dl className={styles.receipt}>
                            <div className={styles.receiptRow}>
                                <dt>Reference</dt>
                                <dd className={styles.ref}>{sent.reference}</dd>
                            </div>
                            <div className={styles.receiptRow}>
                                <dt>{sent.unit.kind === "emergency" ? "Seen" : "Typical wait"}</dt>
                                <dd>
                                    {sent.unit.kind === "emergency"
                                        ? "By clinical need, not arrival order"
                                        : sent.unit.wait}
                                </dd>
                            </div>
                            <div className={styles.receiptRow}>
                                <dt>Where</dt>
                                <dd>{brand.address}</dd>
                            </div>
                        </dl>

                        {/* An honest failure beats a reassuring lie: if the sink is
                            not wired the patient is told to ring, not left waiting
                            for a queue they were never actually added to. */}
                        {sent.delivered ? null : (
                            <p className={styles.notDelivered} role="alert">
                                This demo is not connected to a live clinic system, so nobody has
                                actually been notified. On a real site this reaches the desk
                                immediately.
                            </p>
                        )}

                        <p className={styles.doneFoot}>
                            If anything changes while you travel — or it gets worse — ring{" "}
                            <a href={brand.phoneHref}>{brand.phone}</a>. If it becomes one of the
                            emergencies listed at the top of this page, call{" "}
                            {brand.emergencyNumber} instead of coming here.
                        </p>

                        <div className={styles.doneActions}>
                            <a
                                className={styles.mapLink}
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(brand.address)}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <MapPin size={15} aria-hidden="true" />
                                Directions
                            </a>
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setSent(null);
                                    setUnit(null);
                                    setName("");
                                    setPhone("");
                                    setNotes("");
                                    setConsent(false);
                                    setQuery("");
                                    go("find");
                                }}
                            >
                                Add someone else
                            </Button>
                        </div>
                    </div>
                </section>
            ) : null}
        </>
    );
}

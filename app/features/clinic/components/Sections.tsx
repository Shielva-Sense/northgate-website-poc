"use client";

import Image from "next/image";
import Link from "next/link";
import {
    Baby,
    Brain,
    CarFront,
    Check,
    Clock,
    FileCheck2,
    FlaskConical,
    Headset,
    HeartPulse,
    Languages,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    Star,
    Stethoscope,
    Syringe,
    Wallet,
} from "lucide-react";
import { LinkButton } from "@/app/components/ui/LinkButton";
import { BookingForm } from "@/app/features/booking/BookingForm";
import { LeadCapture } from "@/app/features/booking/LeadCapture";
import { useCountUp } from "@/app/core/hooks/useCountUp";
import { useParallax } from "@/app/core/hooks/useParallax";
import { useReveal } from "@/app/core/hooks/useReveal";
import { ACCREDITATIONS, CLINICIANS, FAQS, JOURNEY, OPENING, PACKAGES, PROMISES, SERVICES, STATS } from "../constants";
import type { ServiceIcon, Stat } from "../types";
import { DEPARTMENTS } from "../care";
import { templateById } from "../templates";
import type { TemplateId } from "../templates";
import { Faq } from "./Faq";
import { HeroMedia } from "./HeroMedia";
import { Gallery } from "./Gallery";
import { useBrand } from "../BrandContext";
import styles from "./Sections.module.scss";

const ICONS: Readonly<Record<ServiceIcon, typeof Stethoscope>> = {
    stethoscope: Stethoscope,
    syringe: Syringe,
    heartPulse: HeartPulse,
    baby: Baby,
    brain: Brain,
    flaskConical: FlaskConical,
};

/* Stable keys for the fixed five-star row. */
const STAR_SLOTS = ["one", "two", "three", "four", "five"] as const;

/* Stagger is a data concern, not a style one, so it is set as a CSS variable
   rather than a class per index. */
function delay(index: number): React.CSSProperties {
    return { "--reveal-delay": `${index * 70}ms` } as React.CSSProperties;
}

/* ── hero ─────────────────────────────────────── */

export function Hero(): React.JSX.Element {
    const brand = useBrand();
    const ref = useReveal<HTMLDivElement>();
    const back = useParallax<HTMLDivElement>(-0.12);

    return (
        <section className={styles.hero} id="top">
            {/* The footage is the argument. Everything else sits on top of it.
                The still stays as the poster, so this degrades to the previous
                design rather than to a blank band. */}
            <div className={styles.heroBack} ref={back} aria-hidden="true">
                <HeroMedia poster="/img/consultation.jpg" src="/video/hero.mp4" />
            </div>
            <div className={styles.heroScrim} aria-hidden="true" />

            <div className={`wrap ${styles.heroGrid}`} ref={ref}>
                <div className={styles.heroCopy} data-reveal="">
                    <p className={styles.rating}>
                        <span className={styles.stars} aria-hidden="true">
                            {STAR_SLOTS.map((slot) => (
                                <Star key={slot} size={13} fill="currentColor" strokeWidth={0} />
                            ))}
                        </span>
                        <b>{brand.rating}</b>
                        from {brand.ratingCount} patient reviews
                    </p>

                    {/* Each line is masked by its own wrapper and rises out of
                        it, staggered. data-reveal is per line, not per heading. */}
                    <h1 className={styles.h1}>
                        <span className="line-mask">
                            <span data-reveal="" data-reveal-style="rise">
                                See a named doctor
                            </span>
                        </span>
                        <span className="line-mask">
                            <em data-reveal="" data-reveal-style="rise" style={delay(1)}>
                                this week
                            </em>
                        </span>
                        <span className="line-mask">
                            <span data-reveal="" data-reveal-style="rise" style={delay(2)}>
                                not in three
                            </span>
                        </span>
                    </h1>
                    <p className={styles.heroLede}>
                        Seven clinicians. Twenty-minute appointments. Every price published on this
                        page, and a real time confirmed within the hour.
                    </p>

                    <div className={styles.cta}>
                        <LinkButton href="#team" size="lg">
                            Choose your clinician
                        </LinkButton>
                        <LinkButton href={brand.phoneHref} variant="onDark" size="lg">
                            {brand.phone}
                        </LinkButton>
                    </div>

                    <ul className={styles.chips} role="list">
                        <li>
                            <Check size={14} aria-hidden="true" />
                            Seen this week, in writing
                        </li>
                        <li>
                            <Check size={14} aria-hidden="true" />
                            No fee to ask a question
                        </li>
                        <li>
                            <Check size={14} aria-hidden="true" />
                            Most insurers accepted
                        </li>
                    </ul>
                </div>

                <div className={styles.heroSide} data-reveal="" style={delay(1)}>
                    <LeadCapture />
                </div>
            </div>
        </section>
    );
}

/* ── proof band ───────────────────────────────── */

function StatValue({ stat }: { stat: Stat }): React.JSX.Element {
    const { ref, value } = useCountUp(stat.value);
    return (
        <span className={styles.statValue} ref={ref}>
            {value.toLocaleString("en-GB")}
            {stat.suffix}
        </span>
    );
}

export function Proof(): React.JSX.Element {
    const ref = useReveal<HTMLDivElement>();
    const brand = useBrand();
    /* Naming a regulator the client's country does not have is a fabricated
       credential, not a placeholder. Where the market is unknown, claim only
       things that are true anywhere. */
    const accreditations =
        brand.regulators === null
            ? ([
                  { label: "Registered", detail: "All clinicians licensed to practise" },
                  { label: "Insured", detail: "Full medical indemnity cover" },
                  { label: "Audited", detail: "Infection control reviewed yearly" },
                  { label: "ISO 27001", detail: "Patient records held to standard" },
              ] as const)
            : ACCREDITATIONS;

    return (
        <section className={styles.proof} aria-label="Practice at a glance">
            <div className="wrap" ref={ref}>
                <ul className={styles.statRow} role="list">
                    {STATS.map((stat, index) => (
                        <li key={stat.label} data-reveal="" style={delay(index)}>
                            <StatValue stat={stat} />
                            <span className={styles.statLabel}>{stat.label}</span>
                        </li>
                    ))}
                </ul>
                <ul className={styles.accred} role="list" data-reveal="" style={delay(4)}>
                    {accreditations.map((item) => (
                        <li key={item.label}>
                            <ShieldCheck size={15} aria-hidden="true" />
                            <b>{item.label}</b>
                            <span>{item.detail}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/* ── departments ──────────────────────────────── */

function countIn(departmentId: string): number {
    return CLINICIANS.filter((person) => person.departments.includes(departmentId)).length;
}

export function Departments(): React.JSX.Element {
    const ref = useReveal<HTMLDivElement>();

    return (
        <section className={`${styles.section} ${styles.alt}`} id="departments">
            <div className="wrap" ref={ref}>
                <div className={styles.head} data-reveal="">
                    <p className={styles.kicker}>Departments</p>
                    <h2 className={styles.title}>Find the right team</h2>
                    <p className={styles.lede}>
                        Choose a department to see who staffs it and when they are free. Not sure?{" "}
                        <Link href="/find-a-doctor">Answer two questions instead.</Link>
                    </p>
                </div>

                <ul className={`${styles.grid} ${styles.grid3}`} role="list">
                    {DEPARTMENTS.map((department, index) => (
                        <li
                            key={department.id}
                            className={styles.card}
                            data-reveal=""
                            style={delay(index)}
                        >
                            <h3 className={styles.cardTitle}>{department.name}</h3>
                            <p className={styles.cardBody}>{department.summary}</p>
                            <ul className={styles.deptLinks} role="list">
                                {department.services.map((slug) => {
                                    const service = SERVICES.find((item) => item.slug === slug);
                                    if (service === undefined) return null;
                                    return (
                                        <li key={slug}>
                                            <Link href={`/services/${slug}`}>{service.name}</Link>
                                        </li>
                                    );
                                })}
                            </ul>
                            <p className={styles.deptCount}>
                                {countIn(department.id)}{" "}
                                {countIn(department.id) === 1 ? "clinician" : "clinicians"}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/* ── clinicians ───────────────────────────────── */

export function Team(): React.JSX.Element {
    const ref = useReveal<HTMLDivElement>();
    const brand = useBrand();

    return (
        <section className={styles.section} id="team">
            <div className="wrap" ref={ref}>
                <div className={styles.head} data-reveal="">
                    <p className={styles.kicker}>Meet the team</p>
                    <h2 className={styles.title}>Pick the person, then the time</h2>
                    <p className={styles.lede}>
                        Every clinician here is named, registered and bookable. Continuity matters
                        for anything ongoing, so you can ask for the same person every visit.
                    </p>
                </div>

                <ul className={styles.teamGrid} role="list">
                    {CLINICIANS.map((person, index) => (
                        <li
                            key={person.name}
                            className={styles.person}
                            data-reveal=""
                            style={delay(index)}
                        >
                            <div className={styles.portrait}>
                                {person.photo ? (
                                    <Image
                                        data-reveal=""
                                        data-reveal-style="wipe"
                                        src={person.photo}
                                        alt={`${person.name}, ${person.role}`}
                                        width={1100}
                                        height={1480}
                                        sizes="(min-width: 980px) 260px, (min-width: 720px) 45vw, 90vw"
                                        className={styles.portraitImg}
                                    />
                                ) : (
                                    <span className={styles.monogram} aria-hidden="true">
                                        {person.initials}
                                    </span>
                                )}
                                <span className={styles.years}>{person.years} yrs</span>
                            </div>

                            <div className={styles.personBody}>
                                <h3 className={styles.personName}>{person.name}</h3>
                                <p className={styles.role}>{person.role}</p>
                                <p className={styles.quals}>{person.qualifications}</p>

                                <p className={styles.score}>
                                    <Star size={13} fill="currentColor" strokeWidth={0} aria-hidden="true" />
                                    <b>{person.rating.toFixed(1)}</b>
                                    <span>({person.reviews} reviews)</span>
                                </p>

                                <p className={styles.focus}>{person.focus}</p>

                                <p className={styles.meta}>
                                    <Languages size={13} aria-hidden="true" />
                                    {person.languages.join(", ")}
                                </p>
                                <p className={styles.meta}>
                                    <ShieldCheck size={13} aria-hidden="true" />
                                    {brand.regulators === null
                                        ? "Registered clinician"
                                        : person.registration}
                                </p>

                                <p className={styles.slot}>
                                    <span className={styles.slotDot} aria-hidden="true" />
                                    <span>Next free</span>
                                    <b>
                                        {person.nextSlot.day}, {person.nextSlot.time}
                                    </b>
                                </p>

                                <div className={styles.personCta}>
                                    <p className={styles.fee}>
                                        {person.fee}
                                        <span>per appointment</span>
                                    </p>
                                    <LinkButton href="#book" variant="ghost">
                                        Book
                                    </LinkButton>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/* ── pricing ──────────────────────────────────── */

export function Pricing(): React.JSX.Element {
    const ref = useReveal<HTMLDivElement>();

    return (
        <section className={`${styles.section} ${styles.alt}`} id="pricing">
            <div className="wrap" ref={ref}>
                <div className={styles.head} data-reveal="">
                    <p className={styles.kicker}>What it costs</p>
                    <h2 className={styles.title}>Every price, on the page</h2>
                    <p className={styles.lede}>
                        You should not have to ring a clinic to find out what it charges. There is
                        no booking fee and no fee to ask a question.
                    </p>
                </div>

                <ul className={styles.priceGrid} role="list">
                    {PACKAGES.map((item, index) => (
                        <li
                            key={item.slug}
                            className={`${styles.price} ${item.featured ? styles.featured : ""}`}
                            data-reveal=""
                            style={delay(index)}
                        >
                            {item.featured ? (
                                <p className={styles.badge}>Most families choose this</p>
                            ) : null}
                            <h3 className={styles.cardTitle}>{item.name}</h3>
                            <p className={styles.amount}>
                                {item.price}
                                <span>{item.cadence}</span>
                            </p>
                            <p className={styles.cardBody}>{item.summary}</p>
                            <ul className={styles.includes} role="list">
                                {item.includes.map((line) => (
                                    <li key={line}>
                                        <Check size={15} aria-hidden="true" />
                                        {line}
                                    </li>
                                ))}
                            </ul>
                            <LinkButton
                                href="#book"
                                variant={item.featured ? "primary" : "ghost"}
                                size="lg"
                            >
                                Request this
                            </LinkButton>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/* ── services ─────────────────────────────────── */

export function Services({ template }: { readonly template: TemplateId }): React.JSX.Element {
    const ref = useReveal<HTMLDivElement>();
    const { servicesTitle, servicesLede } = templateById(template);

    return (
        <section className={styles.section} id="services">
            <div className="wrap" ref={ref}>
                <div className={styles.head} data-reveal="">
                    <p className={styles.kicker}>What we do</p>
                    <h2 className={styles.title}>{servicesTitle}</h2>
                    <p className={styles.lede}>{servicesLede}</p>
                </div>

                <ul className={`${styles.grid} ${styles.grid3}`} role="list">
                    {SERVICES.map((service, index) => {
                        const Icon = ICONS[service.icon];
                        return (
                            <li
                                className={styles.card}
                                key={service.slug}
                                data-reveal=""
                                style={delay(index)}
                            >
                                <span className={styles.ico} aria-hidden="true">
                                    <Icon size={22} />
                                </span>
                                <h3 className={styles.cardTitle}>{service.name}</h3>
                                <p className={styles.cardBody}>{service.summary}</p>
                                <span className={styles.duration}>{service.duration}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

/* ── operations ───────────────────────────────── */

const PROMISE_ICONS_MAP = {
    car: CarFront,
    wallet: Wallet,
    files: FileCheck2,
    headset: Headset,
} as const;

export function Promises(): React.JSX.Element {
    const ref = useReveal<HTMLDivElement>();

    return (
        <section className={styles.ops} id="ops">
            <div className={styles.opsBack} aria-hidden="true">
                <Image
                    src="/img/reception.jpg"
                    alt=""
                    fill
                    sizes="100vw"
                    className={styles.opsImg}
                />
            </div>
            <div className={styles.opsScrim} aria-hidden="true" />

            <div className="wrap" ref={ref}>
                <div className={styles.head} data-reveal="">
                    <p className={styles.kicker}>What we take off you</p>
                    <h2 className={styles.title}>
                        The medicine is the easy part. We handle the rest.
                    </h2>
                </div>

                <ul className={styles.opsGrid} role="list">
                    {PROMISES.map((item, index) => {
                        const Icon = PROMISE_ICONS_MAP[item.icon];
                        return (
                            <li key={item.title} data-reveal="" style={delay(index)}>
                                <span className={styles.opsIco} aria-hidden="true">
                                    <Icon size={20} />
                                </span>
                                <h3 className={styles.cardTitle}>{item.title}</h3>
                                <p className={styles.cardBody}>{item.body}</p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}

/* ── journey ──────────────────────────────────── */

export function Journey(): React.JSX.Element {
    const ref = useReveal<HTMLDivElement>();

    return (
        <section className={`${styles.section} ${styles.alt}`} id="how">
            <div className="wrap" ref={ref}>
                <div className={styles.head} data-reveal="">
                    <p className={styles.kicker}>How it works</p>
                    <h2 className={styles.title}>Four steps, no phone queue</h2>
                </div>

                <ol className={styles.steps}>
                    {JOURNEY.map((item, index) => (
                        <li key={item.step} data-reveal="" style={delay(index)}>
                            <span className={styles.stepNo} aria-hidden="true">
                                {item.step}
                            </span>
                            <h3 className={styles.cardTitle}>{item.title}</h3>
                            <p className={styles.cardBody}>{item.body}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

/* ── visiting ─────────────────────────────────── */

export function Visiting(): React.JSX.Element {
    const brand = useBrand();
    const ref = useReveal<HTMLDivElement>();

    return (
        <section className={`${styles.section} ${styles.alt}`} id="visiting">
            <div className="wrap" ref={ref}>
                <div className={styles.head} data-reveal="">
                    <p className={styles.kicker}>Visiting</p>
                    <h2 className={styles.title}>Where to find us</h2>
                </div>

                <div className={`${styles.grid} ${styles.grid2}`}>
                    <div className={styles.card} data-reveal="">
                        <h3 className={styles.cardTitle}>Opening hours</h3>
                        <table className={styles.hours}>
                            <thead>
                                <tr>
                                    <th scope="col">Day</th>
                                    <th scope="col">Hours</th>
                                </tr>
                            </thead>
                            <tbody>
                                {OPENING.map((entry) => (
                                    <tr key={entry.day}>
                                        <td>{entry.day}</td>
                                        <td>{entry.hours}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.card} data-reveal="" style={delay(1)}>
                        <h3 className={styles.cardTitle}>Getting here</h3>
                        <p className={styles.detail}>
                            <MapPin size={18} aria-hidden="true" />
                            <span>{brand.address}</span>
                        </p>
                        <p className={styles.detail}>
                            <Phone size={18} aria-hidden="true" />
                            <a href={brand.phoneHref}>{brand.phone}</a>
                        </p>
                        <p className={styles.detail}>
                            <Mail size={18} aria-hidden="true" />
                            <a href={`mailto:${brand.email}`}>{brand.email}</a>
                        </p>
                        <p className={styles.detail}>
                            <Clock size={18} aria-hidden="true" />
                            <span>
                                Step-free access from the street. Two accessible parking bays at
                                the rear.
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── booking ──────────────────────────────────── */

export function Booking(): React.JSX.Element {
    const ref = useReveal<HTMLDivElement>();

    return (
        <section className={`${styles.section} ${styles.dark}`} id="book">
            {/* The building, so the last thing before someone books is the
                place they would actually be walking into. */}
            <div className={styles.bookBack} aria-hidden="true">
                <Image
                    src="/img/exterior.jpg"
                    alt=""
                    fill
                    sizes="100vw"
                    className={styles.bookImg}
                />
            </div>
            <div className={styles.bookScrim} aria-hidden="true" />

            <div className={`wrap ${styles.bookGrid}`} ref={ref}>
                <div data-reveal="">
                    <p className={styles.kicker}>Book</p>
                    <h2 className={styles.title}>Request an appointment</h2>
                    <p className={styles.lede}>
                        It takes about a minute. You will get a confirmation with a time, not a
                        promise to call you back at some point.
                    </p>
                    <ul className={styles.darkList} role="list">
                        {FAQS.slice(0, 3).map((item) => (
                            <li key={item.question}>
                                <Check size={15} aria-hidden="true" />
                                {item.question}
                            </li>
                        ))}
                    </ul>
                </div>
                <div data-reveal="" style={delay(1)}>
                    <BookingForm />
                </div>
            </div>
        </section>
    );
}

export { Faq, Gallery };

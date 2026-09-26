"use client";

import Image from "next/image";
import { LocaleLink as Link } from "@/app/components/ui/LocaleLink";
import {
    CarFront,
    Check,
    Clock,
    FileCheck2,
    Headset,
    Languages,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    Star,
    Wallet,
} from "lucide-react";
import { LinkButton } from "@/app/components/ui/LinkButton";
import { BookingForm } from "@/app/features/booking/BookingForm";
import { useCountUp } from "@/app/core/hooks/useCountUp";
import { useReveal } from "@/app/core/hooks/useReveal";
import { ACCREDITATIONS, FAQS, JOURNEY, OPENING, PROMISES, STATS } from "../constants";
import type { Stat } from "../types";
import { DepartmentCarousel } from "./DepartmentCarousel";
import { templateById } from "../templates";
import type { TemplateId } from "../templates";
import { ServiceGlyph } from "./ServiceGlyph";
import { Faq } from "./Faq";
import { Gallery } from "./Gallery";
import { useBrand, useContent, useProfile } from "../BrandContext";
import { mediaFor } from "../content";
import type { ServiceIcon } from "../types";
import styles from "./Sections.module.scss";
import { tr } from "@/app/core/content-ar";
import { useLocale } from "@/app/features/clinic/LocaleContext";
import { localise } from "@/app/core/content-ar";

/* Stagger is a data concern, not a style one, so it is set as a CSS variable
   rather than a class per index. */
function delay(index: number): React.CSSProperties {
    return { "--reveal-delay": `${index * 70}ms` } as React.CSSProperties;
}

/* ── hero ─────────────────────────────────────── */

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
    const { locale } = useLocale();
    const ref = useReveal<HTMLDivElement>();
    const brand = useBrand();
    /* Naming a regulator the client's country does not have is a fabricated
       credential, not a placeholder. Where the market is unknown, claim only
       things that are true anywhere. */
    const accreditations = localise(
        brand.regulators === null
            ? ([
                  { label: "Registered", detail: "All clinicians licensed to practise" },
                  { label: "Insured", detail: "Full medical indemnity cover" },
                  { label: "Audited", detail: "Infection control reviewed yearly" },
                  { label: "ISO 27001", detail: "Patient records held to standard" },
              ] as const)
            : ACCREDITATIONS,
        locale,
    );

    return (
        <section className={styles.proof} aria-label={tr("Practice at a glance", locale)}>
            <div className="wrap" ref={ref}>
                <ul className={styles.statRow} role="list">
                    {localise(STATS, locale).map((stat, index) => (
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

export function Departments(): React.JSX.Element {
    const { locale } = useLocale();
    const ref = useReveal<HTMLDivElement>();

    return (
        <section className={`${styles.section} ${styles.alt}`} id="departments">
            <div className="wrap" ref={ref}>
                <div className={styles.head} data-reveal="">
                    <p className={styles.kicker}>{tr("Departments", locale)}</p>
                    <h2 className={styles.title}>{tr("Find the right team", locale)}</h2>
                    <p className={styles.lede}>
                        Choose a department to see who staffs it and when they are free. Not sure?{" "}
                        <Link href="/find-a-doctor">{tr("Let us point you at the right one.", locale)}</Link>
                    </p>
                </div>

            </div>

            {/* Six identical text cards made every department look like the
                same department. One photograph at a time, filling the section,
                does the opposite. */}
            <DepartmentCarousel />
        </section>
    );
}

/* ── clinicians ───────────────────────────────── */

export function Team(): React.JSX.Element {
    const { locale } = useLocale();
    const ref = useReveal<HTMLDivElement>();
    const brand = useBrand();
    /* This practice's own team. It was nine GP partners with fees in pounds,
       shown as the staff of every clinic on the farm. */
    const { clinicians } = useContent();

    return (
        <section className={styles.section} id="team">
            <div className="wrap" ref={ref}>
                <div className={styles.head} data-reveal="">
                    <p className={styles.kicker}>{tr("Meet the team", locale)}</p>
                    <h2 className={styles.title}>{tr("Pick the person, then the time", locale)}</h2>
                    <p className={styles.lede}>{tr("Every clinician here is named, registered and bookable. Continuity matters for anything ongoing, so you can ask for the same person every visit.", locale)}</p>
                </div>

                <ul className={styles.teamGrid} role="list">
                    {clinicians.map((person, index) => (
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
                                    <span>{tr("Next free", locale)}</span>
                                    <b>
                                        {person.nextSlot.day}, {person.nextSlot.time}
                                    </b>
                                </p>

                                <div className={styles.personCta}>
                                    <p className={styles.fee}>
                                        {person.fee}
                                        <span>per appointment</span>
                                    </p>
                                    <LinkButton href="#book" variant="ghost">{tr("Book", locale)}</LinkButton>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/**
 * An icon for a service, chosen from its name.
 *
 * The six glyphs are a fixed set and a trade's services are free text, so
 * this matches on what the service actually is rather than adding an icon
 * field to fifty entries across ten trades. Anything unrecognised gets the
 * stethoscope, which reads as "clinical" without claiming a speciality.
 */
function glyphFor(name: string): ServiceIcon {
    const n = name.toLowerCase();
    if (/vaccin|immunis|immuniz|inject|booster/.test(n)) return "syringe";
    if (/child|baby|infant|paediatr|pediatr|puppy|kitten/.test(n)) return "baby";
    if (/mental|therap|anxiet|mood|psych|counsell/.test(n)) return "brain";
    if (/blood|diagnost|lab|patholog|imaging|scan|x-ray|screen/.test(n)) return "flaskConical";
    if (/heart|cardio|pressure|diabet|pulse/.test(n)) return "heartPulse";
    return "stethoscope";
}

/* ── pricing ──────────────────────────────────── */

export function Pricing(): React.JSX.Element {
    const { locale } = useLocale();
    const ref = useReveal<HTMLDivElement>();
    /* Built from this practice's own appointments, so the cards here and the
       price table on /services are the same numbers by construction — and in
       the currency the patient actually spends. */
    const { packages } = useContent();

    return (
        <section className={`${styles.section} ${styles.alt}`} id="pricing">
            <div className="wrap" ref={ref}>
                <div className={styles.head} data-reveal="">
                    <p className={styles.kicker}>{tr("What it costs", locale)}</p>
                    <h2 className={styles.title}>{tr("Every price, on the page", locale)}</h2>
                    <p className={styles.lede}>{tr("You should not have to ring a clinic to find out what it charges. There is no booking fee and no fee to ask a question.", locale)}</p>
                </div>

                <ul className={styles.priceGrid} role="list">
                    {packages.map((item, index) => (
                        <li
                            key={item.slug}
                            className={`${styles.price} ${item.featured ? styles.featured : ""}`}
                            data-reveal=""
                            style={delay(index)}
                        >
                            {item.featured ? (
                                <p className={styles.badge}>{tr("Most families choose this", locale)}</p>
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
                            >{tr("Request this", locale)}</LinkButton>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/* ── services ─────────────────────────────────── */

export function Services({ template }: { readonly template: TemplateId }): React.JSX.Element {
    const { locale } = useLocale();
    const ref = useReveal<HTMLDivElement>();
    /* This practice's own services. SERVICES was one general practice's six,
       so a dental site advertised travel vaccinations and child health. */
    const profile = useProfile();
    const { appointmentTypes } = useContent();
    const { servicesTitle, servicesLede } = templateById(template);

    return (
        <section className={styles.section} id="services">
            <div className="wrap" ref={ref}>
                <div className={styles.head} data-reveal="">
                    <p className={styles.kicker}>{tr("What we do", locale)}</p>
                    <h2 className={styles.title}>{servicesTitle}</h2>
                    <p className={styles.lede}>{servicesLede}</p>
                </div>

                <ul className={`${styles.grid} ${styles.grid3}`} role="list">
                    {profile.services.map((service, index) => {
                        /* Length comes from this practice's own appointment
                           list where one matches, so the card and the price
                           table agree. Where nothing matches, no length is
                           shown — better silent than invented. */
                        const minutes = appointmentTypes.find(
                            (type) => type.id === service.slug || type.department === service.slug,
                        )?.minutes;
                        return (
                            <li
                                className={styles.card}
                                key={service.slug}
                                data-reveal=""
                                style={delay(index)}
                            >
                                <span className={styles.ico} aria-hidden="true">
                                    <ServiceGlyph icon={glyphFor(service.name)} />
                                </span>
                                <h3 className={styles.cardTitle}>{service.name}</h3>
                                <p className={styles.cardBody}>{service.blurb}</p>
                                {minutes === undefined ? null : (
                                    <span className={styles.duration}>{minutes} min</span>
                                )}
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
    const { locale } = useLocale();
    const ref = useReveal<HTMLDivElement>();
    const media = mediaFor(useProfile().kind);

    return (
        <section className={styles.ops} id="ops">
            <div className={styles.opsBack} aria-hidden="true">
                <Image
                    src={media.reception}
                    alt=""
                    fill
                    sizes="100vw"
                    className={styles.opsImg}
                />
            </div>
            <div className={styles.opsScrim} aria-hidden="true" />

            <div className="wrap" ref={ref}>
                <div className={styles.head} data-reveal="">
                    <p className={styles.kicker}>{tr("What we take off you", locale)}</p>
                    <h2 className={styles.title}>{tr("The medicine is the easy part. We handle the rest.", locale)}</h2>
                </div>

                <ul className={styles.opsGrid} role="list">
                    {localise(PROMISES, locale).map((item, index) => {
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
    const { locale } = useLocale();
    const ref = useReveal<HTMLDivElement>();

    return (
        <section className={`${styles.section} ${styles.alt}`} id="how">
            <div className="wrap" ref={ref}>
                <div className={styles.head} data-reveal="">
                    <p className={styles.kicker}>{tr("How it works", locale)}</p>
                    <h2 className={styles.title}>{tr("Four steps, no phone queue", locale)}</h2>
                </div>

                <ol className={styles.steps}>
                    {localise(JOURNEY, locale).map((item, index) => (
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
    const { locale } = useLocale();
    const brand = useBrand();
    const ref = useReveal<HTMLDivElement>();

    return (
        <section className={`${styles.section} ${styles.alt}`} id="visiting">
            <div className="wrap" ref={ref}>
                <div className={styles.head} data-reveal="">
                    <p className={styles.kicker}>{tr("Visiting", locale)}</p>
                    <h2 className={styles.title}>{tr("Where to find us", locale)}</h2>
                </div>

                <div className={`${styles.grid} ${styles.grid2}`}>
                    <div className={styles.card} data-reveal="">
                        <h3 className={styles.cardTitle}>{tr("Opening hours", locale)}</h3>
                        <table className={styles.hours}>
                            <thead>
                                <tr>
                                    <th scope="col">{tr("Day", locale)}</th>
                                    <th scope="col">{tr("Hours", locale)}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {localise(OPENING, locale).map((entry) => (
                                    <tr key={entry.day}>
                                        <td>{entry.day}</td>
                                        <td>{entry.hours}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles.card} data-reveal="" style={delay(1)}>
                        <h3 className={styles.cardTitle}>{tr("Getting here", locale)}</h3>
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
                            <span>{tr("Step-free access from the street. Two accessible parking bays at the rear.", locale)}</span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── booking ──────────────────────────────────── */

export function Booking(): React.JSX.Element {
    const { locale } = useLocale();
    const ref = useReveal<HTMLDivElement>();
    const media = mediaFor(useProfile().kind);

    return (
        <section className={`${styles.section} ${styles.dark}`} id="book">
            {/* The building, so the last thing before someone books is the
                place they would actually be walking into. */}
            <div className={styles.bookBack} aria-hidden="true">
                <Image
                    src={media.exterior}
                    alt=""
                    fill
                    sizes="100vw"
                    className={styles.bookImg}
                />
            </div>
            <div className={styles.bookScrim} aria-hidden="true" />

            <div className={`wrap ${styles.bookGrid}`} ref={ref}>
                <div data-reveal="">
                    <p className={styles.kicker}>{tr("Book", locale)}</p>
                    <h2 className={styles.title}>{tr("Request an appointment", locale)}</h2>
                    <p className={styles.lede}>{tr("It takes about a minute. You will get a confirmation with a time, not a promise to call you back at some point.", locale)}</p>
                    <ul className={styles.darkList} role="list">
                        {localise(FAQS, locale).slice(0, 3).map((item) => (
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

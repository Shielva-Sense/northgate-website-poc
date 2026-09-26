import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import {
    AlertTriangle,
    ArrowRight,
    CalendarCheck,
    ClipboardList,
    CreditCard,
    FileText,
    MapPin,
    Phone,
    Siren,
    Stethoscope,
    Video,
} from "lucide-react";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { PageShell } from "@/app/components/layouts/PageShell";
import { OPENING } from "@/app/features/clinic/constants";
import styles from "./Appointments.module.scss";

export async function generateMetadata(): Promise<Metadata> {
    const brand = (await siteFromHost((await headers()).get("host"))).brand;
    return {
        title: `Appointments and access — ${brand.name}`,
        description:
            "Every way to get seen, where to go when it cannot wait, what to bring, and what it costs.",
        alternates: { canonical: `${siteUrl()}/appointments` },
        robots: isIndexable() ? undefined : { index: false, follow: false },
    };
}

export default async function Page(): Promise<React.JSX.Element> {
    const site = await siteFromHost((await headers()).get("host"));
    const brand = site.brand;
    const profile = site.profile;

    return (
        <PageShell
            kicker="Appointments and access"
            title="Every way to get seen"
            lede={`However you would rather do it — online, on the phone, or by walking in. If you are not sure which you need, start with "where to go" below.`}
            image="/img/reception.jpg"
            imageAlt="A reception desk with a receptionist looking up, and seating beyond"
        >
            {/* ── ways in ─────────────────────────────────────────── */}
            <section className={`${styles.section} ${styles.first}`} aria-labelledby="ways">
                <div className="wrap">
                    <Link className={styles.urgentBanner} href="/urgent-care">
                        <span className={styles.urgentIco} aria-hidden="true">
                            <Siren size={22} />
                        </span>
                        <span className={styles.urgentText}>
                            <b>Need to be seen today?</b> Urgent care is walk-in — search what has
                            happened and come straight in. No slot to pick and no callback to wait
                            for.
                        </span>
                        <span className={styles.urgentGo} aria-hidden="true">
                            <ArrowRight size={18} />
                        </span>
                    </Link>

                    <h2 className={styles.h2} id="ways">
                        Ways to book
                    </h2>
                    <ul className={styles.cards} role="list">
                        <li className={styles.card}>
                            <span className={styles.ico} aria-hidden="true">
                                <CalendarCheck size={20} />
                            </span>
                            <h3 className={styles.cardTitle}>Book online</h3>
                            <p className={styles.cardBody}>
                                Choose your clinician and pick from their real availability. Takes
                                about a minute and you get a time, not a callback promise.
                            </p>
                            <Link className={styles.action} href="/#book">
                                Book an appointment
                            </Link>
                        </li>
                        <li className={styles.card}>
                            <span className={styles.ico} aria-hidden="true">
                                <Stethoscope size={20} />
                            </span>
                            <h3 className={styles.cardTitle}>Not sure who to see</h3>
                            <p className={styles.cardBody}>
                                Tell us who it is for and roughly what is wrong, and we will
                                point you at the department that usually sees it.
                            </p>
                            <Link className={styles.action} href="/find-a-doctor">
                                Find a doctor
                            </Link>
                        </li>
                        <li className={styles.card}>
                            <span className={styles.ico} aria-hidden="true">
                                <Phone size={20} />
                            </span>
                            <h3 className={styles.cardTitle}>By phone</h3>
                            <p className={styles.cardBody}>
                                Reception answers in person during opening hours. No menu tree, and
                                no being told to ring back at eight.
                            </p>
                            <a className={styles.action} href={brand.phoneHref}>
                                {brand.phone}
                            </a>
                        </li>
                        <li className={styles.card}>
                            <span className={styles.ico} aria-hidden="true">
                                <Video size={20} />
                            </span>
                            <h3 className={styles.cardTitle}>Video appointment</h3>
                            <p className={styles.cardBody}>
                                For reviews, results and anything that does not need examining.
                                Book as normal and ask for video in the notes.
                            </p>
                            <Link className={styles.action} href="/#book">
                                Request a video slot
                            </Link>
                        </li>
                    </ul>
                </div>
            </section>

            {/* ── where to go ─────────────────────────────────────── */}
            <section className={`${styles.section} ${styles.alt}`} aria-labelledby="where">
                <div className="wrap">
                    <h2 className={styles.h2} id="where">
                        Not sure where to go?
                    </h2>
                    <p className={styles.sectionLede}>
                        The honest version: most things can wait for a normal appointment, some
                        cannot wait until next week, and a few should not wait at all.
                    </p>

                    <ul className={styles.triage} role="list">
                        <li className={`${styles.level} ${styles.urgentNow}`}>
                            <p className={styles.levelTag}>
                                <AlertTriangle size={15} aria-hidden="true" />
                                Do not wait
                            </p>
                            <h3 className={styles.cardTitle}>Emergency</h3>
                            <p className={styles.cardBody}>
                                Chest pain, difficulty breathing, signs of a stroke, heavy bleeding,
                                a baby under three months with a fever, or thoughts of harming
                                yourself.
                            </p>
                            {profile.hasEmergency ? (
                                <>
                                    <p className={styles.levelDo}>
                                        Come straight to our emergency department — it is open 24
                                        hours and you do not need an appointment. Ring our
                                        emergency line on {brand.aeLine} on the way, or{" "}
                                        {brand.emergencyNumber} for an ambulance if you cannot
                                        travel. Do not book here.
                                    </p>
                                    <Link className={styles.action} href="/urgent-care">
                                        Emergency and urgent care
                                    </Link>
                                </>
                            ) : (
                                /* A practice without an emergency department must never
                                   invite someone having a stroke to travel to it. The
                                   correct advice is the ambulance service and the nearest
                                   hospital, and saying so plainly is the whole point of
                                   this card. */
                                <p className={styles.levelDo}>
                                    We are not an emergency service. Call{" "}
                                    {brand.emergencyNumber} for an ambulance, or go straight to
                                    your nearest hospital emergency department. Do not wait to
                                    hear back from us, and do not book here.
                                </p>
                            )}
                        </li>
                        <li className={styles.level}>
                            <p className={styles.levelTag}>Today or tomorrow</p>
                            <h3 className={styles.cardTitle}>Urgent, but not an emergency</h3>
                            <p className={styles.cardBody}>
                                Pain that is getting worse, a suspected infection, swelling, or
                                something that has changed since yesterday.
                            </p>
                            {profile.hasEmergency ? (
                                <>
                                    <p className={styles.levelDo}>
                                        Come to urgent care — it is walk-in, so there is no slot
                                        to wait for. Tell us you are coming and the desk expects
                                        you.
                                    </p>
                                    <Link className={styles.action} href="/urgent-care">
                                        Go to urgent care
                                    </Link>
                                </>
                            ) : (
                                <p className={styles.levelDo}>
                                    Ring us on {brand.phone} and say it is urgent. We hold slots
                                    back each day for exactly this, and reception can tell you
                                    straight away whether you need to be seen elsewhere.
                                </p>
                            )}
                        </li>
                        <li className={styles.level}>
                            <p className={styles.levelTag}>This week</p>
                            <h3 className={styles.cardTitle}>Routine</h3>
                            <p className={styles.cardBody}>
                                Check-ups, reviews, ongoing treatment, and anything you have been
                                meaning to get looked at.
                            </p>
                            <p className={styles.levelDo}>
                                Book online and choose your {profile.clinician}. Most routine{" "}
                                {profile.visit}s are within the same week.
                            </p>
                        </li>
                    </ul>
                </div>
            </section>

            {/* ── planning the visit ──────────────────────────────── */}
            <section className={styles.section} aria-labelledby="plan">
                <div className="wrap">
                    <h2 className={styles.h2} id="plan">
                        Planning your visit
                    </h2>
                    <div className={styles.split}>
                        <div>
                            <h3 className={styles.subTitle}>
                                <ClipboardList size={17} aria-hidden="true" />
                                What to bring
                            </h3>
                            <ul className={styles.list} role="list">
                                <li>A list of your current medication, including doses</li>
                                <li>Any readings you have taken at home</li>
                                <li>Your insurance policy number, if you are using insurance</li>
                                <li>
                                    The two or three things you most want answered — appointments
                                    run out of time, and the important question is often last
                                </li>
                            </ul>

                            <h3 className={styles.subTitle}>
                                <FileText size={17} aria-hidden="true" />
                                Your records
                            </h3>
                            <p className={styles.cardBody}>
                                You can ask for a copy of what we hold about you at any time, and we
                                will answer within one month. Write to{" "}
                                <a href={`mailto:${brand.email}`}>{brand.email}</a>. How we handle
                                your information is set out in our{" "}
                                <Link href="/privacy">privacy notice</Link>.
                            </p>
                        </div>

                        <div>
                            <h3 className={styles.subTitle}>
                                <MapPin size={17} aria-hidden="true" />
                                Getting here
                            </h3>
                            <p className={styles.cardBody}>{brand.address}</p>
                            <p className={styles.cardBody}>
                                Step-free from the street, a lift to both floors, and two accessible
                                parking bays held for booked appointments. Tell us when you book if
                                you need one.
                            </p>

                            <h3 className={styles.subTitle}>Opening hours</h3>
                            <table className={styles.hours}>
                                <caption className="visually-hidden">Opening hours</caption>
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
                    </div>
                </div>
            </section>

            {/* ── cost ────────────────────────────────────────────── */}
            <section className={`${styles.section} ${styles.alt}`} aria-labelledby="cost">
                <div className="wrap">
                    <h2 className={styles.h2} id="cost">
                        <CreditCard size={20} aria-hidden="true" />
                        What it costs
                    </h2>
                    <p className={styles.sectionLede}>
                        Every price is published on this site. There is no fee to ask a question, no
                        booking fee, and nothing is added afterwards that you were not told about
                        first.
                    </p>
                    <ul className={styles.list} role="list">
                        <li>
                            Most major insurers are accepted. Give us the policy number when you
                            book and we will check cover and tell you what, if anything, you will be
                            asked to pay <b>before</b> your appointment rather than after it.
                        </li>
                        <li>
                            If something falls outside the published list, we tell you the cost
                            before we do it.
                        </li>
                        <li>
                            If cost is the reason you are putting off being seen, say so when you
                            ring. It is a more common conversation than you would think.
                        </li>
                    </ul>
                    <Link className={styles.action} href="/#pricing">
                        See published prices
                    </Link>
                </div>
            </section>
        </PageShell>
    );
}

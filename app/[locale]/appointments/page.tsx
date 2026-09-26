import type { Metadata } from "next";
import { headers } from "next/headers";
import { LocaleLink as Link } from "@/app/components/ui/LocaleLink";
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
import type { Locale } from "@/app/core/locale";
import { triageFor } from "@/app/features/clinic/content";
import { OPENING } from "@/app/features/clinic/constants";
import styles from "./Appointments.module.scss";
import { localise, tr } from "@/app/core/content-ar";

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

export default async function Page({
    params,
}: {
    readonly params: Promise<{ readonly locale: Locale }>;
}): Promise<React.JSX.Element> {
    const { locale } = await params;
    const site = await siteFromHost((await headers()).get("host"));
    const brand = site.brand;
    const profile = site.profile;
    /* Triage wording follows the trade. A veterinary practice must not tell
       anyone to watch for a stroke or to call for an ambulance. */
    const triage = triageFor(profile.kind);

    return (
        <PageShell
            locale={locale}
            kicker={tr("Appointments and access", locale)}
            title={tr("Every way to get seen", locale)}
            lede={tr("However you would rather do it — online, on the phone, or by walking in. If you are not sure which you need, start with \u201Cwhere to go\u201D below.", locale)}
            imageKey="reception"
            imageAlt="A reception desk with a receptionist looking up, and seating beyond"
        >
            {/* ── ways in ─────────────────────────────────────────── */}
            <section className={`${styles.section} ${styles.first}`} aria-labelledby="ways">
                <div className="wrap">
                    {/* "Walk in, no callback to wait for" is a promise only a
                        practice that is actually open to walk-ins can keep. On
                        one that is not, it contradicts its own urgent page,
                        which asks people to ring first. */}
                    {profile.hasEmergency ? (
                        <Link className={styles.urgentBanner} href="/urgent-care">
                            <span className={styles.urgentIco} aria-hidden="true">
                                <Siren size={22} />
                            </span>
                            <span className={styles.urgentText}>
                                <b>{tr("Need to be seen today?", locale)}</b>{tr("Urgent care is walk-in — search what has happened and come straight in. No slot to pick and no callback to wait for.", locale)}</span>
                            <span className={styles.urgentGo} aria-hidden="true">
                                <ArrowRight size={18} />
                            </span>
                        </Link>
                    ) : null}

                    <h2 className={styles.h2} id="ways">{tr("Ways to book", locale)}</h2>
                    <ul className={styles.cards} role="list">
                        <li className={styles.card}>
                            <span className={styles.ico} aria-hidden="true">
                                <CalendarCheck size={20} />
                            </span>
                            <h3 className={styles.cardTitle}>{tr("Book online", locale)}</h3>
                            <p className={styles.cardBody}>{tr("Choose your clinician and pick from their real availability. Takes about a minute and you get a time, not a callback promise.", locale)}</p>
                            <Link className={styles.action} href="/#book">{tr("Book an appointment", locale)}</Link>
                        </li>
                        <li className={styles.card}>
                            <span className={styles.ico} aria-hidden="true">
                                <Stethoscope size={20} />
                            </span>
                            <h3 className={styles.cardTitle}>{tr("Not sure who to see", locale)}</h3>
                            <p className={styles.cardBody}>{tr("Tell us who it is for and roughly what is wrong, and we will point you at the department that usually sees it.", locale)}</p>
                            <Link className={styles.action} href="/find-a-doctor">{tr("Find a doctor", locale)}</Link>
                        </li>
                        <li className={styles.card}>
                            <span className={styles.ico} aria-hidden="true">
                                <Phone size={20} />
                            </span>
                            <h3 className={styles.cardTitle}>{tr("By phone", locale)}</h3>
                            <p className={styles.cardBody}>{tr("Reception answers in person during opening hours. No menu tree, and no being told to ring back at eight.", locale)}</p>
                            <a className={styles.action} href={brand.phoneHref}>
                                {brand.phone}
                            </a>
                        </li>
                        <li className={styles.card}>
                            <span className={styles.ico} aria-hidden="true">
                                <Video size={20} />
                            </span>
                            <h3 className={styles.cardTitle}>{tr("Video appointment", locale)}</h3>
                            <p className={styles.cardBody}>{tr("For reviews, results and anything that does not need examining. Book as normal and ask for video in the notes.", locale)}</p>
                            <Link className={styles.action} href="/#book">{tr("Request a video slot", locale)}</Link>
                        </li>
                    </ul>
                </div>
            </section>

            {/* ── where to go ─────────────────────────────────────── */}
            <section className={`${styles.section} ${styles.alt}`} aria-labelledby="where">
                <div className="wrap">
                    <h2 className={styles.h2} id="where">{tr("Not sure where to go?", locale)}</h2>
                    <p className={styles.sectionLede}>{tr("The honest version: most things can wait for a normal appointment, some cannot wait until next week, and a few should not wait at all.", locale)}</p>

                    <ul className={styles.triage} role="list">
                        <li className={`${styles.level} ${styles.urgentNow}`}>
                            <p className={styles.levelTag}>
                                <AlertTriangle size={15} aria-hidden="true" />{tr("Do not wait", locale)}</p>
                            <h3 className={styles.cardTitle}>{tr("Emergency", locale)}</h3>
                            <p className={styles.cardBody}>{triage.emergency}</p>
                            {profile.hasEmergency ? (
                                <>
                                    <p className={styles.levelDo}>
                                        {triage.emergencyAdvice(brand.aeLine, brand.emergencyNumber)}
                                    </p>
                                    <Link className={styles.action} href="/urgent-care">{tr("Emergency and urgent care", locale)}</Link>
                                </>
                            ) : (
                                <p className={styles.levelDo}>
                                    {triage.noEmergencyAdvice(brand.emergencyNumber, brand.phone)}
                                </p>
                            )}
                        </li>
                        <li className={styles.level}>
                            <p className={styles.levelTag}>{tr("Today or tomorrow", locale)}</p>
                            <h3 className={styles.cardTitle}>{tr("Urgent, but not an emergency", locale)}</h3>
                            <p className={styles.cardBody}>{triage.urgent}</p>
                            {profile.hasEmergency ? (
                                <>
                                    <p className={styles.levelDo}>{tr("Come to urgent care — it is walk-in, so there is no slot to wait for. Tell us you are coming and the desk expects you.", locale)}</p>
                                    <Link className={styles.action} href="/urgent-care">{tr("Go to urgent care", locale)}</Link>
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
                            <p className={styles.levelTag}>{tr("This week", locale)}</p>
                            <h3 className={styles.cardTitle}>{tr("Routine", locale)}</h3>
                            <p className={styles.cardBody}>{triage.routine}</p>
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
                    <h2 className={styles.h2} id="plan">{tr("Planning your visit", locale)}</h2>
                    <div className={styles.split}>
                        <div>
                            <h3 className={styles.subTitle}>
                                <ClipboardList size={17} aria-hidden="true" />{tr("What to bring", locale)}</h3>
                            <ul className={styles.list} role="list">
                                <li>{tr("A list of your current medication, including doses", locale)}</li>
                                <li>{tr("Any readings you have taken at home", locale)}</li>
                                <li>{tr("Your insurance policy number, if you are using insurance", locale)}</li>
                                <li>{tr("The two or three things you most want answered — appointments run out of time, and the important question is often last", locale)}</li>
                            </ul>

                            <h3 className={styles.subTitle}>
                                <FileText size={17} aria-hidden="true" />{tr("Your records", locale)}</h3>
                            <p className={styles.cardBody}>
                                {tr("You can ask for a copy of what we hold about you at any time, and we will answer within one month. Write to", locale)}{" "}
                                <a href={`mailto:${brand.email}`}>{brand.email}</a>. How we handle
                                your information is set out in our{" "}
                                <Link href="/privacy">privacy notice</Link>.
                            </p>
                        </div>

                        <div>
                            <h3 className={styles.subTitle}>
                                <MapPin size={17} aria-hidden="true" />{tr("Getting here", locale)}</h3>
                            <p className={styles.cardBody}>{brand.address}</p>
                            <p className={styles.cardBody}>{tr("Step-free from the street, a lift to both floors, and two accessible parking bays held for booked appointments. Tell us when you book if you need one.", locale)}</p>

                            <h3 className={styles.subTitle}>{tr("Opening hours", locale)}</h3>
                            <table className={styles.hours}>
                                <caption className="visually-hidden">{tr("Opening hours", locale)}</caption>
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
                    </div>
                </div>
            </section>

            {/* ── cost ────────────────────────────────────────────── */}
            <section className={`${styles.section} ${styles.alt}`} aria-labelledby="cost">
                <div className="wrap">
                    <h2 className={styles.h2} id="cost">
                        <CreditCard size={20} aria-hidden="true" />{tr("What it costs", locale)}</h2>
                    <p className={styles.sectionLede}>{tr("Every price is published on this site. There is no fee to ask a question, no booking fee, and nothing is added afterwards that you were not told about first.", locale)}</p>
                    <ul className={styles.list} role="list">
                        <li>
                            Most major insurers are accepted. Give us the policy number when you
                            book and we will check cover and tell you what, if anything, you will be
                            asked to pay <b>before</b> your appointment rather than after it.
                        </li>
                        <li>{tr("If something falls outside the published list, we tell you the cost before we do it.", locale)}</li>
                        <li>{tr("If cost is the reason you are putting off being seen, say so when you ring. It is a more common conversation than you would think.", locale)}</li>
                    </ul>
                    <Link className={styles.action} href="/#pricing">{tr("See published prices", locale)}</Link>
                </div>
            </section>
        </PageShell>
    );
}

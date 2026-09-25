import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { resolveBrand } from "@/app/features/clinic/brands";
import { PageShell } from "@/app/components/layouts/PageShell";
import { DEPARTMENTS } from "@/app/features/clinic/care";
import { ADDITIONAL_SERVICES, TREATMENTS } from "@/app/features/clinic/catalogue";
import { CatalogueGlyph } from "@/app/features/clinic/components/CatalogueGlyph";
import { ServiceGlyph } from "@/app/features/clinic/components/ServiceGlyph";
import { CLINICIANS, SERVICES } from "@/app/features/clinic/constants";
import styles from "./Index.module.scss";

export async function generateMetadata(): Promise<Metadata> {
    const brand = resolveBrand((await headers()).get("host"));
    return {
        title: `Services — ${brand.name}`,
        description:
            "Every speciality, treatment and service in one place, each routing to the clinicians who provide it.",
        alternates: { canonical: `${siteUrl()}/services` },
        robots: isIndexable() ? undefined : { index: false, follow: false },
    };
}

export default function Page(): React.JSX.Element {
    return (
        <PageShell
            kicker="Services"
            title="Everything we offer"
            lede="Three ways in: by the department you think you need, by the treatment you have been told to have, or by the practical thing you are after."
            image="/img/consulting.jpg"
            imageAlt="A consulting room with two chairs turned toward each other and daylight from a tall window"
        >
            {/* ── departments ─────────────────────────────────── */}
            <section className={styles.section}>
                <div className="wrap">
                    <h2 className={styles.h2}>Specialities and departments</h2>
                    <p className={styles.lede}>
                        Each one routes to the clinicians who staff it and their real availability.
                    </p>
                    <ul className={styles.deptGrid} role="list">
                        {DEPARTMENTS.map((department) => {
                            const count = CLINICIANS.filter((person) =>
                                person.departments.includes(department.id),
                            ).length;
                            return (
                                <li key={department.id}>
                                    <Link className={styles.deptCard} href="/find-a-doctor">
                                        <span className={styles.deptShot}>
                                            <Image
                                                src={department.image}
                                                alt={department.imageAlt}
                                                width={1200}
                                                height={800}
                                                sizes="(min-width: 1040px) 340px, (min-width: 620px) 45vw, 90vw"
                                                className={styles.deptImg}
                                            />
                                            <span className={styles.deptCount}>
                                                {count} {count === 1 ? "clinician" : "clinicians"}
                                            </span>
                                        </span>
                                        <span className={styles.deptBody}>
                                            <span className={styles.deptName}>
                                                {department.name}
                                            </span>
                                            <span className={styles.deptSummary}>
                                                {department.summary}
                                            </span>
                                            <span className={styles.deptGo}>
                                                See who is available
                                                <ArrowRight size={15} aria-hidden="true" />
                                            </span>
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            {/* ── treatments + extras ─────────────────────────── */}
            <section className={`${styles.section} ${styles.alt}`}>
                <div className="wrap">
                    <div className={styles.twoUp}>
                        <div>
                            <h2 className={styles.h2}>Treatments</h2>
                            <p className={styles.lede}>
                                Things you may have been told you need, or booked before.
                            </p>
                            <ul className={styles.rows} role="list">
                                {TREATMENTS.map((treatment) => (
                                    <li key={treatment.slug}>
                                        <Link className={styles.row} href="/find-a-doctor">
                                            <span className={styles.rowIco} aria-hidden="true">
                                                <CatalogueGlyph icon={treatment.icon} />
                                            </span>
                                            <span className={styles.rowBody}>
                                                <span className={styles.rowName}>
                                                    {treatment.name}
                                                </span>
                                                <span className={styles.rowHint}>
                                                    {treatment.summary}
                                                </span>
                                            </span>
                                            <ArrowRight size={16} aria-hidden="true" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className={styles.h2}>Additional services</h2>
                            <p className={styles.lede}>
                                The practical things. Some are bookable, some are walk-in or by
                                referral — it says which.
                            </p>
                            <ul className={styles.rows} role="list">
                                {ADDITIONAL_SERVICES.map((service) => (
                                    <li key={service.slug}>
                                        {service.bookable ? (
                                            <Link className={styles.row} href="/#book">
                                                <span className={styles.rowIco} aria-hidden="true">
                                                    <CatalogueGlyph icon={service.icon} />
                                                </span>
                                                <span className={styles.rowBody}>
                                                    <span className={styles.rowName}>
                                                        {service.name}
                                                    </span>
                                                    <span className={styles.rowHint}>
                                                        {service.summary}
                                                    </span>
                                                </span>
                                                <ArrowRight size={16} aria-hidden="true" />
                                            </Link>
                                        ) : (
                                            <div className={`${styles.row} ${styles.rowStatic}`}>
                                                <span className={styles.rowIco} aria-hidden="true">
                                                    <CatalogueGlyph icon={service.icon} />
                                                </span>
                                                <span className={styles.rowBody}>
                                                    <span className={styles.rowName}>
                                                        {service.name}
                                                    </span>
                                                    <span className={styles.rowHint}>
                                                        {service.summary}
                                                    </span>
                                                </span>
                                                <span className={styles.tag}>No booking needed</span>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── appointment types ───────────────────────────── */}
            <section className={styles.section}>
                <div className="wrap">
                    <h2 className={styles.h2}>Appointment types</h2>
                    <p className={styles.lede}>
                        Each has its own page, its own clinicians and its own availability.
                    </p>
                    <ul className={styles.cards} role="list">
                        {SERVICES.map((service) => (
                            <li key={service.slug} className={styles.card}>
                                <span className={styles.cardIco} aria-hidden="true">
                                    <ServiceGlyph icon={service.icon} />
                                </span>
                                <h3 className={styles.cardTitle}>{service.name}</h3>
                                <p className={styles.cardBody}>{service.summary}</p>
                                <p className={styles.duration}>
                                    <Clock size={13} aria-hidden="true" />
                                    {service.duration}
                                </p>
                                <Link className={styles.viewAll} href={`/services/${service.slug}`}>
                                    See clinicians and availability
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </PageShell>
    );
}

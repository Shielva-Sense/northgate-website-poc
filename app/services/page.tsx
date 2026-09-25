import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { resolveBrand } from "@/app/features/clinic/brands";
import { PageShell } from "@/app/components/layouts/PageShell";
import { DEPARTMENTS } from "@/app/features/clinic/care";
import { ADDITIONAL_SERVICES, TREATMENTS } from "@/app/features/clinic/catalogue";
import { SERVICES } from "@/app/features/clinic/constants";
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

export default async function Page(): Promise<React.JSX.Element> {
    return (
        <PageShell
            kicker="Services"
            title="Everything we offer"
            lede="Three ways in: by the department you think you need, by the treatment you have been told to have, or by the practical thing you are after."
        >
            <section className={styles.section}>
                <div className={`wrap ${styles.layout}`}>
                    <div className={styles.columns}>
                        <div className={styles.column}>
                            <h2 className={styles.colTitle}>Specialities and departments</h2>
                            <ul className={styles.links} role="list">
                                {DEPARTMENTS.map((department) => (
                                    <li key={department.id}>
                                        <Link href={`/#departments`}>{department.name}</Link>
                                        <span className={styles.hint}>{department.summary}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={styles.column}>
                            <h2 className={styles.colTitle}>Treatments</h2>
                            <ul className={styles.links} role="list">
                                {TREATMENTS.map((treatment) => (
                                    <li key={treatment.slug}>
                                        <Link href="/find-a-doctor">{treatment.name}</Link>
                                        <span className={styles.hint}>{treatment.summary}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={styles.column}>
                            <h2 className={styles.colTitle}>Additional services</h2>
                            <ul className={styles.links} role="list">
                                {ADDITIONAL_SERVICES.map((service) => (
                                    <li key={service.slug}>
                                        {service.bookable ? (
                                            <Link href="/#book">{service.name}</Link>
                                        ) : (
                                            <span className={styles.plain}>{service.name}</span>
                                        )}
                                        <span className={styles.hint}>{service.summary}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link className={styles.viewAll} href="/appointments">
                                How to get an appointment
                            </Link>
                        </div>
                    </div>

                    <div className={styles.shot}>
                        <Image
                            src="/img/consultation.jpg"
                            alt="A doctor listening to an older patient in a sunlit consulting room"
                            width={1800}
                            height={1016}
                            sizes="(min-width: 1100px) 420px, 100vw"
                            className={styles.shotImg}
                        />
                    </div>
                </div>
            </section>

            <section className={`${styles.section} ${styles.alt}`}>
                <div className="wrap">
                    <h2 className={styles.h2}>Appointment types</h2>
                    <p className={styles.lede}>
                        Each of these has its own page, its own clinicians and its own availability.
                    </p>
                    <ul className={styles.cards} role="list">
                        {SERVICES.map((service) => (
                            <li key={service.slug} className={styles.card}>
                                <h3 className={styles.cardTitle}>{service.name}</h3>
                                <p className={styles.cardBody}>{service.summary}</p>
                                <p className={styles.duration}>{service.duration}</p>
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

"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, Clock } from "lucide-react";
import { LinkButton } from "@/app/components/ui/LinkButton";
import { AnnounceBar } from "@/app/features/clinic/components/AnnounceBar";
import { SiteHeader } from "@/app/features/clinic/components/SiteHeader";
import { SiteFooter } from "@/app/features/clinic/components/SiteFooter";
import { ScrollProgress } from "@/app/features/clinic/components/ScrollProgress";
import { BookingForm } from "@/app/features/booking/BookingForm";
import { useReveal } from "@/app/core/hooks/useReveal";
import { CLINICIANS, SERVICES } from "@/app/features/clinic/constants";
import { useBrand } from "@/app/features/clinic/BrandContext";
import type { Service } from "@/app/features/clinic/types";
import styles from "./Service.module.scss";

export function ServiceClient({ service }: { service: Service }): React.JSX.Element {
    const brand = useBrand();
    const ref = useReveal<HTMLDivElement>();
    const others = SERVICES.filter((item) => item.slug !== service.slug);

    return (
        <>
            <ScrollProgress />
            <AnnounceBar />
            <SiteHeader />

            <main id="main-content" tabIndex={-1}>
                <article className={styles.page} ref={ref}>
                    <div className="wrap">
                        <nav aria-label="Breadcrumb" className={styles.crumb}>
                            <Link href="/">
                                <ArrowLeft size={14} aria-hidden="true" />
                                {brand.name}
                            </Link>
                        </nav>

                        <div className={styles.head} data-reveal="">
                            <h1 className={styles.h1}>{service.name}</h1>
                            <p className={styles.lede}>{service.summary}</p>
                            <p className={styles.duration}>
                                <Clock size={15} aria-hidden="true" />
                                {service.duration} appointment
                            </p>
                            <div className={styles.cta}>
                                <LinkButton href="#book" size="lg">
                                    Request an appointment
                                </LinkButton>
                                <LinkButton href={brand.phoneHref} variant="ghost" size="lg">
                                    {brand.phone}
                                </LinkButton>
                            </div>
                        </div>

                        <div className={styles.shot} data-reveal="">
                            <Image
                                data-reveal=""
                                data-reveal-style="wipe"
                                src="/img/consulting.jpg"
                                alt="A bright consulting room with an examination couch and a window"
                                width={1536}
                                height={864}
                                priority
                                sizes="(min-width: 980px) 900px, 100vw"
                                className={styles.shotImg}
                            />
                        </div>

                        <div className={styles.body} data-reveal="">
                            <h2 className={styles.h2}>What to expect</h2>
                            <ul className={styles.points} role="list">
                                <li>
                                    <Check size={16} aria-hidden="true" />
                                    A {service.duration} appointment with a named clinician, booked
                                    for the time it actually takes.
                                </li>
                                <li>
                                    <Check size={16} aria-hidden="true" />
                                    A written summary of what was said and what happens next.
                                </li>
                                <li>
                                    <Check size={16} aria-hidden="true" />
                                    The price before you come, and a check of what your insurer
                                    covers.
                                </li>
                                <li>
                                    <Check size={16} aria-hidden="true" />
                                    Onward referral arranged here if you need it.
                                </li>
                            </ul>

                            <h2 className={styles.h2}>Who you would see</h2>
                            <ul className={styles.people} role="list">
                                {CLINICIANS.map((person) => (
                                    <li key={person.name}>
                                        <b>{person.name}</b>
                                        <span>{person.role}</span>
                                        <span className={styles.quals}>
                                            {person.qualifications}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <h2 className={styles.h2}>Other things we do</h2>
                            <ul className={styles.others} role="list">
                                {others.map((item) => (
                                    <li key={item.slug}>
                                        <Link href={`/services/${item.slug}`}>{item.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <section className={styles.book} id="book" data-reveal="">
                            <h2 className={styles.h2}>Request a {service.name.toLowerCase()} appointment</h2>
                            <BookingForm />
                        </section>
                    </div>
                </article>
            </main>

            <SiteFooter />
        </>
    );
}

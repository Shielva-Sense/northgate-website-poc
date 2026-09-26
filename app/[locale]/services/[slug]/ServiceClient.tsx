"use client";

import { LocaleLink as Link } from "@/app/components/ui/LocaleLink";
import Image from "next/image";
import { ArrowLeft, Check, Clock } from "lucide-react";
import { LinkButton } from "@/app/components/ui/LinkButton";
import { AnnounceBar } from "@/app/features/clinic/components/AnnounceBar";
import { SiteHeader } from "@/app/features/clinic/components/SiteHeader";
import { SiteFooter } from "@/app/features/clinic/components/SiteFooter";
import { ScrollProgress } from "@/app/features/clinic/components/ScrollProgress";
import { AppointmentFlow } from "@/app/features/booking/AppointmentFlow";
import { DEPARTMENTS } from "@/app/features/clinic/care";
import { useReveal } from "@/app/core/hooks/useReveal";
import { SERVICES } from "@/app/features/clinic/constants";
import { useBrand, useContent, useProfile } from "@/app/features/clinic/BrandContext";
import { mediaFor } from "@/app/features/clinic/content";
import type { Service } from "@/app/features/clinic/types";
import styles from "./Service.module.scss";
import { tr } from "@/app/core/content-ar";
import { useLocale } from "@/app/features/clinic/LocaleContext";

export function ServiceClient({ service }: { service: Service }): React.JSX.Element {
    const { locale } = useLocale();
    const brand = useBrand();
    const profile = useProfile();
    const { clinicians } = useContent();
    /* A service maps to one or more departments; the first is the one that
       normally runs it, and it pre-filters the clinician list. */
    const department = DEPARTMENTS.find((d) => d.services.includes(service.slug));
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
                        <nav aria-label={tr("Breadcrumb", locale)} className={styles.crumb}>
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
                                <LinkButton href="#book" size="lg">{tr("Request an appointment", locale)}</LinkButton>
                                <LinkButton href={brand.phoneHref} variant="ghost" size="lg">
                                    {brand.phone}
                                </LinkButton>
                            </div>
                        </div>

                        <div className={styles.shot} data-reveal="">
                            <Image
                                data-reveal=""
                                data-reveal-style="wipe"
                                src={mediaFor(profile.kind).consulting}
                                alt={tr("A bright consulting room with an examination couch and a window", locale)}
                                width={1536}
                                height={864}
                                priority
                                sizes="(min-width: 980px) 900px, 100vw"
                                className={styles.shotImg}
                            />
                        </div>

                        <div className={styles.body} data-reveal="">
                            <h2 className={styles.h2}>{tr("What to expect", locale)}</h2>
                            <ul className={styles.points} role="list">
                                <li>
                                    <Check size={16} aria-hidden="true" />
                                    A {service.duration} appointment with a named clinician, booked
                                    for the time it actually takes.
                                </li>
                                <li>
                                    <Check size={16} aria-hidden="true" />{tr("A written summary of what was said and what happens next.", locale)}</li>
                                <li>
                                    <Check size={16} aria-hidden="true" />{tr("The price before you come, and a check of what your insurer covers.", locale)}</li>
                                <li>
                                    <Check size={16} aria-hidden="true" />{tr("Onward referral arranged here if you need it.", locale)}</li>
                            </ul>

                            <h2 className={styles.h2}>{tr("Who you would see", locale)}</h2>
                            <ul className={styles.people} role="list">
                                {clinicians.filter((person) =>
                                    department === undefined
                                        ? true
                                        : person.departments.includes(department.id),
                                ).map((person) => (
                                    <li key={person.name}>
                                        <b>{person.name}</b>
                                        <span>{person.role}</span>
                                        <span className={styles.quals}>
                                            {person.qualifications}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <h2 className={styles.h2}>{tr("Other things we do", locale)}</h2>
                            <ul className={styles.others} role="list">
                                {others.map((item) => (
                                    <li key={item.slug}>
                                        <Link href={`/services/${item.slug}`}>{item.name}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <section className={styles.book} id="book" data-reveal="">
                            <h2 className={styles.h2}>
                                Book a {service.name.toLowerCase()} appointment
                            </h2>
                            <p className={styles.bookSub}>{tr("Pick who you would like to see, then choose from their real availability. No phone queue.", locale)}</p>
                            <AppointmentFlow
                                department={department?.id}
                                serviceName={service.name}
                            />
                        </section>
                    </div>
                </article>
            </main>

            <SiteFooter />
        </>
    );
}

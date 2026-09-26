"use client";

import Image from "next/image";
import { LocaleLink as Link } from "@/app/components/ui/LocaleLink";
import { ArrowRight, Check, Clock, Phone, Star } from "lucide-react";
import { LinkButton } from "@/app/components/ui/LinkButton";
import { LeadCapture } from "@/app/features/booking/LeadCapture";
import { useParallax } from "@/app/core/hooks/useParallax";
import { useReveal } from "@/app/core/hooks/useReveal";
import { useBrand, useContent, useProfile } from "../BrandContext";
import { mediaFor } from "../content";
import type { AppointmentType } from "../content";
import { templateById } from "../templates";
import type { TemplateId } from "../templates";
import { HeroMedia } from "./HeroMedia";
import styles from "./HeroVariants.module.scss";

const STARS = ["one", "two", "three", "four", "five"] as const;

function Rating({ tone }: { readonly tone: "dark" | "light" }): React.JSX.Element {
    const brand = useBrand();
    return (
        <p className={`${styles.rating} ${tone === "dark" ? styles.ratingDark : ""}`}>
            <span className={styles.stars} aria-hidden="true">
                {STARS.map((slot) => (
                    <Star key={slot} size={13} fill="currentColor" strokeWidth={0} />
                ))}
            </span>
            <b>{brand.rating}</b>
            from {brand.ratingCount} reviews
        </p>
    );
}

/**
 * Four heroes, one per template.
 *
 * This is where a template earns the word "design": the running order and the
 * corner radius matter far less than what a visitor meets in the first screen.
 * A hospital opening on a video of one doctor is telling the wrong story, and a
 * procedure clinic that buries its prices below the fold is hiding the only
 * thing its visitor came for.
 *
 * They share the brand, the rating and the booking form — nothing here forks
 * the data, only the composition.
 */
export function Hero({ template }: { readonly template: TemplateId }): React.JSX.Element {
    const { design } = templateById(template);
    if (design.heroStyle === "split") return <HeroSplit />;
    if (design.heroStyle === "panel") return <HeroPanel />;
    if (design.heroStyle === "editorial") return <HeroEditorial />;
    return <HeroCinematic />;
}

/* ── cinematic: the footage does the persuading ──────────────────────── */
function HeroCinematic(): React.JSX.Element {
    const profile = useProfile();
    const brand = useBrand();
    const ref = useReveal<HTMLDivElement>();
    const back = useParallax<HTMLDivElement>(-0.12);
    /* Resolved once, so the poster and the footage can never come from
       different trades — the poster is literally the video's first frame. */
    const media = mediaFor(profile.kind);
    /* The team and the appointment length are this practice's own, not a
       general practice's seven clinicians and twenty minutes. */
    const { clinicians, appointmentTypes } = useContent();
    const shortest = appointmentTypes.reduce<AppointmentType | undefined>(
        (best, type) => (best === undefined || type.minutes < best.minutes ? type : best),
        undefined,
    );

    return (
        <section className={`${styles.hero} ${styles.cinematic}`} id="top">
            <div className={styles.back} ref={back} aria-hidden="true">
                <HeroMedia poster={media.consultation} src={media.heroVideo} />
            </div>
            <div className={styles.scrim} aria-hidden="true" />

            <div className={`wrap ${styles.cineGrid}`} ref={ref}>
                <div className={styles.cineCopy} data-reveal="">
                    <Rating tone="dark" />
                    <h1 className={styles.h1}>
                        <span className="line-mask">
                            <span data-reveal="" data-reveal-style="rise">
                                See a named {profile.clinician}
                            </span>
                        </span>
                        <span className="line-mask">
                            <em data-reveal="" data-reveal-style="rise">
                                this week
                            </em>
                        </span>
                        <span className="line-mask">
                            <span data-reveal="" data-reveal-style="rise">
                                not in three
                            </span>
                        </span>
                    </h1>
                    <p className={styles.lede}>
                        {clinicians.length} {clinicians.length === 1 ? profile.clinician : profile.clinicianPlural}.{" "}
                        {shortest === undefined ? null : `${shortest.minutes}-minute ${profile.visit}s. `}
                        Every price published on this page, and a real time confirmed within the hour.
                    </p>
                    <div className={styles.cta}>
                        <LinkButton href="/#team" size="lg">
                            Choose your clinician
                        </LinkButton>
                        <LinkButton href={brand.phoneHref} variant="onDark" size="lg">
                            {brand.phone}
                        </LinkButton>
                    </div>
                </div>
                <div data-reveal="">
                    <LeadCapture />
                </div>
            </div>
        </section>
    );
}

/* ── split: institutional, departments first ─────────────────────────── */
function HeroSplit(): React.JSX.Element {
    const profile = useProfile();
    const brand = useBrand();
    const ref = useReveal<HTMLDivElement>();
    /* This practice's departments. The module constant listed a general
       practice's six on every site, so the chips under the headline never
       matched the departments the rest of the page offered. */
    const { departments } = useContent();

    return (
        <section className={`${styles.hero} ${styles.split}`} id="top" ref={ref}>
            <div className={styles.splitPanel}>
                <div className={styles.splitInner} data-reveal="">
                    <Rating tone="dark" />
                    <h1 className={styles.h1Sans}>
                        Find the right department, then the right day
                    </h1>
                    <p className={styles.lede}>
                        {departments.length} departments, {brand.ratingCount} reviews, and every{" "}
                        {profile.clinician} bookable by name.
                    </p>
                    <ul className={styles.deptChips} role="list">
                        {departments.slice(0, 5).map((department) => (
                            <li key={department.id}>
                                <Link href="/#departments">{department.name}</Link>
                            </li>
                        ))}
                        <li>
                            <Link href="/services" className={styles.chipAll}>
                                All services
                                <ArrowRight size={13} aria-hidden="true" />
                            </Link>
                        </li>
                    </ul>
                    <div className={styles.cta}>
                        <LinkButton href="/find-a-doctor" size="lg">
                            Not sure who to see?
                        </LinkButton>
                        <LinkButton href={brand.phoneHref} variant="onDark" size="lg">
                            <Phone size={16} aria-hidden="true" />
                            {brand.phone}
                        </LinkButton>
                    </div>
                </div>
            </div>
            <div className={styles.splitShot} data-reveal="">
                <Image
                    src={mediaFor(profile.kind).exterior}
                    alt="The practice building on a quiet leafy street"
                    fill
                    priority
                    sizes="(min-width: 980px) 50vw, 100vw"
                    className={styles.splitImg}
                />
            </div>
        </section>
    );
}

/* ── panel: price and proof, form front and centre ───────────────────── */
function HeroPanel(): React.JSX.Element {
    const profile = useProfile();
    const brand = useBrand();
    const ref = useReveal<HTMLDivElement>();
    /* This practice's own cheapest card, in its own currency. PACKAGES[0] was
       a general practice's £68 appointment, quoted in the hero of every site. */
    const { packages } = useContent();
    const cheapest = packages[0];

    return (
        <section className={`${styles.hero} ${styles.panel}`} id="top">
            <div className={`wrap ${styles.panelInner}`} ref={ref}>
                <div className={styles.panelCopy} data-reveal="">
                    <Rating tone="light" />
                    <h1 className={styles.h1Sans}>
                        Published prices. Named clinicians. Seen this week.
                    </h1>
                    <p className={styles.lede}>
                        No consultation fee to ask a question, no booking fee, and nothing added
                        afterwards that you were not told about first.
                    </p>
                    <ul className={styles.proofChips} role="list">
                        <li>
                            <Check size={14} aria-hidden="true" />
                            From {cheapest?.price} per appointment
                        </li>
                        <li>
                            <Clock size={14} aria-hidden="true" />
                            Confirmed within the hour
                        </li>
                        <li>
                            <Check size={14} aria-hidden="true" />
                            Most insurers accepted
                        </li>
                    </ul>
                    <div className={styles.cta}>
                        <LinkButton href="/#pricing" size="lg">
                            See all prices
                        </LinkButton>
                        <LinkButton href={brand.phoneHref} variant="ghost" size="lg">
                            {brand.phone}
                        </LinkButton>
                    </div>
                </div>
                {/* The form sits on the photograph rather than beside it: a
                    procedure clinic still has to look like somewhere you would
                    walk into, and a hero of pure copy reads unfinished. */}
                <div className={styles.panelMedia} data-reveal="">
                    <Image
                        src={mediaFor(profile.kind).treatment}
                        alt="A spotless minor-procedures room with a sterile instrument trolley"
                        fill
                        priority
                        sizes="(min-width: 980px) 45vw, 100vw"
                        className={styles.panelImg}
                    />
                    <div className={styles.panelFormCard}>
                        <LeadCapture />
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ── editorial: calm, image below the words ──────────────────────────── */
function HeroEditorial(): React.JSX.Element {
    const profile = useProfile();
    const ref = useReveal<HTMLDivElement>();
    const shot = useParallax<HTMLDivElement>(0.05);
    const media = mediaFor(profile.kind);

    return (
        <section className={`${styles.hero} ${styles.editorial}`} id="top">
            <div className="wrap" ref={ref}>
                <div className={styles.editCopy} data-reveal="">
                    <Rating tone="light" />
                    <h1 className={styles.h1Edit}>
                        Unhurried care, from people who remember you
                    </h1>
                    <p className={styles.ledeWide}>
                        Time that suits what you came for, and the same {profile.clinician} every
                        visit if you would rather. We book to time because we run to time.
                    </p>
                    <div className={styles.cta}>
                        <LinkButton href="/#book" size="lg">
                            Request an appointment
                        </LinkButton>
                        <LinkButton href="/#story" variant="ghost" size="lg">
                            Read a patient&rsquo;s story
                        </LinkButton>
                    </div>
                </div>
            </div>
            <div className={`wrap ${styles.editShotWrap}`}>
                <div className={styles.editShot} ref={shot} data-reveal="" data-reveal-style="wipe">
                    {/* HeroMedia rather than a second <video>: it already owns the
                        reduced-motion opt-out, the off-screen pause and the
                        degrade-to-poster path. The poster is this clip's own
                        first frame, so a refused autoplay leaves the same
                        composition rather than a different room. */}
                    <HeroMedia poster={media.editorialPoster} src={media.editorialVideo} />
                </div>
            </div>
        </section>
    );
}

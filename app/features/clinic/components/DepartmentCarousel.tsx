"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { DEPARTMENTS } from "../care";
import styles from "./DepartmentCarousel.module.scss";

const INTERVAL_MS = 5_000;

/**
 * The departments, one at a time, filling the section.
 *
 * A six-up grid of small cards made every department look identical and none
 * of them look like a place. One photograph at full width does the opposite.
 *
 * Auto-advance is a convenience, never a trap:
 *
 * - It stops on hover, on touch and on keyboard focus anywhere inside, so it
 *   cannot move the thing you are reaching for out from under you.
 * - It is off entirely under prefers-reduced-motion.
 * - There is a visible pause control, because an auto-playing carousel with no
 *   way to stop it is a WCAG 2.2.2 failure, not a style choice.
 * - It pauses when the tab is hidden, so it is not burning a timer in the
 *   background for a section nobody is looking at.
 */
export function DepartmentCarousel({
    heading,
}: {
    /** Omit when the surrounding section already carries a heading. */
    readonly heading?: string | undefined;
} = {}): React.JSX.Element {
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(true);
    const holdRef = useRef(false);
    const regionRef = useRef<HTMLDivElement>(null);

    const count = DEPARTMENTS.length;
    const go = useCallback(
        (next: number): void => setIndex(((next % count) + count) % count),
        [count],
    );

    /* Native listeners rather than React props: a pointerenter that never
       fires on touch, and a touchstart React cannot make passive, both left
       the marquee unstoppable the last time this was done with JSX handlers. */
    useEffect(() => {
        const el = regionRef.current;
        if (el === null) return;

        const hold = (): void => {
            holdRef.current = true;
        };
        const release = (): void => {
            holdRef.current = false;
        };

        const events: readonly [string, () => void][] = [
            ["pointerenter", hold],
            ["pointerleave", release],
            ["mouseenter", hold],
            ["mouseleave", release],
            ["touchstart", hold],
            ["touchend", release],
            ["touchcancel", release],
            ["focusin", hold],
            ["focusout", release],
        ];
        for (const [name, fn] of events) el.addEventListener(name, fn, { passive: true });
        return () => {
            for (const [name, fn] of events) el.removeEventListener(name, fn);
        };
    }, []);

    useEffect(() => {
        if (!playing) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const timer = window.setInterval(() => {
            if (holdRef.current || document.hidden) return;
            setIndex((value) => (value + 1) % count);
        }, INTERVAL_MS);
        return () => window.clearInterval(timer);
    }, [playing, count]);

    const current = DEPARTMENTS[index];
    if (current === undefined) return <></>;

    return (
        <section
            className={styles.section}
            aria-labelledby={heading === undefined ? undefined : "dept-carousel-heading"}
            aria-label={heading === undefined ? "Departments" : undefined}
        >
            {heading === undefined ? null : (
                <div className="wrap">
                    <h2 className={styles.heading} id="dept-carousel-heading">
                        {heading}
                    </h2>
                </div>
            )}

            <div
                className={styles.stage}
                ref={regionRef}
                role="group"
                aria-roledescription="carousel"
                aria-label="Departments"
            >
                {DEPARTMENTS.map((dept, i) => (
                    <div
                        key={dept.id}
                        className={`${styles.slide} ${i === index ? styles.slideOn : ""}`}
                        aria-hidden={i === index ? undefined : true}
                        /* inert would be better, but its React typing is not
                           settled; hiding from AT plus removing from the tab
                           order is the same outcome today. */
                    >
                        <Image
                            src={dept.image}
                            alt={i === index ? dept.imageAlt : ""}
                            width={1600}
                            height={900}
                            sizes="100vw"
                            priority={i === 0}
                            className={styles.img}
                        />
                        <div className={styles.scrim} aria-hidden="true" />
                        <div className={`wrap ${styles.caption}`}>
                            <p className={styles.count}>
                                {i + 1} of {count}
                            </p>
                            <h3 className={styles.name}>{dept.name}</h3>
                            <p className={styles.summary}>{dept.summary}</p>
                            <Link
                                className={styles.go}
                                href="/find-a-doctor"
                                tabIndex={i === index ? undefined : -1}
                            >
                                See who is available
                                <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    className={`${styles.arrow} ${styles.prev}`}
                    onClick={() => go(index - 1)}
                    aria-label="Previous department"
                >
                    <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    className={`${styles.arrow} ${styles.next}`}
                    onClick={() => go(index + 1)}
                    aria-label="Next department"
                >
                    <ChevronRight size={20} aria-hidden="true" />
                </button>
            </div>

            <div className={`wrap ${styles.controls}`}>
                <button
                    type="button"
                    className={styles.playPause}
                    onClick={() => setPlaying((value) => !value)}
                    aria-label={playing ? "Pause the carousel" : "Play the carousel"}
                >
                    {playing ? (
                        <Pause size={15} aria-hidden="true" />
                    ) : (
                        <Play size={15} aria-hidden="true" />
                    )}
                    {playing ? "Pause" : "Play"}
                </button>

                <ul className={styles.dots} role="list">
                    {DEPARTMENTS.map((dept, i) => (
                        <li key={dept.id}>
                            <button
                                type="button"
                                className={`${styles.dot} ${i === index ? styles.dotOn : ""}`}
                                aria-label={dept.name}
                                aria-current={i === index ? "true" : undefined}
                                onClick={() => go(i)}
                            />
                        </li>
                    ))}
                </ul>

                {/* Announces the change without stealing focus. */}
                <p className="visually-hidden" role="status">
                    {current.name}, {index + 1} of {count}
                </p>
            </div>
        </section>
    );
}

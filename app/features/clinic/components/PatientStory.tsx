"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { useReveal } from "@/app/core/hooks/useReveal";
import { PATIENT_STORY, REVIEWS } from "../constants";
import styles from "./PatientStory.module.scss";

/**
 * One filmed patient story.
 *
 * Deliberately click-to-play, not autoplay: someone speaking about their own
 * health is not wallpaper, and starting it unbidden while a visitor is reading
 * the quote beside it is the wrong call. Until it is started, the poster and
 * the pull-quote carry the whole section, so the story still lands for anyone
 * who never presses play — which is most people.
 */
export function PatientStory(): React.JSX.Element {
    const ref = useReveal<HTMLDivElement>();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [started, setStarted] = useState(false);

    function start(): void {
        setStarted(true);
        // The element exists already; it is only hidden behind the poster.
        const el = videoRef.current;
        if (!el) return;
        el.controls = true;
        void el.play().catch(() => undefined);
        el.focus();
    }

    return (
        <section className={styles.section} id="story">
            <div className="wrap" ref={ref}>
                <h2 className={styles.title} data-reveal="">
                    In their words
                </h2>

                <div className={styles.grid}>
                    <div className={styles.player} data-reveal="">
                        <video
                            ref={videoRef}
                            className={styles.video}
                            poster={PATIENT_STORY.poster}
                            playsInline
                            preload="none"
                            aria-label={`${PATIENT_STORY.name}'s story`}
                        >
                            <source src={PATIENT_STORY.video} type="video/mp4" />
                        </video>

                        {started ? null : (
                            <button
                                type="button"
                                className={styles.cover}
                                onClick={start}
                                aria-label={`Play ${PATIENT_STORY.name}'s story`}
                            >
                                <Image
                                    src={PATIENT_STORY.poster}
                                    alt={PATIENT_STORY.posterAlt}
                                    width={1080}
                                    height={1080}
                                    sizes="(min-width: 980px) 460px, 90vw"
                                    className={styles.coverImg}
                                />
                                <span className={styles.play} aria-hidden="true">
                                    <Play size={26} fill="currentColor" strokeWidth={0} />
                                </span>
                            </button>
                        )}
                    </div>

                    <figure className={styles.quoteWrap} data-reveal="">
                        <blockquote className={styles.quote}>
                            &ldquo;{PATIENT_STORY.quote}&rdquo;
                        </blockquote>
                        <figcaption className={styles.who}>
                            <span className={styles.name}>
                                <b>{PATIENT_STORY.name}</b>, {PATIENT_STORY.age}
                            </span>
                            <span className={styles.context}>{PATIENT_STORY.context}</span>
                        </figcaption>
                    </figure>
                </div>
            </div>

            <Voices />
        </section>
    );
}

/**
 * The quote marquee.
 *
 * Drifts continuously and stops the moment anyone engages with it — hover,
 * touch, drag, or keyboard focus landing inside — because a line of text that
 * slides away while you are half way through reading it is worse than no
 * motion at all.
 *
 * The set is rendered twice. The drift resets by exactly one set's width once
 * it has travelled that far, and because the two halves are identical the jump
 * is invisible, which is what makes it seamless rather than a bounce. The
 * second copy is aria-hidden so the quotes are not announced twice.
 *
 * It is still a real overflow scroller underneath, so touch momentum, trackpad
 * swipe and arrow keys all keep working, and under reduced motion it simply
 * never drifts.
 */
function Voices(): React.JSX.Element {
    const railRef = useRef<HTMLDivElement>(null);
    const paused = useRef(false);

    useEffect(() => {
        const rail = railRef.current;
        if (!rail) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let frame = 0;
        let last = 0;
        const PIXELS_PER_SECOND = 34;

        const tick = (now: number): void => {
            const elapsed = last === 0 ? 0 : now - last;
            last = now;

            if (!paused.current && !document.hidden) {
                rail.scrollLeft += (PIXELS_PER_SECOND * elapsed) / 1000;
                // One set's width. Subtracting it lands on an identical frame.
                const half = rail.scrollWidth / 2;
                if (half > 0 && rail.scrollLeft >= half) rail.scrollLeft -= half;
            }

            frame = window.requestAnimationFrame(tick);
        };

        // Pause is wired natively rather than through React's synthetic
        // enter/leave, which are synthesised from over/out and so depend on
        // exactly which events the pointing device emits. Listening for the
        // mouse *and* pointer *and* touch families directly means a stylus, a
        // trackpad and a finger all stop it the same way.
        const hold = (): void => {
            paused.current = true;
        };
        const release = (): void => {
            paused.current = false;
        };

        const HOLD_EVENTS = [
            "pointerenter",
            "mouseenter",
            "pointerdown",
            "touchstart",
            "focusin",
        ] as const;
        const RELEASE_EVENTS = [
            "pointerleave",
            "mouseleave",
            "pointerup",
            "touchend",
            "touchcancel",
            "focusout",
        ] as const;

        for (const name of HOLD_EVENTS) rail.addEventListener(name, hold, { passive: true });
        for (const name of RELEASE_EVENTS) {
            rail.addEventListener(name, release, { passive: true });
        }

        frame = window.requestAnimationFrame(tick);

        return () => {
            window.cancelAnimationFrame(frame);
            for (const name of HOLD_EVENTS) rail.removeEventListener(name, hold);
            for (const name of RELEASE_EVENTS) rail.removeEventListener(name, release);
        };
    }, []);

    const nudge = useCallback((direction: 1 | -1): void => {
        const rail = railRef.current;
        if (!rail) return;
        // Hold the drift while the smooth scroll runs, or the two fight and
        // the rail judders instead of gliding to the next card.
        paused.current = true;
        window.setTimeout(() => {
            paused.current = false;
        }, 900);
        const card = rail.querySelector("li");
        const step = card ? card.getBoundingClientRect().width + 24 : rail.clientWidth / 3;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        rail.scrollBy({ left: step * direction, behavior: reduced ? "auto" : "smooth" });
    }, []);

    return (
        <div className={styles.voices}>
            <div
                className={styles.rail}
                ref={railRef}
                // Focusable so it can be scrolled with the keyboard, and named
                // so a screen reader announces what the region is.
                tabIndex={0}
                role="group"
                aria-label="What patients say"
            >
                {[0, 1].map((copy) => (
                    <ul
                        className={styles.set}
                        key={copy}
                        role={copy === 0 ? "list" : "presentation"}
                        aria-hidden={copy === 1 ? true : undefined}
                    >
                        {REVIEWS.map((review) => (
                            <li key={review.name} className={styles.voice}>
                                <blockquote className={styles.voiceQuote}>
                                    &ldquo;{review.quote}&rdquo;
                                </blockquote>
                                <p className={styles.voiceWho}>
                                    <b>{review.name}</b>
                                    <span>{review.context}</span>
                                </p>
                            </li>
                        ))}
                    </ul>
                ))}
            </div>

            <div className={`wrap ${styles.railNav}`}>
                <button
                    type="button"
                    className={styles.round}
                    onClick={() => nudge(-1)}
                    aria-label="Previous quotes"
                >
                    <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <button
                    type="button"
                    className={styles.round}
                    onClick={() => nudge(1)}
                    aria-label="More quotes"
                >
                    <ChevronRight size={18} aria-hidden="true" />
                </button>
            </div>
        </div>
    );
}

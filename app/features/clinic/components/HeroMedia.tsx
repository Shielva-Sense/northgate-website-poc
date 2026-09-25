"use client";

import { useEffect, useRef } from "react";
import styles from "./Sections.module.scss";

type Props = {
    /** Shown until the first frame paints, and instead of the video whenever
     *  it cannot or should not play. Must be a real image, never a colour. */
    readonly poster: string;
    readonly src: string;
};

/**
 * The playing hero.
 *
 * Three rules it has to keep, in order:
 *
 * 1. It must never be blank. The poster is the still we already ship, so a
 *    refused autoplay, a slow network or a codec miss degrades to exactly the
 *    design that was there before the video existed.
 * 2. Reduced motion means reduced motion. A full-bleed moving background is
 *    the worst offender for vestibular triggers, so it is never started.
 * 3. It must not burn battery off-screen. Playback is tied to visibility and
 *    to the tab being foregrounded.
 */
export function HeroMedia({ poster, src }: Props): React.JSX.Element {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Some browsers only honour muted autoplay when it is set as a
        // property, not merely as an attribute.
        el.muted = true;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let visible = false;

        const sync = (): void => {
            if (visible && !document.hidden) {
                // Autoplay can still be refused; the poster stays, which is fine.
                void el.play().catch(() => undefined);
            } else {
                el.pause();
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) visible = entry.isIntersecting;
                sync();
            },
            { threshold: 0.1 },
        );
        observer.observe(el);
        document.addEventListener("visibilitychange", sync);

        return () => {
            observer.disconnect();
            document.removeEventListener("visibilitychange", sync);
        };
    }, []);

    return (
        <video
            ref={ref}
            className={styles.heroVideo}
            poster={poster}
            muted
            loop
            playsInline
            preload="metadata"
            // Decorative: the headline beside it carries the meaning.
            aria-hidden="true"
            tabIndex={-1}
        >
            <source src={src} type="video/mp4" />
        </video>
    );
}

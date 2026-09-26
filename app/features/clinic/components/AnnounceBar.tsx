"use client";

import { useEffect, useState } from "react";

import { useProfile } from "../BrandContext";
import styles from "./AnnounceBar.module.scss";

const ROTATE_MS = 4500;

/**
 * A single rotating line of reassurance above the header.
 *
 * It is a live region rather than a marquee: the text swaps in place, screen
 * readers are told politely, and it pauses when the tab is hidden so a
 * backgrounded page is not burning frames.
 */
export function AnnounceBar(): React.JSX.Element {
    /* This practice's own lines. The shared set promised blood results in two
       working days and evening GP clinics, on veterinary and dental sites
       alike. */
    const { announcements } = useProfile();
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const id = window.setInterval(() => {
            if (document.hidden) return;
            setIndex((current) => (current + 1) % announcements.length);
        }, ROTATE_MS);
        return () => window.clearInterval(id);
    }, [announcements.length]);

    return (
        <aside className={styles.bar} aria-label="Practice updates">
            <p className={styles.inner} aria-live="polite">
                {/* Keyed on the message itself: it remounts on each change so
                    the fade re-runs, without keying on an array index. */}
                <span key={announcements[index]} className={styles.line}>
                    {announcements[index]}
                </span>
            </p>
        </aside>
    );
}

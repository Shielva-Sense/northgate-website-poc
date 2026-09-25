"use client";

import { useEffect, useState } from "react";
import { ANNOUNCEMENTS } from "../constants";
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
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const id = window.setInterval(() => {
            if (document.hidden) return;
            setIndex((current) => (current + 1) % ANNOUNCEMENTS.length);
        }, ROTATE_MS);
        return () => window.clearInterval(id);
    }, []);

    return (
        <aside className={styles.bar} aria-label="Practice updates">
            <p className={styles.inner} aria-live="polite">
                {/* Keyed on the message itself: it remounts on each change so
                    the fade re-runs, without keying on an array index. */}
                <span key={ANNOUNCEMENTS[index]} className={styles.line}>
                    {ANNOUNCEMENTS[index]}
                </span>
            </p>
        </aside>
    );
}

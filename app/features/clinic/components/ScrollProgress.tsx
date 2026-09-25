"use client";

import { useEffect, useRef } from "react";
import styles from "./ScrollProgress.module.scss";

/**
 * Reading-progress bar across the top of the page.
 *
 * Writes a scale directly to the node in a rAF rather than going through React
 * state, so scrolling never queues a render. Decorative, so it is hidden from
 * assistive tech and simply never drawn under reduced motion.
 */
export function ScrollProgress(): React.JSX.Element {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let frame = 0;

        const update = (): void => {
            frame = 0;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
            el.style.transform = `scaleX(${ratio.toFixed(4)})`;
        };

        const schedule = (): void => {
            if (frame !== 0) return;
            frame = window.requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule, { passive: true });

        return () => {
            if (frame !== 0) window.cancelAnimationFrame(frame);
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
        };
    }, []);

    return (
        <div className={styles.track} aria-hidden="true">
            <div className={styles.bar} ref={ref} />
        </div>
    );
}

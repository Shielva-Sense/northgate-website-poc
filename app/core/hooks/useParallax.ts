"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll parallax, written to stay off the main thread as much as possible.
 *
 * - Writes a CSS variable rather than inline `top`/`transform` strings, so the
 *   element decides how to use the offset and only `transform` is animated.
 * - Reads scroll in a rAF, never in the scroll handler, so a fast wheel cannot
 *   queue a layout per event.
 * - Disabled entirely under prefers-reduced-motion: parallax is the single
 *   worst offender for motion sickness.
 *
 * `speed` is a fraction of the scrolled distance: 0.12 moves the element 12% as
 * far as the page. Keep it small; large values read as broken rather than deep.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>(
    speed = 0.12,
): React.RefObject<T | null> {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let frame = 0;
        let running = true;

        const update = (): void => {
            frame = 0;
            if (!running) return;
            const box = el.getBoundingClientRect();
            // Distance of the element's centre from the viewport centre.
            const fromCentre = box.top + box.height / 2 - window.innerHeight / 2;
            el.style.setProperty("--parallax", `${(-fromCentre * speed).toFixed(2)}px`);
        };

        const schedule = (): void => {
            if (frame !== 0) return;
            frame = window.requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule, { passive: true });

        return () => {
            running = false;
            if (frame !== 0) window.cancelAnimationFrame(frame);
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
            el.style.removeProperty("--parallax");
        };
    }, [speed]);

    return ref;
}

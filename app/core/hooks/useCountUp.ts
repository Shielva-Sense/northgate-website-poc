"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a headline number up once, the first time it scrolls into view.
 *
 * The number is the proof, so the animation must never be the reason someone
 * cannot read it: under reduced motion, or without IntersectionObserver, the
 * final value is set straight away.
 */
export function useCountUp(
    target: number,
    durationMs = 1400,
): { readonly ref: React.RefObject<HTMLSpanElement | null>; readonly value: number } {
    const ref = useRef<HTMLSpanElement>(null);
    const [value, setValue] = useState(0);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let frame = 0;
        let start = 0;

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced || typeof IntersectionObserver === "undefined") {
            // Jump straight to the figure, but on the next frame rather than
            // synchronously in the effect, which would cascade a second render.
            frame = window.requestAnimationFrame(() => setValue(target));
            return () => window.cancelAnimationFrame(frame);
        }

        const tick = (now: number): void => {
            if (start === 0) start = now;
            const progress = Math.min((now - start) / durationMs, 1);
            // Ease-out: fast at first, settling on the real figure.
            setValue(Math.round(target * (1 - (1 - progress) ** 3)));
            if (progress < 1) frame = window.requestAnimationFrame(tick);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    observer.disconnect();
                    frame = window.requestAnimationFrame(tick);
                }
            },
            { threshold: 0.4 },
        );

        observer.observe(el);

        return () => {
            observer.disconnect();
            if (frame !== 0) window.cancelAnimationFrame(frame);
        };
    }, [target, durationMs]);

    return { ref, value };
}

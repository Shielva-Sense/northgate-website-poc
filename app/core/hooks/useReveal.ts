"use client";

import { useEffect, useRef } from "react";

/**
 * Reveal-on-scroll, made fail-safe.
 *
 * The hidden state is scoped to `html.js-reveal`, which this hook adds. If JS
 * never runs, the observer is unsupported, or the callback never fires, the
 * content is simply visible — an animation must never be able to hide content
 * permanently.
 *
 * Anything already on screen at mount is revealed immediately rather than
 * waiting for an intersection that has already happened.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(): React.RefObject<T | null> {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const root = document.documentElement;
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const targets = [el, ...Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]"))];

        if (reduced || typeof IntersectionObserver === "undefined") {
            for (const target of targets) target.setAttribute("data-reveal", "shown");
            return;
        }

        // Only now is it safe to hide anything.
        root.classList.add("js-reveal");

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    entry.target.setAttribute("data-reveal", "shown");
                    observer.unobserve(entry.target);
                }
            },
            { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
        );

        for (const target of targets) {
            // Already in view (deep link, short page, restored scroll): show now.
            const box = target.getBoundingClientRect();
            if (box.top < window.innerHeight && box.bottom > 0) {
                target.setAttribute("data-reveal", "shown");
                continue;
            }
            observer.observe(target);
        }

        // Last-resort guard: nothing stays invisible for more than a few seconds.
        const failsafe = window.setTimeout(() => {
            for (const target of targets) target.setAttribute("data-reveal", "shown");
        }, 3000);

        return () => {
            observer.disconnect();
            window.clearTimeout(failsafe);
        };
    }, []);

    return ref;
}

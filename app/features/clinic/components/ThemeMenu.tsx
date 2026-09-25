"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Palette } from "lucide-react";
import { THEMES } from "../brands";
import { applyTheme, clearTheme, readStoredTheme } from "../theme";
import styles from "./ThemeMenu.module.scss";

/**
 * The colour chooser, in the header, on every page.
 *
 * The big picker on /templates explains the palettes; this one is for the
 * prospect already looking at a page they care about who wants to see it in
 * their own colours without going back to a chooser.
 *
 * It is a disclosure, not a <select>: a native select cannot show a swatch,
 * and a swatch is the entire point. That means owning the keyboard and
 * dismissal behaviour — Escape closes and returns focus, a click outside
 * closes, and the trigger reports its state with aria-expanded.
 */
export function ThemeMenu(): React.JSX.Element {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<string | null>(null);
    const wrapRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const stored = readStoredTheme();
        if (stored === null) return;
        const frame = window.requestAnimationFrame(() => setActive(stored));
        return () => window.cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        if (!open) return;

        const onKey = (event: KeyboardEvent): void => {
            if (event.key !== "Escape") return;
            setOpen(false);
            // Focus must come back to the trigger, or a keyboard user is
            // dropped at the top of the document.
            triggerRef.current?.focus();
        };
        const onPointer = (event: PointerEvent): void => {
            const wrap = wrapRef.current;
            if (wrap === null) return;
            if (event.target instanceof Node && wrap.contains(event.target)) return;
            setOpen(false);
        };

        document.addEventListener("keydown", onKey);
        document.addEventListener("pointerdown", onPointer);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.removeEventListener("pointerdown", onPointer);
        };
    }, [open]);

    const current = THEMES.find((theme) => theme.id === active);

    return (
        <div className={styles.wrap} ref={wrapRef}>
            <button
                type="button"
                ref={triggerRef}
                className={styles.trigger}
                aria-expanded={open}
                aria-haspopup="true"
                onClick={() => setOpen((value) => !value)}
            >
                <span
                    className={styles.dot}
                    style={
                        current === undefined
                            ? undefined
                            : { background: current.palette.brand600 }
                    }
                    aria-hidden="true"
                />
                <Palette size={15} aria-hidden="true" />
                <span className="visually-hidden">
                    Brand colours{current === undefined ? "" : `, currently ${current.name}`}
                </span>
            </button>

            {open ? (
                <div className={styles.menu} role="group" aria-label="Brand colours">
                    <p className={styles.menuHead}>Brand colours</p>
                    <ul className={styles.list} role="list">
                        {THEMES.map((theme) => (
                            <li key={theme.id}>
                                <button
                                    type="button"
                                    className={styles.option}
                                    aria-pressed={active === theme.id}
                                    onClick={() => {
                                        applyTheme(theme.id);
                                        setActive(theme.id);
                                    }}
                                >
                                    <span className={styles.chips} aria-hidden="true">
                                        <span style={{ background: theme.palette.brand900 }} />
                                        <span style={{ background: theme.palette.brand600 }} />
                                        <span style={{ background: theme.palette.accent }} />
                                    </span>
                                    {theme.name}
                                    {active === theme.id ? (
                                        <Check size={14} aria-hidden="true" />
                                    ) : null}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        className={styles.reset}
                        onClick={() => {
                            clearTheme();
                            setActive(null);
                        }}
                    >
                        Reset to this practice&rsquo;s colours
                    </button>
                </div>
            ) : null}
        </div>
    );
}

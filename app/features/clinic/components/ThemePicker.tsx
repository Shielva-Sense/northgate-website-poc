"use client";

import { useEffect, useState } from "react";
import { Check, Palette as PaletteIcon } from "lucide-react";
import { paletteVarsFor, THEMES } from "../brands";
import styles from "./ThemePicker.module.scss";

const STORAGE_KEY = "northgate:theme";

/**
 * Live brand-colour chooser.
 *
 * Practices do not all want to look the same, and "we can change the colours"
 * is far less convincing than watching the site change while you click. It
 * writes the same CSS custom properties the server writes for a tenant, so
 * what a prospect picks here is exactly what their deployment would ship —
 * no separate preview styling that could drift from the real thing.
 *
 * The choice is a per-browser convenience, so localStorage is the right home
 * for it. Every access is guarded: a private window or blocked site data
 * throws on read, and the picker must still work.
 */
export function ThemePicker(): React.JSX.Element {
    const [active, setActive] = useState<string | null>(null);

    /* Restore after mount, never during render: the server has already sent
       the tenant's own palette, and reading storage while rendering would
       produce a hydration mismatch. */
    useEffect(() => {
        let stored: string | null = null;
        try {
            stored = window.localStorage.getItem(STORAGE_KEY);
        } catch {
            stored = null;
        }
        if (stored === null) return;
        const theme = THEMES.find((t) => t.id === stored);
        if (theme === undefined) return;

        /* The CSS variables can be written straight away — that is the whole
           point of an effect, syncing React to an external system. Marking the
           swatch is React state, so it waits a frame rather than cascading a
           second render out of this one. */
        apply(theme.id, false);
        const frame = window.requestAnimationFrame(() => setActive(theme.id));
        return () => window.cancelAnimationFrame(frame);
    }, []);

    function apply(id: string, persist = true): void {
        const theme = THEMES.find((t) => t.id === id);
        if (theme === undefined) return;
        const root = document.documentElement;
        for (const [name, value] of Object.entries(paletteVarsFor(theme.palette))) {
            root.style.setProperty(name, value);
        }
        if (persist) {
            try {
                window.localStorage.setItem(STORAGE_KEY, id);
            } catch {
                /* Storage refused. The theme is applied for this page either
                   way; only the memory of it is lost. */
            }
        }
    }

    return (
        <section className={styles.picker} aria-labelledby="theme-heading">
            <h2 className={styles.title} id="theme-heading">
                <PaletteIcon size={18} aria-hidden="true" />
                Brand colours
            </h2>
            <p className={styles.lede}>
                Click one and the whole site changes — this page, every other page, the buttons,
                the badges and the charts. It writes the same variables your deployment would
                ship, so nothing here is preview-only.
            </p>

            <ul className={styles.grid} role="list">
                {THEMES.map((theme) => (
                    <li key={theme.id}>
                        <button
                            type="button"
                            className={styles.swatchCard}
                            aria-pressed={active === theme.id}
                            onClick={() => {
                                apply(theme.id);
                                setActive(theme.id);
                            }}
                        >
                            <span className={styles.swatches} aria-hidden="true">
                                <span style={{ background: theme.palette.brand900 }} />
                                <span style={{ background: theme.palette.brand600 }} />
                                <span style={{ background: theme.palette.brand100 }} />
                                <span style={{ background: theme.palette.accent }} />
                            </span>
                            <span className={styles.swatchName}>
                                {theme.name}
                                {active === theme.id ? (
                                    <Check size={15} aria-hidden="true" />
                                ) : null}
                            </span>
                            <span className={styles.swatchNote}>{theme.note}</span>
                        </button>
                    </li>
                ))}
            </ul>

            <button
                type="button"
                className={styles.reset}
                onClick={() => {
                    const root = document.documentElement;
                    for (const name of Object.keys(paletteVarsFor(THEMES[0]!.palette))) {
                        root.style.removeProperty(name);
                    }
                    try {
                        window.localStorage.removeItem(STORAGE_KEY);
                    } catch {
                        /* nothing to undo */
                    }
                    setActive(null);
                }}
            >
                Reset to this practice&rsquo;s own colours
            </button>
        </section>
    );
}

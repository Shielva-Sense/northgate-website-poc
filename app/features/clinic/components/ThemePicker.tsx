"use client";

import { useEffect, useState } from "react";
import { Check, Palette as PaletteIcon } from "lucide-react";
import { THEMES } from "../brands";
import { applyTheme, clearTheme, readStoredTheme } from "../theme";
import styles from "./ThemePicker.module.scss";
import { localise, tr } from "@/app/core/content-ar";
import { useLocale } from "@/app/features/clinic/LocaleContext";

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
    const { locale } = useLocale();
    const [active, setActive] = useState<string | null>(null);

    /* Restore after mount, never during render: the server has already sent
       the tenant's own palette, and reading storage while rendering would
       produce a hydration mismatch. */
    useEffect(() => {
        const stored = readStoredTheme();
        if (stored === null) return;
        const theme = localise(THEMES, locale).find((t) => t.id === stored);
        if (theme === undefined) return;

        /* The CSS variables can be written straight away — that is the whole
           point of an effect, syncing React to an external system. Marking the
           swatch is React state, so it waits a frame rather than cascading a
           second render out of this one. */
        applyTheme(theme.id, false);
        const frame = window.requestAnimationFrame(() => setActive(theme.id));
        return () => window.cancelAnimationFrame(frame);
        /* Runs once, on mount. The stored theme is read from localStorage and
           applied before the first paint; re-running it when the language
           changes would re-apply a theme the visitor may since have changed by
           hand. `locale` is not read here. */
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <section className={styles.picker} aria-labelledby="theme-heading">
            <h2 className={styles.title} id="theme-heading">
                <PaletteIcon size={18} aria-hidden="true" />{tr("Brand colours", locale)}</h2>
            <p className={styles.lede}>{tr("Click one and the whole site changes — this page, every other page, the buttons, the badges and the charts. It writes the same variables your deployment would ship, so nothing here is preview-only.", locale)}</p>

            <ul className={styles.grid} role="list">
                {localise(THEMES, locale).map((theme) => (
                    <li key={theme.id}>
                        <button
                            type="button"
                            className={styles.swatchCard}
                            aria-pressed={active === theme.id}
                            onClick={() => {
                                applyTheme(theme.id);
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
                    clearTheme();
                    setActive(null);
                }}
            >{tr("Reset to this practice’s own colours", locale)}</button>
        </section>
    );
}

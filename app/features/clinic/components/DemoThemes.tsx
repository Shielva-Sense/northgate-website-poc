"use client";

import { useEffect, useState } from "react";
import { Check, Palette } from "lucide-react";
import { THEMES } from "../brands";
import { applyTheme, clearTheme, readStoredTheme } from "../theme";
import styles from "./DemoBar.module.scss";

/**
 * The colour swatches in the demo bar.
 *
 * Split out of DemoBar so that bar can stay a server component of plain links:
 * switching layout is a navigation and needs no JavaScript, while switching
 * colours is a live DOM change and does. Only this strip is a client bundle.
 */
export function DemoThemes(): React.JSX.Element {
    const [active, setActive] = useState<string | null>(null);

    useEffect(() => {
        const stored = readStoredTheme();
        if (stored === null) return;
        const frame = window.requestAnimationFrame(() => setActive(stored));
        return () => window.cancelAnimationFrame(frame);
    }, []);

    return (
        <div className={styles.themes}>
            <span className={styles.label}>
                <Palette size={14} aria-hidden="true" />
                <span className={styles.labelText}>Colours</span>
            </span>
            <ul className={styles.swatches} role="list">
                {THEMES.map((theme) => (
                    <li key={theme.id}>
                        <button
                            type="button"
                            className={styles.swatch}
                            aria-pressed={active === theme.id}
                            title={`${theme.name} — ${theme.note}`}
                            onClick={() => {
                                applyTheme(theme.id);
                                setActive(theme.id);
                            }}
                        >
                            <span
                                className={styles.swatchInk}
                                style={{
                                    background: `linear-gradient(135deg, ${theme.palette.brand600} 0 60%, ${theme.palette.accent} 60% 100%)`,
                                }}
                                aria-hidden="true"
                            />
                            <span className="visually-hidden">{theme.name}</span>
                            {active === theme.id ? (
                                <Check className={styles.swatchTick} size={11} aria-hidden="true" />
                            ) : null}
                        </button>
                    </li>
                ))}
            </ul>
            {active === null ? null : (
                <button
                    type="button"
                    className={styles.resetTheme}
                    onClick={() => {
                        clearTheme();
                        setActive(null);
                    }}
                >
                    Reset
                </button>
            )}
        </div>
    );
}

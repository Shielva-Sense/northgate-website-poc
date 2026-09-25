/**
 * Applying and remembering a chosen brand palette.
 *
 * Three places need this now — the big picker on /templates, the compact menu
 * in the header, and the restore that runs on every page — so the writing of
 * the variables and the storage key live here rather than being copied into
 * each of them. A second copy of the key is how one of them ends up reading
 * a theme nothing ever writes.
 */

import { paletteVarsFor, THEMES } from "./brands";

const STORAGE_KEY = "northgate:theme";

/** Every access is guarded: private windows and blocked site data throw. */
export function readStoredTheme(): string | null {
    try {
        return window.localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
}

export function applyTheme(id: string, persist = true): boolean {
    const theme = THEMES.find((t) => t.id === id);
    if (theme === undefined) return false;

    const root = document.documentElement;
    for (const [name, value] of Object.entries(paletteVarsFor(theme.palette))) {
        root.style.setProperty(name, value);
    }
    if (persist) {
        try {
            window.localStorage.setItem(STORAGE_KEY, id);
        } catch {
            /* Applied for this page either way; only the memory is lost. */
        }
    }
    return true;
}

/** Back to whatever the server sent for this tenant. */
export function clearTheme(): void {
    const root = document.documentElement;
    const first = THEMES[0];
    if (first !== undefined) {
        for (const name of Object.keys(paletteVarsFor(first.palette))) {
            root.style.removeProperty(name);
        }
    }
    try {
        window.localStorage.removeItem(STORAGE_KEY);
    } catch {
        /* nothing to undo */
    }
}

"use client";

/**
 * The draft, kept in the browser.
 *
 * A prospect rates the home page, wanders off to /services, rates that, then
 * answers half the discovery questions. Losing any of that on navigation would
 * make the panel worse than a form, so it is written on every change and read
 * back on mount.
 *
 * localStorage, not a cookie: none of this is sent with requests, and it should
 * never end up in a log. Every access is guarded — a private window or blocked
 * site data throws on read, and the panel has to keep working.
 */

const KEY = "northgate:feedback";

export interface PageRating {
    readonly path: string;
    readonly rating: number;
    readonly note: string;
}

export interface Draft {
    readonly answers: Readonly<Record<string, string | readonly string[]>>;
    readonly ratings: Readonly<Record<string, PageRating>>;
    readonly name: string;
    readonly email: string;
    readonly phone: string;
    readonly practice: string;
}

export const EMPTY_DRAFT: Draft = {
    answers: {},
    ratings: {},
    name: "",
    email: "",
    phone: "",
    practice: "",
};

export function loadDraft(): Draft {
    try {
        const raw = window.localStorage.getItem(KEY);
        if (raw === null) return EMPTY_DRAFT;
        const parsed: unknown = JSON.parse(raw);
        if (typeof parsed !== "object" || parsed === null) return EMPTY_DRAFT;
        // Spread over the empty draft so a shape written by an older build
        // cannot leave a field undefined that the panel assumes is there.
        return { ...EMPTY_DRAFT, ...(parsed as Partial<Draft>) };
    } catch {
        return EMPTY_DRAFT;
    }
}

export function saveDraft(draft: Draft): void {
    try {
        window.localStorage.setItem(KEY, JSON.stringify(draft));
    } catch {
        /* Storage refused. The panel still works for this session. */
    }
}

export function clearDraft(): void {
    try {
        window.localStorage.removeItem(KEY);
    } catch {
        /* nothing to undo */
    }
}

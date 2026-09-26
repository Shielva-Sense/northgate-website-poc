import type { Locale } from "./locale";
import { AR } from "./content-ar-table";

/**
 * The Arabic of the content, as opposed to the Arabic of the chrome.
 *
 * `strings.ts` covers the fixed words of the interface — buttons, navigation,
 * form labels — and is keyed, because those are written once and referenced by
 * name. This file covers the other half: the departments, treatments,
 * appointment types, article titles, opening lines and FAQ answers that the
 * trade tables generate. Those are data, not keys. There are eight hundred of
 * them across ten trades, they are written in English in `content.ts` because
 * that is where a practice's offer is defined, and keying every one of them
 * would mean a parallel structure that drifts the first time a trade changes.
 *
 * So this is a phrase table: the English sentence is the key. That has two
 * properties worth having. A phrase that has not been translated renders in
 * English rather than as a missing-key placeholder or a crash — a demo with
 * one English line is worth more than a demo with a blank one. And a phrase
 * used by three trades is translated once, which is why the table is smaller
 * than the sum of the trade tables.
 *
 * Everything is normalised on whitespace before lookup, so a sentence that is
 * wrapped differently in the source still matches.
 */

function normalise(text: string): string {
    return text.replace(/\s+/g, " ").trim();
}

/** One phrase in the reader's language. English is returned unchanged. */
export function tr(text: string, locale: Locale): string {
    if (locale === "en") return text;
    const hit = AR[normalise(text)];
    return hit ?? text;
}

/** Keys that hold identifiers or asset paths rather than prose. */
const NOT_PROSE = /^(id|slug|department|image|imageAlt|icon|href|key|to|palette|kind|tone|colou?r)$/;

/**
 * The same object with every readable string in the reader's language.
 *
 * A deep map rather than a field-by-field rewrite: the content object gains a
 * field most weeks, and a translator that has to be edited each time one is
 * added is a translator that will silently miss it. The skip-list is the
 * inverse — it names the handful of keys that must not be touched, because an
 * id put through a phrase table would break every filter that matches on it.
 *
 * `imageAlt` is deliberately skipped rather than translated: alt text is part
 * of the media set and is corrected with the photograph, not with the copy.
 */
export function localise<T>(value: T, locale: Locale): T {
    if (locale === "en") return value;
    return walk(value) as T;
}

function walk(value: unknown): unknown {
    if (typeof value === "string") return tr(value, "ar");
    if (Array.isArray(value)) return value.map(walk);
    if (value === null || typeof value !== "object") return value;
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        out[key] = NOT_PROSE.test(key) ? item : walk(item);
    }
    return out;
}

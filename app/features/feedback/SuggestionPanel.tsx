"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Check, MessageSquarePlus, Send, Star, X } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Field, Input, Textarea } from "@/app/components/ui/Field";
import { readStoredTheme } from "@/app/features/clinic/theme";
import { groupsFor, RATING_LABELS } from "./questions";
import { useProfile } from "@/app/features/clinic/BrandContext";
import { clearDraft, EMPTY_DRAFT, loadDraft, saveDraft } from "./storage";
import type { Draft } from "./storage";
import { createPortal } from "react-dom";
import styles from "./SuggestionPanel.module.scss";

/**
 * The feedback and discovery panel.
 *
 * It exists because the most useful moment to ask a prospect what they want is
 * while they are looking at it. Every answer is captured alongside the layout
 * and palette they were actually viewing, so "make the buttons calmer" arrives
 * attached to the page and theme it was said about rather than as a line in an
 * email three days later.
 *
 * Answers persist in the browser, because the natural way to use this is to
 * rate a page, wander to another, and come back.
 */
export function SuggestionPanel({
    open,
    onClose,
    template,
}: {
    readonly open: boolean;
    readonly onClose: () => void;
    readonly template: string;
}): React.JSX.Element | null {
    const path = usePathname();
    /* The panel asks the prospect what they want; asking a vet whether they
       need "Find a doctor" answers the question badly before they start. */
    const profile = useProfile();
    const groups = useMemo(() => groupsFor(profile), [profile]);
    const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
    /* Until the stored draft has been read, persisting would write the empty
       one over it. */
    const [loaded, setLoaded] = useState(false);
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState<{ reference: string; delivered: boolean } | null>(null);
    const [failed, setFailed] = useState("");

    const panelRef = useRef<HTMLDivElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    /* Focus has to go back where it came from on close, or a keyboard user is
       dropped at the top of the document. */
    const returnTo = useRef<Element | null>(null);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            setDraft(loadDraft());
            setLoaded(true);
        });
        return () => window.cancelAnimationFrame(frame);
    }, []);

    /* Persisting in an effect rather than inside the updater: writing to
       storage from a state updater is a side effect in a function React may
       call more than once. */
    useEffect(() => {
        if (loaded) saveDraft(draft);
    }, [draft, loaded]);

    useEffect(() => {
        if (!open) return;
        returnTo.current = document.activeElement;
        closeRef.current?.focus();

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const onKey = (event: KeyboardEvent): void => {
            if (event.key === "Escape") {
                onClose();
                return;
            }
            if (event.key !== "Tab") return;

            // Focus trap: a dialog that lets Tab wander into the page behind it
            // is a dialog a screen-reader user cannot get out of predictably.
            const panel = panelRef.current;
            if (panel === null) return;
            const focusable = panel.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
            );
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (first === undefined || last === undefined) return;

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = previousOverflow;
            if (returnTo.current instanceof HTMLElement) returnTo.current.focus();
        };
    }, [open, onClose]);

    /**
     * Functional, never `update({...draft, x})`.
     *
     * Two chips clicked in the same tick both read the `draft` captured by
     * their own render, so the second overwrote the first and the answer was
     * silently lost. Only fast clicking triggered it, which is exactly the
     * kind of bug that survives a manual test and not a real user.
     */
    function update(fn: (prev: Draft) => Draft): void {
        setDraft(fn);
    }

    const pageRating = draft.ratings[path];
    const answeredCount = useMemo(
        () => Object.keys(draft.answers).length + Object.keys(draft.ratings).length,
        [draft],
    );

    function setAnswer(id: string, value: string | readonly string[]): void {
        update((prev) => ({ ...prev, answers: { ...prev.answers, [id]: value } }));
    }

    function toggleMulti(id: string, option: string): void {
        update((prev) => {
            const current = prev.answers[id];
            const list = Array.isArray(current) ? [...current] : [];
            const index = list.indexOf(option);
            if (index === -1) list.push(option);
            else list.splice(index, 1);
            return { ...prev, answers: { ...prev.answers, [id]: list } };
        });
    }

    async function submit(): Promise<void> {
        setSending(true);
        setFailed("");
        try {
            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: draft.name,
                    practice: draft.practice,
                    email: draft.email,
                    phone: draft.phone,
                    template,
                    theme: readStoredTheme() ?? "default",
                    ratings: draft.ratings,
                    answers: draft.answers,
                }),
            });
            const body: unknown = await response.json().catch(() => ({}));
            if (!response.ok) {
                const message =
                    typeof body === "object" && body !== null && "error" in body
                        ? String((body as { error: unknown }).error)
                        : "We could not send that.";
                setFailed(message);
                return;
            }
            const data = body as { reference?: string; delivered?: boolean };
            setSent({ reference: data.reference ?? "—", delivered: data.delivered === true });
            clearDraft();
        } catch {
            setFailed("We could not reach the server. Your answers are still saved here.");
        } finally {
            setSending(false);
        }
    }

    if (!open) return null;

    /* Portalled to the body, not rendered where it is written.
     *
     * The trigger lives in the demo bar, and .bar sets position: relative with
     * z-index on it — which creates a stacking context. A fixed-position child
     * of that context is trapped inside it however high its own z-index goes,
     * so the panel competed at the demo bar's level and the site header, which
     * shares that level and comes later in the DOM, painted straight over it:
     * the nav, the phone number and the Book button all drew on top of an
     * open drawer.
     *
     * document.body has no stacking context above it, so the panel is layered
     * against the page rather than against the strip it was declared in.
     * Rendering only after mount because document does not exist on the
     * server, and the panel returns null when closed anyway.
     */
    return createPortal(
        <>
            <div className={styles.scrim} onClick={onClose} aria-hidden="true" />
            <aside
                className={styles.panel}
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="suggest-title"
            >
                <header className={styles.head}>
                    <div>
                        <p className={styles.kicker}>Tell us what you think</p>
                        <h2 className={styles.title} id="suggest-title">
                            Shape your site
                        </h2>
                    </div>
                    <button
                        type="button"
                        className={styles.close}
                        onClick={onClose}
                        ref={closeRef}
                        aria-label="Close the suggestions panel"
                    >
                        <X size={18} aria-hidden="true" />
                    </button>
                </header>

                <div className={styles.body}>
                    {sent !== null ? (
                        <div className={styles.done}>
                            <span className={styles.doneIcon} aria-hidden="true">
                                <Check size={26} />
                            </span>
                            <h3 className={styles.doneTitle}>Thank you — that is genuinely useful</h3>
                            <p className={styles.doneBody}>
                                Reference <b>{sent.reference}</b>. We will come back with a plan
                                and a price based on exactly what you have said here, not a
                                template quote.
                            </p>
                            {sent.delivered ? null : (
                                <p className={styles.warn} role="alert">
                                    This demo is not connected to a live inbox, so nobody has
                                    actually been notified yet. On the real deployment this
                                    reaches us immediately.
                                </p>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Rating the page you are on, not "the site" — a
                                general score tells us nothing actionable. */}
                            <section className={styles.block}>
                                <h3 className={styles.blockTitle}>This page</h3>
                                <p className={styles.blockBlurb}>
                                    <code className={styles.path}>{path}</code>
                                </p>
                                <div
                                    className={styles.stars}
                                    role="group"
                                    aria-label="Rate this page"
                                >
                                    {RATING_LABELS.map((label, index) => {
                                        const value = index + 1;
                                        const active = (pageRating?.rating ?? 0) >= value;
                                        return (
                                            <button
                                                key={label}
                                                type="button"
                                                className={styles.star}
                                                aria-pressed={pageRating?.rating === value}
                                                aria-label={`${value} of 5 — ${label}`}
                                                onClick={() =>
                                                    update((prev) => ({
                                                        ...prev,
                                                        ratings: {
                                                            ...prev.ratings,
                                                            [path]: {
                                                                path,
                                                                rating: value,
                                                                note: prev.ratings[path]?.note ?? "",
                                                            },
                                                        },
                                                    }))
                                                }
                                            >
                                                <Star
                                                    size={22}
                                                    aria-hidden="true"
                                                    className={active ? styles.starOn : undefined}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                                {pageRating === undefined ? null : (
                                    <p className={styles.starLabel}>
                                        {RATING_LABELS[pageRating.rating - 1]}
                                    </p>
                                )}

                                <Field label="What would you change on this page?">
                                    {(id, describedBy) => (
                                        <Textarea
                                            id={id}
                                            rows={3}
                                            aria-describedby={describedBy}
                                            value={pageRating?.note ?? ""}
                                            placeholder="Be blunt — it is more useful than being kind."
                                            onChange={(event) =>
                                                update((prev) => ({
                                                    ...prev,
                                                    ratings: {
                                                        ...prev.ratings,
                                                        [path]: {
                                                            path,
                                                            rating: prev.ratings[path]?.rating ?? 0,
                                                            note: event.target.value,
                                                        },
                                                    },
                                                }))
                                            }
                                        />
                                    )}
                                </Field>

                                {Object.keys(draft.ratings).length > 1 ? (
                                    <p className={styles.rated}>
                                        You have rated {Object.keys(draft.ratings).length} pages.
                                        They all send together.
                                    </p>
                                ) : null}
                            </section>

                            {groups.map((group) => (
                                <section className={styles.block} key={group.id}>
                                    <h3 className={styles.blockTitle}>{group.title}</h3>
                                    <p className={styles.blockBlurb}>{group.blurb}</p>

                                    {group.questions.map((question) => {
                                        const value = draft.answers[question.id];
                                        return (
                                            <div className={styles.q} key={question.id}>
                                                {question.kind === "text" ? (
                                                    <Field
                                                        label={question.label}
                                                        help={question.why}
                                                    >
                                                        {(id, describedBy) => (
                                                            <Textarea
                                                                id={id}
                                                                rows={2}
                                                                aria-describedby={describedBy}
                                                                placeholder={question.placeholder}
                                                                value={
                                                                    typeof value === "string"
                                                                        ? value
                                                                        : ""
                                                                }
                                                                onChange={(event) =>
                                                                    setAnswer(
                                                                        question.id,
                                                                        event.target.value,
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </Field>
                                                ) : (
                                                    <fieldset className={styles.fieldset}>
                                                        <legend className={styles.legend}>
                                                            {question.label}
                                                        </legend>
                                                        {question.why === undefined ? null : (
                                                            <p className={styles.why}>
                                                                {question.why}
                                                            </p>
                                                        )}
                                                        <div className={styles.options}>
                                                            {(question.options ?? []).map(
                                                                (option) => {
                                                                    const on =
                                                                        question.kind === "multi"
                                                                            ? Array.isArray(value) &&
                                                                              value.includes(option)
                                                                            : value === option;
                                                                    return (
                                                                        <button
                                                                            key={option}
                                                                            type="button"
                                                                            className={styles.chip}
                                                                            aria-pressed={on}
                                                                            onClick={() =>
                                                                                question.kind ===
                                                                                "multi"
                                                                                    ? toggleMulti(
                                                                                          question.id,
                                                                                          option,
                                                                                      )
                                                                                    : setAnswer(
                                                                                          question.id,
                                                                                          on
                                                                                              ? ""
                                                                                              : option,
                                                                                      )
                                                                            }
                                                                        >
                                                                            {option}
                                                                        </button>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    </fieldset>
                                                )}
                                            </div>
                                        );
                                    })}
                                </section>
                            ))}

                            <section className={styles.block}>
                                <h3 className={styles.blockTitle}>Where to send the plan</h3>
                                <p className={styles.blockBlurb}>
                                    Only one of these is needed. Nothing else on this panel is
                                    required.
                                </p>
                                <Field label="Your name">
                                    {(id) => (
                                        <Input
                                            id={id}
                                            value={draft.name}
                                            autoComplete="name"
                                            onChange={(e) =>
                                                update((prev) => ({ ...prev, name: e.target.value }))
                                            }
                                        />
                                    )}
                                </Field>
                                <Field label="Practice or clinic">
                                    {(id) => (
                                        <Input
                                            id={id}
                                            value={draft.practice}
                                            autoComplete="organization"
                                            onChange={(e) =>
                                                update((prev) => ({ ...prev, practice: e.target.value }))
                                            }
                                        />
                                    )}
                                </Field>
                                <Field label="Email">
                                    {(id) => (
                                        <Input
                                            id={id}
                                            type="email"
                                            value={draft.email}
                                            autoComplete="email"
                                            onChange={(e) =>
                                                update((prev) => ({ ...prev, email: e.target.value }))
                                            }
                                        />
                                    )}
                                </Field>
                                <Field label="Phone or WhatsApp">
                                    {(id) => (
                                        <Input
                                            id={id}
                                            type="tel"
                                            value={draft.phone}
                                            autoComplete="tel"
                                            onChange={(e) =>
                                                update((prev) => ({ ...prev, phone: e.target.value }))
                                            }
                                        />
                                    )}
                                </Field>

                                {failed === "" ? null : (
                                    <p className={styles.warn} role="alert">
                                        {failed}
                                    </p>
                                )}
                            </section>
                        </>
                    )}
                </div>

                {sent === null ? (
                    <footer className={styles.foot}>
                        <p className={styles.footCount}>
                            {answeredCount === 0
                                ? "Nothing answered yet"
                                : `${answeredCount} answered · saved as you go`}
                        </p>
                        <Button
                            disabled={sending}
                            onClick={() => {
                                void submit();
                            }}
                            rightIcon={<Send size={15} aria-hidden="true" />}
                        >
                            {sending ? "Sending…" : "Send to Shielva"}
                        </Button>
                    </footer>
                ) : null}
            </aside>
        </>,
        document.body,
    );
}

/** The trigger. Lives in the demo bar, so it is on every page. */
export function SuggestionTrigger({
    template,
}: {
    readonly template: string;
}): React.JSX.Element {
    const [open, setOpen] = useState(false);
    return (
        <>
            <button
                type="button"
                className={styles.trigger}
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
            >
                <MessageSquarePlus size={14} aria-hidden="true" />
                Suggest
            </button>
            <SuggestionPanel open={open} onClose={() => setOpen(false)} template={template} />
        </>
    );
}

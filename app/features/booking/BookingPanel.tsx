"use client";

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useBrand } from "@/app/features/clinic/BrandContext";
import { BookingForm } from "./BookingForm";
import styles from "./BookingPanel.module.scss";

/**
 * Booking, from anywhere on the site.
 *
 * Every "Book" control used to be a link to `#book`, and the only page with
 * an element of that id was the home page. From /contact, /appointments,
 * /find-a-doctor or any page a client was given, pressing Book did nothing at
 * all — no navigation, no error, nothing. It is the worst possible failure for
 * the one button the whole site exists to get pressed.
 *
 * So booking is a panel rather than a place. It opens over whatever page the
 * patient is on, keeps their context, and cannot be broken by a missing
 * anchor. The home page keeps its own booking section — someone who has
 * scrolled that far should not need to open anything.
 */

interface BookingApi {
    readonly open: () => void;
    readonly close: () => void;
    readonly isOpen: boolean;
}

const BookingCtx = createContext<BookingApi | null>(null);

export function useBooking(): BookingApi {
    const api = useContext(BookingCtx);
    if (api === null) {
        throw new Error("useBooking must be used inside <BookingProvider>");
    }
    return api;
}

export function BookingProvider({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
    const [isOpen, setOpen] = useState(false);
    const open = useCallback(() => setOpen(true), []);
    const close = useCallback(() => setOpen(false), []);
    const api = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

    return (
        <BookingCtx.Provider value={api}>
            {children}
            <BookingPanel />
        </BookingCtx.Provider>
    );
}

function BookingPanel(): React.JSX.Element | null {
    const { isOpen, close } = useBooking();
    const brand = useBrand();
    const titleId = useId();
    const panel = useRef<HTMLDivElement>(null);
    /* Whatever had focus before the panel opened, so it can be given back.
       Returning focus to the body would drop a keyboard user at the top of
       the document, having lost the button they just pressed. */
    const opener = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!isOpen) return undefined;

        opener.current = document.activeElement as HTMLElement | null;
        const { overflow } = document.body.style;
        document.body.style.overflow = "hidden";

        const focusables = (): HTMLElement[] =>
            Array.from(
                panel.current?.querySelectorAll<HTMLElement>(
                    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
                ) ?? [],
            ).filter((el) => el.offsetParent !== null);

        focusables()[0]?.focus();

        const onKey = (event: KeyboardEvent): void => {
            if (event.key === "Escape") {
                event.preventDefault();
                close();
                return;
            }
            if (event.key !== "Tab") return;
            // Keep Tab inside the panel; a dialog that leaks focus to the page
            // behind it is a dialog a screen-reader user cannot get out of.
            const items = focusables();
            if (items.length === 0) return;
            const first = items[0] as HTMLElement;
            const last = items[items.length - 1] as HTMLElement;
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
            document.body.style.overflow = overflow;
            opener.current?.focus();
        };
    }, [isOpen, close]);

    if (!isOpen) return null;

    return (
        <div className={styles.shell}>
            {/* Clicking away closes, which is what everyone expects of a
                drawer. It is a div rather than a button because it wraps the
                whole viewport; Escape is the keyboard route and is handled
                above, so nothing here is keyboard-only. */}
            <div className={styles.scrim} onClick={close} aria-hidden="true" />

            <div
                className={styles.panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                ref={panel}
            >
                <header className={styles.head}>
                    <div>
                        <p className={styles.kicker}>Book</p>
                        <h2 className={styles.title} id={titleId}>
                            Request an appointment
                        </h2>
                    </div>
                    <button className={styles.close} type="button" onClick={close} aria-label="Close booking">
                        <X size={18} aria-hidden="true" />
                    </button>
                </header>

                <p className={styles.lede}>
                    It takes about a minute. You will get a confirmation with a time, not a
                    promise to call you back at some point.
                </p>

                <div className={styles.body}>
                    <BookingForm />
                </div>

                <footer className={styles.foot}>
                    <span>Rather talk to someone?</span>
                    <a href={brand.phoneHref}>{brand.phone}</a>
                </footer>
            </div>
        </div>
    );
}

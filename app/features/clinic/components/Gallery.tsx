"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useReveal } from "@/app/core/hooks/useReveal";
import { facilitiesFor } from "../content";
import { useProfile } from "../BrandContext";
import styles from "./Gallery.module.scss";
import { localise, tr } from "@/app/core/content-ar";
import { useLocale } from "@/app/features/clinic/LocaleContext";

/**
 * The facilities gallery.
 *
 * A native <dialog> does the modal work: focus trap, Escape to close, inert
 * background and focus restoration are all built in, so there is no hand-rolled
 * key handling to get wrong. Only arrow-key paging is added on top.
 */
export function Gallery(): React.JSX.Element {
    const { locale } = useLocale();
    /* This practice's own rooms. The shared set is a human clinic, down to
       the fig tree in the waiting room. */
    const facilities = localise(facilitiesFor(useProfile().kind), locale);
    const ref = useReveal<HTMLDivElement>();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [open, setOpen] = useState<number | null>(null);

    const show = useCallback((index: number): void => {
        setOpen(index);
        dialogRef.current?.showModal();
    }, []);

    /* The length is a real dependency now that the gallery is per-trade: a
       practice with four rooms and one with six wrap at different points,
       and an empty dependency list would keep whichever was first seen. */
    const step = useCallback(
        (delta: number): void => {
            setOpen((current) =>
                current === null
                    ? current
                    : (current + delta + facilities.length) % facilities.length,
            );
        },
        [facilities.length],
    );

    useEffect(() => {
        if (open === null) return;
        const onKey = (event: KeyboardEvent): void => {
            if (event.key === "ArrowRight") step(1);
            if (event.key === "ArrowLeft") step(-1);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, step]);

    const active = open === null ? undefined : facilities[open];

    return (
        <section className={styles.section} id="facilities">
            <div className="wrap" ref={ref}>
                <div className={styles.head} data-reveal="">
                    <p className={styles.kicker}>{tr("Have a look round", locale)}</p>
                    <h2 className={styles.title}>{tr("The place itself, not a stock photo", locale)}</h2>
                    <p className={styles.lede}>{tr("You can see every room before you arrive. Select any photo to open it larger.", locale)}</p>
                </div>

                <ul className={styles.grid} role="list">
                    {facilities.map((facility, index) => (
                        <li
                            key={facility.src}
                            className={styles.tile}
                            data-reveal=""
                            style={{ "--reveal-delay": `${index * 60}ms` } as React.CSSProperties}
                        >
                            <button
                                type="button"
                                className={styles.tileBtn}
                                onClick={() => show(index)}
                            >
                                <Image
                                    data-reveal=""
                                    data-reveal-style="wipe"
                                    src={facility.src}
                                    alt={facility.alt}
                                    width={1536}
                                    height={864}
                                    sizes="(min-width: 980px) 33vw, (min-width: 720px) 50vw, 100vw"
                                    className={styles.img}
                                />
                                <span className={styles.expand} aria-hidden="true">
                                    <Expand size={15} />
                                </span>
                                <span className={styles.caption}>
                                    <span className={styles.capTitle}>{facility.title}</span>
                                    <span className={styles.capHint}>{tr("View larger", locale)}</span>
                                </span>
                            </button>
                            <ul className={styles.points} role="list">
                                {facility.points.map((point) => (
                                    <li key={point}>{point}</li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            </div>

            <dialog
                ref={dialogRef}
                className={styles.dialog}
                aria-label={tr("Facility photo", locale)}
                onClose={() => setOpen(null)}
            >
                {active ? (
                    <div className={styles.viewer}>
                        <Image
                            src={active.src}
                            alt={active.alt}
                            width={1536}
                            height={864}
                            sizes="(min-width: 1100px) 1000px, 94vw"
                            className={styles.viewerImg}
                        />
                        <div className={styles.viewerBar}>
                            <p className={styles.viewerTitle}>{active.title}</p>
                            <div className={styles.viewerNav}>
                                <button
                                    type="button"
                                    className={styles.round}
                                    onClick={() => step(-1)}
                                    aria-label={tr("Previous photo", locale)}
                                >
                                    <ChevronLeft size={18} aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    className={styles.round}
                                    onClick={() => step(1)}
                                    aria-label={tr("Next photo", locale)}
                                >
                                    <ChevronRight size={18} aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    className={styles.round}
                                    onClick={() => dialogRef.current?.close()}
                                    aria-label={tr("Close", locale)}
                                >
                                    <X size={18} aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </dialog>
        </section>
    );
}

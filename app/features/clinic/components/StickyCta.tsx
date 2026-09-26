"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { useBooking } from "@/app/features/booking/BookingPanel";

import { useBrand } from "../BrandContext";
import styles from "./StickyCta.module.scss";

/**
 * Small-screen booking bar.
 *
 * Hidden until the hero has scrolled away, so it never covers the form it is
 * pointing at, and hidden again over the booking section for the same reason.
 */
export function StickyCta(): React.JSX.Element | null {
    const brand = useBrand();
    const booking = useBooking();
    const [show, setShow] = useState(false);

    useEffect(() => {
        let frame = 0;

        const update = (): void => {
            frame = 0;
            const past = window.scrollY > window.innerHeight * 0.9;
            const book = document.getElementById("book");
            const atForm =
                book !== null && book.getBoundingClientRect().top < window.innerHeight * 0.85;
            setShow(past && !atForm);
        };

        const schedule = (): void => {
            if (frame !== 0) return;
            frame = window.requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule, { passive: true });

        return () => {
            if (frame !== 0) window.cancelAnimationFrame(frame);
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
        };
    }, []);

    if (!show) return null;

    return (
        <aside className={styles.bar} aria-label="Book an appointment">
            <p className={styles.text}>
                <b>Seen this week</b>
                <span>{brand.ratingCount} reviews, rated {brand.rating}</span>
            </p>
            <div className={styles.actions}>
                <a className={styles.tel} href={brand.phoneHref} aria-label="Call the practice">
                    <Phone size={16} aria-hidden="true" />
                </a>
                <Button onClick={booking.open}>Book</Button>
            </div>
        </aside>
    );
}

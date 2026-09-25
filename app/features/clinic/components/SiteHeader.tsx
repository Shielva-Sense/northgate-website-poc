"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Phone, Siren, X } from "lucide-react";
import { LinkButton } from "@/app/components/ui/LinkButton";
import { Logo } from "@/app/components/ui/Logo";

import { useBrand } from "../BrandContext";
import styles from "./SiteHeader.module.scss";

/* Absolute, not bare hashes: these have to work from /privacy and /services/*
   as well as from the home page. */
/* Five, not seven. Cramming the gap to make more fit was the wrong trade —
   Contact lives on /appointments and in the footer, and "Doctors" is the team
   section that /find-a-doctor already leads to. */
const LINKS = [
    { href: "/services", label: "Services" },
    { href: "/find-a-doctor", label: "Find a doctor" },
    { href: "/health-library", label: "Health library" },
    { href: "/appointments", label: "Appointments" },
    { href: "/contact", label: "Contact" },
] as const;

export function SiteHeader(): React.JSX.Element {
    const brand = useBrand();
    const [open, setOpen] = useState(false);

    return (
        <header className={styles.head}>
            <div className={`wrap ${styles.bar}`}>
                {/* "/" not "#top": a bare hash goes nowhere from /services or
                    /urgent-care, so the brand looked dead on every inner page.
                    The home page still scrolls to the top from here. */}
                <Link href="/" className={styles.logo}>
                    <Logo size={38} />
                    <span>
                        Northgate
                        <small>Family Health</small>
                    </span>
                </Link>

                <nav className={`${styles.nav} ${styles.links}`} aria-label="Main">
                    {LINKS.map((link) => (
                        <a key={link.href} href={link.href} className={styles.navLink}>
                            {link.label}
                        </a>
                    ))}
                    {/* Deliberately outside LINKS: it is not a peer of "Services",
                        and someone who needs it is scanning for red, not reading
                        a nav. Kept at five links so the bar stays uncramped. */}
                    <Link className={styles.urgent} href="/urgent-care">
                        <Siren size={15} aria-hidden="true" />
                        Urgent care
                    </Link>
                    <a className={styles.tel} href={brand.phoneHref}>
                        <Phone size={15} aria-hidden="true" />
                        {brand.phone}
                    </a>
                    <LinkButton href="#book">Book</LinkButton>
                </nav>

                <button
                    type="button"
                    className={styles.toggle}
                    aria-expanded={open}
                    aria-controls="mobile-nav"
                    aria-label={open ? "Close menu" : "Open menu"}
                    onClick={() => setOpen((value) => !value)}
                >
                    {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
                </button>
            </div>

            {open ? (
                <div className="wrap">
                    <nav className={styles.panel} id="mobile-nav" aria-label="Main">
                        {LINKS.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className={styles.navLink}
                                onClick={() => setOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                        <Link
                            className={styles.urgent}
                            href="/urgent-care"
                            onClick={() => setOpen(false)}
                        >
                            <Siren size={15} aria-hidden="true" />
                            Urgent care
                        </Link>
                        <a className={styles.tel} href={brand.phoneHref}>
                            <Phone size={15} aria-hidden="true" />
                            {brand.phone}
                        </a>
                        <LinkButton href="#book">Book an appointment</LinkButton>
                    </nav>
                </div>
            ) : null}
        </header>
    );
}

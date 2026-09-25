"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { LinkButton } from "@/app/components/ui/LinkButton";
import { Logo } from "@/app/components/ui/Logo";

import { useBrand } from "../BrandContext";
import styles from "./SiteHeader.module.scss";

/* Absolute, not bare hashes: these have to work from /privacy and /services/*
   as well as from the home page. */
const LINKS = [
    { href: "/#team", label: "Doctors" },
    { href: "/find-a-doctor", label: "Not sure who to see?" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#facilities", label: "The practice" },
    { href: "/#faq", label: "Questions" },
] as const;

export function SiteHeader(): React.JSX.Element {
    const brand = useBrand();
    const [open, setOpen] = useState(false);

    return (
        <header className={styles.head}>
            <div className={`wrap ${styles.bar}`}>
                <Link href="#top" className={styles.logo}>
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

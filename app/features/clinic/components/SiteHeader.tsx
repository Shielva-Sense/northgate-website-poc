"use client";

import { useState } from "react";
import { LocaleLink as Link } from "@/app/components/ui/LocaleLink";
import { Menu, Phone, Siren, X } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { useBooking } from "@/app/features/booking/BookingPanel";
import { Logo } from "@/app/components/ui/Logo";
import { ThemeMenu } from "./ThemeMenu";
import { LanguageToggle } from "./LanguageToggle";

import { useBrand, useProfile } from "../BrandContext";
import type { KindProfile } from "../practice-kinds";
import { useLocale } from "../LocaleContext";
import type { UiKey } from "@/app/core/strings";
import type { Locale } from "@/app/core/locale";
import type { Brand } from "../brands";
import { ordersPriceList } from "../price-list";
import styles from "./SiteHeader.module.scss";
import { tr } from "@/app/core/content-ar";

/* Absolute, not bare hashes: these have to work from /privacy and /services/*
   as well as from the home page. */
/* Five, not seven. Cramming the gap to make more fit was the wrong trade —
   Contact lives on /appointments and in the footer, and "Doctors" is the team
   section that /find-a-doctor already leads to. */
/* Built from the practice's own trade. "Find a doctor" and "Health library"
   were printed on every site, including veterinary ones, and the navigation
   is the first thing anybody reads. A practice with no health library does
   not get a link to an empty one. */
/** `/services` under the language being read. */
function withLocale(locale: Locale, href: string): string {
    return `/${locale}${href === "/" ? "" : href}`;
}

function linksFor(
    profile: KindProfile,
    brand: Brand,
    t: (key: UiKey) => string,
    locale: Locale,
): readonly { href: string; label: string }[] {
    /* Ten trades, ten labels, in whichever language the page is read in. A
       dentist says "find a dentist" and a podiatrist "find a podiatrist";
       branching on veterinary alone put "find a doctor" on a dental practice
       in both languages, which is the first thing a dentist notices. */
    /* The hrefs are prefixed with the language here, in the one place they are
       built. They used to be bare, which sent an Arabic reader to /en on their
       first click — the one click that matters. The nav used to render plain
       <a> elements too, which meant every click was a full browser page load:
       the whole document tore down and rebuilt, the top bars flashed, and a
       site that is a single-page app behaved like it was not one. They are
       <Link> now, so a click swaps the content and leaves the chrome alone. */
    const prefix = (href: string): string => withLocale(locale, href);
    const ar = locale === "ar";
    const findLabel = ar ? profile.findLabelAr : profile.findLabel;
    const libraryLabel = ar ? profile.libraryLabelAr : profile.libraryLabel;
    return [
        { href: prefix("/services"), label: t("services") },
        /* The CMA Order wants the price list one click from the home page, so
           it is a nav link rather than a footer link — and only where the
           Order actually applies, since a dentist publishing a weight-banded
           veterinary table would be answering an obligation it does not have.
           The health library gives way to it: six links crowd the bar, and a
           practice under an order to publish prices should show prices. */
        ...(ordersPriceList(profile, brand) ? [{ href: prefix("/prices"), label: t("prices") }] : []),
        { href: prefix("/find-a-doctor"), label: findLabel },
        ...(profile.hasHealthLibrary && !ordersPriceList(profile, brand)
            ? [{ href: prefix("/health-library"), label: libraryLabel }]
            : []),
        { href: prefix("/appointments"), label: t("appointments") },
        { href: prefix("/contact"), label: t("contact") },
    ];
}

/**
 * Read from the profile, not passed in.
 *
 * This was a prop defaulting to true, and two of the three call sites — the
 * home page and a service page — never passed it. A practice with
 * hasEmergency false therefore still advertised "Urgent care" in the nav on
 * the one page every visitor lands on, and the flag looked like it worked
 * only because the inner pages go through PageShell, which did pass it. The
 * profile is already in context here, so there is nothing left to forget.
 */
export function SiteHeader(): React.JSX.Element {
    const brand = useBrand();
    const booking = useBooking();
    const profile = useProfile();
    const hasEmergency = profile.hasEmergency;
    const { t, locale } = useLocale();
    const links = linksFor(profile, brand, t, locale);
    const [open, setOpen] = useState(false);

    return (
        <header className={styles.head}>
            <div className={`wrap ${styles.bar}`}>
                {/* "/" not "#top": a bare hash goes nowhere from /services or
                    /urgent-care, so the brand looked dead on every inner page.
                    The home page still scrolls to the top from here. */}
                <Link href={withLocale(locale, "/")} className={styles.logo}>
                    <Logo size={38} mark={brand.mark} />
                    <span>
                        {brand.short}
                        <small>{brand.kicker}</small>
                    </span>
                </Link>

                <nav className={`${styles.nav} ${styles.links}`} aria-label={tr("Main", locale)}>
                    {links.map((link) => (
                        <Link key={link.href} href={link.href} className={styles.navLink}>
                            {link.label}
                        </Link>
                    ))}
                    {/* Deliberately outside LINKS: it is not a peer of "Services",
                        and someone who needs it is scanning for red, not reading
                        a nav. Kept at five links so the bar stays uncramped. */}
                    {hasEmergency ? (
                        <Link className={styles.urgent} href={withLocale(locale, "/urgent-care")}>
                            <Siren size={15} aria-hidden="true" />
                            {t("urgentCare")}
                        </Link>
                    ) : null}
                    <LanguageToggle />
                    <ThemeMenu />
                    <a className={styles.tel} href={brand.phoneHref}>
                        <Phone size={15} aria-hidden="true" />
                        {brand.phone}
                    </a>
                    <Button onClick={booking.open}>{t("book")}</Button>
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
                    <nav className={styles.panel} id="mobile-nav" aria-label={tr("Main", locale)}>
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={styles.navLink}
                                onClick={() => setOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {hasEmergency ? (
                            <Link
                                className={styles.urgent}
                                href={withLocale(locale, "/urgent-care")}
                                onClick={() => setOpen(false)}
                            >
                                <Siren size={15} aria-hidden="true" />
                                {t("urgentCare")}
                            </Link>
                        ) : null}
                        <LanguageToggle />
                        <ThemeMenu />
                        <a className={styles.tel} href={brand.phoneHref}>
                            <Phone size={15} aria-hidden="true" />
                            {brand.phone}
                        </a>
                        <Button fullWidth onClick={() => { setOpen(false); booking.open(); }}>
                            {t("bookAppointment")}
                        </Button>
                    </nav>
                </div>
            ) : null}
        </header>
    );
}

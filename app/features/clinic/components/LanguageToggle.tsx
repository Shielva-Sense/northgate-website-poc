"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, pathForLocale } from "@/app/core/locale";
import { stringsFor } from "@/app/core/strings";
import { useLocale } from "../LocaleContext";
import styles from "./LanguageToggle.module.scss";

/**
 * The way into the other language.
 *
 * Without this the Arabic site exists and is unreachable: every link on an
 * English page points at an English page, so `/ar` could only be found by
 * typing it. A translation nobody can navigate to is not a feature.
 *
 * Each language is labelled in itself — "English" and "العربية", never
 * "Arabic" — because the person who needs the Arabic version is the one who
 * reads Arabic, and asking them to recognise the English word for their own
 * language is the wrong way round.
 *
 * Real links rather than a button that pushes state: the two languages are
 * two addresses, so they should be right-clickable, shareable, and visible to
 * a crawler as alternates.
 */
export function LanguageToggle(): React.JSX.Element {
    const pathname = usePathname();
    const { locale } = useLocale();

    return (
        <nav className={styles.group} aria-label={stringsFor(locale).language}>
            {LOCALES.map((candidate) => {
                const label = stringsFor(candidate)[candidate === "ar" ? "arabic" : "english"];
                const current = candidate === locale;
                return (
                    <Link
                        key={candidate}
                        href={pathForLocale(pathname, candidate)}
                        className={`${styles.option} ${current ? styles.current : ""}`}
                        lang={candidate}
                        /* aria-current, not aria-disabled: it is still a link,
                           it just points at the page you are already on. */
                        aria-current={current ? "true" : undefined}
                    >
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}

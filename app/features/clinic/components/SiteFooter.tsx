"use client";

import { LocaleLink as Link } from "@/app/components/ui/LocaleLink";
import { useBrand, useProfile } from "../BrandContext";
import styles from "./Sections.module.scss";
import { tr } from "@/app/core/content-ar";
import { useLocale } from "@/app/features/clinic/LocaleContext";

export function SiteFooter(): React.JSX.Element {
    const { locale } = useLocale();
    const brand = useBrand();
    /* This practice's own services. The footer listed a general practice's
       four — so a dental site offered vaccinations and travel health. */
    const profile = useProfile();
    return (
        <footer className={`${styles.foot} site-footer-anchor`}>
            <div className="wrap">
                <div className={styles.footGrid}>
                    <div>
                        <p className={styles.footHead}>{brand.name}</p>
                        <p>{brand.address}</p>
                        <p>
                            <a href={brand.phoneHref}>{brand.phone}</a>
                        </p>
                        <p>
                            <a href={`mailto:${brand.email}`}>{brand.email}</a>
                        </p>
                    </div>
                    <div>
                        <p className={styles.footHead}>{tr("Services", locale)}</p>
                        <ul className={styles.footList}>
                            {profile.services.slice(0, 4).map((service) => (
                                <li key={service.slug}>
                                    <Link href="/services">{service.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className={styles.footHead}>{tr("Practice", locale)}</p>
                        <ul className={styles.footList}>
                            <li>
                                <Link href="/#team">{tr("Our team", locale)}</Link>
                            </li>
                            <li>
                                <Link href="/#visiting">{tr("Opening hours", locale)}</Link>
                            </li>
                            <li>
                                <Link href="/#faq">{tr("Questions", locale)}</Link>
                            </li>
                            <li>
                                <Link href="/#book">{tr("Book", locale)}</Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className={styles.footBase}>
                    <span>
                        {tr("Sample build for demonstration.", locale)} {brand.name}{" "}
                        {tr("is a fictional practice.", locale)}
                    </span>
                    <span>
                        <Link href="/privacy">{tr("Privacy notice", locale)}</Link>{tr("· Built by Shielva Sense", locale)}</span>
                </div>
            </div>
        </footer>
    );
}

"use client";

import Link from "next/link";
import { useBrand, useProfile } from "../BrandContext";
import styles from "./Sections.module.scss";

export function SiteFooter(): React.JSX.Element {
    const brand = useBrand();
    /* This practice's own services. The footer listed a general practice's
       four — so a dental site offered vaccinations and travel health. */
    const profile = useProfile();
    return (
        <footer className={styles.foot}>
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
                        <p className={styles.footHead}>Services</p>
                        <ul className={styles.footList}>
                            {profile.services.slice(0, 4).map((service) => (
                                <li key={service.slug}>
                                    <Link href="/services">{service.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className={styles.footHead}>Practice</p>
                        <ul className={styles.footList}>
                            <li>
                                <Link href="/#team">Our team</Link>
                            </li>
                            <li>
                                <Link href="/#visiting">Opening hours</Link>
                            </li>
                            <li>
                                <Link href="/#faq">Questions</Link>
                            </li>
                            <li>
                                <Link href="/#book">Book</Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className={styles.footBase}>
                    <span>
                        Sample build for demonstration. {brand.name} is a fictional practice.
                    </span>
                    <span>
                        <Link href="/privacy">Privacy notice</Link> &middot; Built by Shielva Sense
                    </span>
                </div>
            </div>
        </footer>
    );
}

"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { SERVICES } from "../constants";
import { useBrand } from "../BrandContext";
import styles from "./Sections.module.scss";

export function SiteFooter(): React.JSX.Element {
    const brand = useBrand();
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
                            {SERVICES.slice(0, 4).map((service) => (
                                <li key={service.slug}>
                                    <Link href="/#services">{service.name}</Link>
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
                <aside className={styles.emergency} aria-label="In an emergency">
                    <AlertTriangle size={17} aria-hidden="true" />
                    <p>
                        <b>In an emergency, call {brand.emergencyNumber}</b> or go to your nearest
                        emergency department. Do not wait for an appointment and do not wait for us
                        to call you back.
                    </p>
                </aside>

                <div className={styles.footBase}>
                    <span>
                        Sample build for demonstration. Northgate Family Health is a fictional
                        practice.
                    </span>
                    <span>
                        <Link href="/privacy">Privacy notice</Link> &middot; Built by Shielva Sense
                    </span>
                </div>
            </div>
        </footer>
    );
}

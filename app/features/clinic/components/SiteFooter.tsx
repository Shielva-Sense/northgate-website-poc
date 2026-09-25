import Link from "next/link";
import { CLINIC, SERVICES } from "../constants";
import styles from "./Sections.module.scss";

export function SiteFooter(): React.JSX.Element {
    return (
        <footer className={styles.foot}>
            <div className="wrap">
                <div className={styles.footGrid}>
                    <div>
                        <p className={styles.footHead}>{CLINIC.name}</p>
                        <p>{CLINIC.address}</p>
                        <p>
                            <a href={CLINIC.phoneHref}>{CLINIC.phone}</a>
                        </p>
                        <p>
                            <a href={`mailto:${CLINIC.email}`}>{CLINIC.email}</a>
                        </p>
                    </div>
                    <div>
                        <p className={styles.footHead}>Services</p>
                        <ul className={styles.footList}>
                            {SERVICES.slice(0, 4).map((service) => (
                                <li key={service.slug}>
                                    <a href="#services">{service.name}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <p className={styles.footHead}>Practice</p>
                        <ul className={styles.footList}>
                            <li>
                                <a href="#team">Our team</a>
                            </li>
                            <li>
                                <a href="#visiting">Opening hours</a>
                            </li>
                            <li>
                                <a href="#faq">Questions</a>
                            </li>
                            <li>
                                <a href="#book">Book</a>
                            </li>
                        </ul>
                    </div>
                </div>
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

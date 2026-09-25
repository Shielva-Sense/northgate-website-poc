import Link from "next/link";
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

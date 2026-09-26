import Link from "next/link";
import styles from "./Library.module.scss";

/**
 * What the library shows before a practice has one.
 *
 * The built-in articles were written for a general practice and filed under
 * its departments, so a dental or veterinary site matched none of them — and
 * a page of empty headings reads as broken rather than as new.
 *
 * Kept as a real section rather than hiding the page: the route is linked
 * from the header, and a 404 on a nav item is worse than an honest empty
 * state. Articles are supplied per practice through the registry, so filling
 * this needs no deploy.
 */
export function EmptyLibrary(): React.JSX.Element {
    return (
        <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>Articles are on their way</h2>
            <p className={styles.emptyBody}>
                We are writing plain-language guides for the questions we are asked most, and they
                will appear here as they are ready. In the meantime, these cover what we treat and
                how to be seen.
            </p>
            <p className={styles.emptyActions}>
                <Link className={styles.emptyLink} href="/services">
                    See what we treat
                </Link>
                <Link className={styles.emptyLink} href="/appointments">
                    Book an appointment
                </Link>
            </p>
        </div>
    );
}

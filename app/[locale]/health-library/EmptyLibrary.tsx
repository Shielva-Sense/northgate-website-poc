import { LocaleLink as Link } from "@/app/components/ui/LocaleLink";
import styles from "./Library.module.scss";
import { tr } from "@/app/core/content-ar";
import { useLocale } from "@/app/features/clinic/LocaleContext";

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
    const { locale } = useLocale();
    return (
        <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>{tr("Articles are on their way", locale)}</h2>
            <p className={styles.emptyBody}>{tr("We are writing plain-language guides for the questions we are asked most, and they will appear here as they are ready. In the meantime, these cover what we treat and how to be seen.", locale)}</p>
            <p className={styles.emptyActions}>
                <Link className={styles.emptyLink} href="/services">{tr("See what we treat", locale)}</Link>
                <Link className={styles.emptyLink} href="/appointments">{tr("Book an appointment", locale)}</Link>
            </p>
        </div>
    );
}

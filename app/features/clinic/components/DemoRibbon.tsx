import styles from "./DemoRibbon.module.scss";
import { tr } from "@/app/core/content-ar";
import type { Locale } from "@/app/core/locale";

/**
 * "This is a proposal, not their website."
 *
 * These sites carry a real clinic's name and address but AI-generated
 * clinician photographs, invented prices and a written testimonial. They are
 * also public — no login — so a patient searching for that clinic could land
 * here. Everything on the page is designed to look like a real practice's
 * site, which is exactly why one element has to say plainly that it is not.
 *
 * Deliberately not dismissible, and first in the document so a screen reader
 * reaches it before the clinic's name.
 */
export function DemoRibbon({
    name,
    locale,
}: {
    readonly name: string;
    readonly locale: Locale;
}): React.JSX.Element {
    return (
        <aside className={styles.ribbon} role="note">
            <b>{tr("Design proposal", locale)}</b>
            <span>
                A concept site prepared for {name} by Shielva Sense. Not affiliated with,
                endorsed by, or operated by {name}. People, prices and reviews shown are
                placeholders.
            </span>
        </aside>
    );
}

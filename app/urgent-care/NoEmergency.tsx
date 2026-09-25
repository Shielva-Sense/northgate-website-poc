import { AlertTriangle, Phone } from "lucide-react";
import styles from "./Urgent.module.scss";

/**
 * What a practice without an emergency department says to someone in one.
 *
 * Most of these sites belong to dentists, physiotherapists and optometrists.
 * Whoever reaches this page followed a link or guessed the address while
 * looking for urgent help, so the page owes them the right number and the
 * right destination — not a 404, and certainly not a booking form.
 */
export function NoEmergency({
    emergencyNumber,
    phone,
    phoneHref,
    visit,
}: {
    readonly emergencyNumber: string;
    readonly phone: string;
    readonly phoneHref: string;
    readonly visit: string;
}): React.JSX.Element {
    return (
        <div className={styles.panel}>
            <aside className={styles.emergency} role="note">
                <p className={styles.emergencyTag}>
                    <AlertTriangle size={16} aria-hidden="true" />
                    If this is an emergency
                </p>
                <h2 className={styles.emergencyTitle}>Call {emergencyNumber} now</h2>
                <p className={styles.emergencyBody}>
                    Chest pain, difficulty breathing, severe bleeding, a head injury, or anything
                    you would describe as an emergency needs an ambulance or a hospital emergency
                    department. Do not wait for us — we are not open around the clock and we are
                    not equipped for it.
                </p>
                <a className={styles.emergencyCall} href={`tel:${emergencyNumber}`}>
                    <Phone size={17} aria-hidden="true" />
                    Call {emergencyNumber}
                </a>
            </aside>

            <section className={styles.panel} aria-labelledby="urgent-but-not">
                <h2 className={styles.h2} id="urgent-but-not">
                    Urgent, but not an emergency
                </h2>
                <p className={styles.lede}>
                    If it can wait for opening hours but not for next week, ring us and say it is
                    urgent. We hold some {visit}s back each day for exactly this, and reception
                    will tell you honestly if we are not the right people.
                </p>
                <a className={styles.emergencyCall} href={phoneHref}>
                    <Phone size={17} aria-hidden="true" />
                    {phone}
                </a>
            </section>
        </div>
    );
}

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
    isVet = false,
}: {
    readonly emergencyNumber: string;
    readonly phone: string;
    readonly phoneHref: string;
    readonly visit: string;
    /** No ambulance service takes an animal, so the whole page changes. */
    readonly isVet?: boolean;
}): React.JSX.Element {
    return (
        <div className={styles.panel}>
            <aside className={styles.emergency} role="note">
                <p className={styles.emergencyTag}>
                    <AlertTriangle size={16} aria-hidden="true" />
                    If this is an emergency
                </p>
                {isVet === true ? (
                    <>
                        {/* Sending an owner to 911 for a collapsed dog wastes the
                            minutes that decide it. The right answer is a vet who
                            is open now, and we are not always that vet. */}
                        <h2 className={styles.emergencyTitle}>Ring us first on {phone}</h2>
                        <p className={styles.emergencyBody}>
                            Collapse, struggling to breathe, a hard swollen tummy with retching, a
                            cat straining and passing nothing, a seizure that will not stop, or
                            something poisonous swallowed — ring us before you set off. We are not
                            a 24-hour hospital, so if we are closed our answerphone names the
                            emergency service covering us tonight and how to reach them.
                        </p>
                        <a className={styles.emergencyCall} href={phoneHref}>
                            <Phone size={17} aria-hidden="true" />
                            {phone}
                        </a>
                    </>
                ) : (
                    <>
                        <h2 className={styles.emergencyTitle}>Call {emergencyNumber} now</h2>
                        <p className={styles.emergencyBody}>
                            Chest pain, difficulty breathing, severe bleeding, a head injury, or
                            anything you would describe as an emergency needs an ambulance or a
                            hospital emergency department. Do not wait for us — we are not open
                            around the clock and we are not equipped for it.
                        </p>
                        <a className={styles.emergencyCall} href={`tel:${emergencyNumber}`}>
                            <Phone size={17} aria-hidden="true" />
                            Call {emergencyNumber}
                        </a>
                    </>
                )}
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

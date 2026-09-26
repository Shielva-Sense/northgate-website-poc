import styles from "./Loading.module.scss";

/**
 * Route-level loading surface.
 *
 * One surface, no logo, and a message that says what is happening rather than
 * the word "Loading" on its own. The bar is indeterminate on purpose — we do
 * not know the duration, and a fake progress percentage is a lie told to
 * someone who is already waiting.
 *
 * Under reduced motion the bar stops animating and holds, so there is still a
 * visible loading state without the movement.
 */
export default function Loading(): React.JSX.Element {
    return (
        <div className={styles.screen} role="status" aria-live="polite">
            <div className={styles.card}>
                <p className={styles.title}>Getting the practice details</p>
                <p className={styles.detail}>One moment — this is usually instant.</p>
                <div className={styles.track}>
                    <span className={styles.bar} />
                </div>
            </div>
        </div>
    );
}

import Link from "next/link";
import { Layers } from "lucide-react";
import { TEMPLATES } from "../templates";
import type { TemplateId } from "../templates";
import styles from "./DemoBar.module.scss";

/**
 * Layout switcher, for showing a client the options live.
 *
 * A sales surface, not a patient feature — which is why it is rendered only
 * while the invite gate is on. The moment a practice goes public it vanishes
 * with the gate, so there is no risk of a real visitor finding a control that
 * rearranges their doctor's website.
 *
 * Plain links rather than a client component: switching is a server render, so
 * this needs no JavaScript and cannot break the page it sits on.
 */
export function DemoBar({ active }: { readonly active: TemplateId }): React.JSX.Element {
    return (
        <aside className={styles.bar} aria-label="Demo layout switcher">
            <span className={styles.label}>
                <Layers size={14} aria-hidden="true" />
                Layout
            </span>
            <ul className={styles.options} role="list">
                {TEMPLATES.map((template) => (
                    <li key={template.id}>
                        <Link
                            href={`/?template=${template.id}`}
                            className={styles.option}
                            aria-current={template.id === active ? "true" : undefined}
                            prefetch={false}
                        >
                            {template.name}
                        </Link>
                    </li>
                ))}
            </ul>
            <Link href="/templates" className={styles.compare} prefetch={false}>
                Compare all
            </Link>
        </aside>
    );
}

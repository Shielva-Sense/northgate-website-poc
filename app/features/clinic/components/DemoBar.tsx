import { LocaleLink as Link } from "@/app/components/ui/LocaleLink";
import { Layers } from "lucide-react";
import { TEMPLATES } from "../templates";
import type { TemplateId } from "../templates";
import { DemoThemes } from "./DemoThemes";
import { SuggestionTrigger } from "@/app/features/feedback/SuggestionPanel";
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
export function DemoBar({
    active,
}: {
    /** Absent on inner pages: the layout switch is a home-page concern, the
        colour switch is not, and the bar has to appear on both. */
    readonly active?: TemplateId | undefined;
} = {}): React.JSX.Element {
    return (
        <aside className={styles.bar} aria-label="Demo layout switcher">
            <span className={styles.label}>
                <Layers size={14} aria-hidden="true" />
                <span className={styles.labelText}>Layout</span>
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

            <DemoThemes />

            <Link href="/templates" className={styles.compare} prefetch={false}>
                Compare all
            </Link>

            {/* Last, and visually the loudest thing on the bar: it is the one
                control here that sends something back to us. */}
            <SuggestionTrigger template={active ?? "practice"} />
        </aside>
    );
}

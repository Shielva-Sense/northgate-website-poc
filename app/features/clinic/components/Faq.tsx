"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useReveal } from "@/app/core/hooks/useReveal";
import { FAQS } from "../constants";
import sections from "./Sections.module.scss";
import styles from "./Faq.module.scss";

export function Faq(): React.JSX.Element {
    const reveal = useReveal<HTMLDivElement>();
    const baseId = useId();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className={sections.section} id="faq">
            <div className="wrap" ref={reveal}>
                <div className={sections.head} data-reveal="">
                    <p className={sections.kicker}>Questions</p>
                    <h2 className={sections.title}>Before you book</h2>
                </div>

                <div className={styles.list} data-reveal="">
                    {FAQS.map((faq, index) => {
                        const open = openIndex === index;
                        const panelId = `${baseId}-panel-${index}`;
                        const buttonId = `${baseId}-button-${index}`;
                        return (
                            <div
                                className={`${styles.item} ${open ? styles.open : ""}`}
                                key={faq.question}
                            >
                                <h3>
                                    <button
                                        type="button"
                                        className={styles.trigger}
                                        id={buttonId}
                                        aria-expanded={open}
                                        aria-controls={panelId}
                                        onClick={() => setOpenIndex(open ? null : index)}
                                    >
                                        {faq.question}
                                        <ChevronDown
                                            size={20}
                                            className={styles.chev}
                                            aria-hidden="true"
                                        />
                                    </button>
                                </h3>
                                <div
                                    className={styles.panel}
                                    id={panelId}
                                    role="region"
                                    aria-labelledby={buttonId}
                                >
                                    <div className={styles.panelInner}>
                                        <p className={styles.answer}>{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

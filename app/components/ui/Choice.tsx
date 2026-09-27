"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import styles from "./Choice.module.scss";
import { tr } from "@/app/core/content-ar";
import { useLocale } from "@/app/features/clinic/LocaleContext";

export interface ChoiceOption<T extends string> {
    readonly value: T;
    readonly label: string;
}

type ChoiceGroupProps<T extends string> = {
    legend: string;
    name: string;
    value: T;
    options: readonly ChoiceOption<T>[];
    onChange: (value: T) => void;
    error?: string | undefined;
};

/**
 * A radio group rendered as chips. Uses a real fieldset/legend and real radio
 * inputs so arrow-key navigation and screen-reader grouping work unchanged.
 */
export function ChoiceGroup<T extends string>({
    legend,
    name,
    value,
    options,
    onChange,
    error,
}: ChoiceGroupProps<T>): React.JSX.Element {
    const { locale } = useLocale();
    const id = useId();
    const errorId = `${id}-error`;

    return (
        <fieldset
            className={styles.group}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
        >
            <legend className={styles.legend}>{legend}</legend>
            <div className={styles.options}>
                {options.map((option) => {
                    const optionId = `${id}-${option.value}`;
                    return (
                        <div className={styles.option} key={option.value}>
                            <input
                                className={styles.input}
                                type="radio"
                                id={optionId}
                                name={name}
                                value={option.value}
                                checked={value === option.value}
                                onChange={() => onChange(option.value)}
                            />
                            <label className={styles.chip} htmlFor={optionId}>
                                {/* The option lists are module-scope constants, so
                                    they are built before a locale exists. Translated
                                    here, at the one place a label becomes text. */}
                                {tr(option.label, locale)}
                            </label>
                        </div>
                    );
                })}
            </div>
            {error ? (
                <p className={styles.error} id={errorId} role="alert">
                    {error}
                </p>
            ) : null}
        </fieldset>
    );
}

type CheckboxProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    children: ReactNode;
    error?: string | undefined;
};

export function Checkbox({ checked, onChange, children, error }: CheckboxProps): React.JSX.Element {
    const id = useId();
    const errorId = `${id}-error`;

    return (
        <div>
            <div className={styles.check}>
                <input
                    className={styles.checkBox}
                    type="checkbox"
                    id={id}
                    checked={checked}
                    onChange={(event) => onChange(event.target.checked)}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                />
                <label className={styles.checkLabel} htmlFor={id}>
                    {children}
                </label>
            </div>
            {error ? (
                <p className={styles.error} id={errorId} role="alert">
                    {error}
                </p>
            ) : null}
        </div>
    );
}

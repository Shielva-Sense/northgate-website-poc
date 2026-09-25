"use client";

import { useId } from "react";
import type {
    InputHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
} from "react";
import styles from "./Field.module.scss";

type FieldProps = {
    label: string;
    help?: string | undefined;
    error?: string | undefined;
    required?: boolean | undefined;
    /** Receives the generated id and the aria-describedby to wire onto the control. */
    children: (id: string, describedBy: string | undefined) => ReactNode;
};

/**
 * Owns label/control association, required marking, help and error text.
 * Controls are never rendered bare — this is the only place that pairs them.
 */
export function Field({
    label,
    help,
    error,
    required = false,
    children,
}: FieldProps): React.JSX.Element {
    const id = useId();
    const helpId = `${id}-help`;
    const errorId = `${id}-error`;
    const describedBy =
        [error ? errorId : null, help ? helpId : null].filter(Boolean).join(" ") || undefined;

    return (
        <div className={styles.field}>
            <label className={styles.label} htmlFor={id}>
                {label}
                {required ? (
                    <span className={styles.req} aria-hidden="true">
                        *
                    </span>
                ) : null}
            </label>
            {children(id, describedBy)}
            {error ? (
                <p className={styles.error} id={errorId} role="alert">
                    {error}
                </p>
            ) : null}
            {help ? (
                <p className={styles.help} id={helpId}>
                    {help}
                </p>
            ) : null}
        </div>
    );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>): React.JSX.Element {
    const { className, ...rest } = props;
    return <input className={[styles.control, className ?? ""].join(" ").trim()} {...rest} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>): React.JSX.Element {
    const { className, children, ...rest } = props;
    return (
        <select
            className={[styles.control, styles.select, className ?? ""].join(" ").trim()}
            {...rest}
        >
            {children}
        </select>
    );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>): React.JSX.Element {
    const { className, ...rest } = props;
    return (
        <textarea
            className={[styles.control, styles.textarea, className ?? ""].join(" ").trim()}
            {...rest}
        />
    );
}

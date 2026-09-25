import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.scss";

export const BUTTON_VARIANTS = ["primary", "ghost", "onDark"] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant | undefined;
    size?: "md" | "lg" | undefined;
    fullWidth?: boolean | undefined;
    leftIcon?: ReactNode | undefined;
    rightIcon?: ReactNode | undefined;
};

export function Button({
    variant = "primary",
    size = "md",
    fullWidth = false,
    leftIcon,
    rightIcon,
    children,
    className,
    type = "button",
    ...rest
}: Props): React.JSX.Element {
    const classes = [
        styles.btn,
        styles[variant],
        size === "lg" ? styles.lg : "",
        fullWidth ? styles.fullWidth : "",
        className ?? "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button type={type} className={classes} {...rest}>
            {leftIcon}
            {children}
            {rightIcon}
        </button>
    );
}

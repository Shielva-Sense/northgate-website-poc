import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Button.module.scss";
import type { ButtonVariant } from "./Button";

type Props = {
    href: string;
    variant?: ButtonVariant | undefined;
    size?: "md" | "lg" | undefined;
    leftIcon?: ReactNode | undefined;
    rightIcon?: ReactNode | undefined;
    children: ReactNode;
};

/** Navigation uses an anchor, never a button with an onClick router push. */
export function LinkButton({
    href,
    variant = "primary",
    size = "md",
    leftIcon,
    rightIcon,
    children,
}: Props): React.JSX.Element {
    const classes = [styles.btn, styles[variant], size === "lg" ? styles.lg : ""]
        .filter(Boolean)
        .join(" ");

    return (
        <Link href={href} className={classes}>
            {leftIcon}
            {children}
            {rightIcon}
        </Link>
    );
}

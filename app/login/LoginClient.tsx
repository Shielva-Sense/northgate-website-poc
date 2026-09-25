"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Loader2, LogIn } from "lucide-react";
import { Field, Input } from "@/app/components/ui/Field";
import { Button } from "@/app/components/ui/Button";
import styles from "./Login.module.scss";

export function LoginClient(): React.JSX.Element {
    const router = useRouter();
    const params = useSearchParams();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        setBusy(true);
        setError(null);
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });
            if (!response.ok) {
                const body: unknown = await response.json().catch(() => null);
                const message =
                    typeof body === "object" && body !== null && "error" in body
                        ? String((body as Record<string, unknown>).error)
                        : "Sign in failed.";
                setError(message);
                setBusy(false);
                return;
            }
            const next = params.get("next");
            router.replace(next && next.startsWith("/") ? next : "/");
            router.refresh();
        } catch {
            setError("Could not reach the server. Please try again.");
            setBusy(false);
        }
    }

    return (
        <main id="main-content" tabIndex={-1} className={styles.screen}>
            <form
                className={styles.dialog}
                onSubmit={handleSubmit}
                aria-labelledby="login-title"
            >
                <div className={styles.mark} aria-hidden="true">
                    S
                </div>
                <h1 className={styles.title} id="login-title">
                    Private preview
                </h1>
                <p className={styles.lede}>
                    This build is shared by invitation. Enter the details you were sent.
                </p>

                {error ? (
                    <p className={styles.alert} role="alert">
                        <AlertTriangle size={17} aria-hidden="true" />
                        <span>{error}</span>
                    </p>
                ) : null}

                <Field label="Username" required>
                    {(id) => (
                        <Input
                            id={id}
                            name="username"
                            autoComplete="username"
                            autoFocus
                            required
                            aria-required="true"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                        />
                    )}
                </Field>

                <Field label="Access code" required>
                    {(id) => (
                        <Input
                            id={id}
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            aria-required="true"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    )}
                </Field>

                <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    disabled={busy}
                    leftIcon={
                        busy ? (
                            <Loader2 size={16} className={styles.spin} aria-hidden="true" />
                        ) : (
                            <LogIn size={16} aria-hidden="true" />
                        )
                    }
                >
                    {busy ? "Checking…" : "View the preview"}
                </Button>

                <p className={styles.foot}>Shielva Sense — shared privately, not indexed.</p>
            </form>
        </main>
    );
}

"use client";

import { useEffect } from "react";
import { tr } from "@/app/core/content-ar";
import { useLocale } from "@/app/features/clinic/LocaleContext";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}): React.JSX.Element {
    const { locale } = useLocale();
    useEffect(() => {
        // Single place errors leave the app. A real build forwards to the
        // telemetry sink here rather than only writing to the console.
        console.error("Unhandled error", error);
    }, [error]);

    return (
        <main id="main-content" tabIndex={-1} className="wrap" style={{ padding: "96px 24px" }}>
            <h1>{tr("Something went wrong", locale)}</h1>
            <p className="text-muted">{tr("Please try again. If it keeps happening, call the practice.", locale)}</p>
            <button type="button" onClick={reset}>{tr("Try again", locale)}</button>
        </main>
    );
}

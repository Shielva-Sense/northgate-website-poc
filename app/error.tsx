"use client";

import { useEffect } from "react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}): React.JSX.Element {
    useEffect(() => {
        // Single place errors leave the app. A real build forwards to the
        // telemetry sink here rather than only writing to the console.
        console.error("Unhandled error", error);
    }, [error]);

    return (
        <main id="main-content" tabIndex={-1} className="wrap" style={{ padding: "96px 24px" }}>
            <h1>Something went wrong</h1>
            <p className="text-muted">Please try again. If it keeps happening, call the practice.</p>
            <button type="button" onClick={reset}>
                Try again
            </button>
        </main>
    );
}

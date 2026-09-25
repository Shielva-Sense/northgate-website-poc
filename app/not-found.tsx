import Link from "next/link";

export default function NotFound(): React.JSX.Element {
    return (
        <main id="main-content" tabIndex={-1} className="wrap" style={{ padding: "96px 24px" }}>
            <h1>Page not found</h1>
            <p className="text-muted">That page does not exist on this site.</p>
            <p>
                <Link href="/">Back to the home page</Link>
            </p>
        </main>
    );
}

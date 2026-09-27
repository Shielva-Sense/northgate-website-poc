import { LocaleLink as Link } from "@/app/components/ui/LocaleLink";

/**
 * Not found, inside the language segment.
 *
 * Without this file a miss fell through to app/not-found.tsx, which sits above
 * `[locale]` and therefore outside the layout that renders the masthead, the
 * navigation and the footer. A prospect who followed a stale link got a bare
 * sentence on a white page with no way back and nothing identifying the
 * practice — which reads as a broken site rather than a wrong address.
 *
 * Here it renders inside the chrome, so the header is still there and the
 * visitor can carry on.
 */
export default function NotFound(): React.JSX.Element {
    return (
        <main id="main-content" tabIndex={-1} className="wrap" style={NOT_FOUND_STYLE}>
            <h1 className="h1">This page does not exist</h1>
            <p className="text-muted">
                The address may be out of date, or the practice may not offer this service.
            </p>
            <p style={LINK_ROW_STYLE}>
                <Link href="/services">See what we treat</Link>
                <Link href="/contact">Contact us</Link>
            </p>
        </main>
    );
}

const NOT_FOUND_STYLE: React.CSSProperties = { padding: "96px 0 120px" };
const LINK_ROW_STYLE: React.CSSProperties = { display: "flex", gap: "24px", marginTop: "24px" };

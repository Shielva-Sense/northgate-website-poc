type Props = {
    /** Rendered size in px. The mark is drawn on a 64 grid and scales cleanly. */
    readonly size?: number | undefined;
    /**
     * Decorative by default: the wordmark next to it already names the practice,
     * so announcing it twice is noise. Pass a title only where the mark stands
     * alone with no text beside it.
     */
    readonly title?: string | undefined;
};

/**
 * Northgate's mark: a gateway arch — the "gate" in the name — with a care cross
 * held in its opening.
 *
 * Drawn as strokes on a 64 grid with round caps so it stays legible when it is
 * shrunk to a 16px favicon, which is the size that decides whether a mark
 * works. The tile and the mark are separate paths so the same geometry can be
 * reused on a dark tile here and in flat colour elsewhere.
 */
export function Logo({ size = 40, title }: Props): React.JSX.Element {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            role={title ? "img" : "presentation"}
            aria-hidden={title ? undefined : true}
            aria-label={title}
        >
            <rect width="64" height="64" rx="15" fill="var(--color-brand-900, #0b3b3c)" />
            {/* the gateway */}
            <path
                d="M19 48V31a13 13 0 0 1 26 0v17"
                fill="none"
                stroke="var(--color-on-brand, #ffffff)"
                strokeWidth="5.5"
                strokeLinecap="round"
            />
            {/* the care cross, sitting in the opening */}
            <path
                d="M32 29v10M27 34h10"
                fill="none"
                stroke="var(--color-brand-500, #1d8f91)"
                strokeWidth="4.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

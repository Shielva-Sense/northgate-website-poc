import { markShapes } from "@/app/features/clinic/mark";
import type { Ink, MarkId } from "@/app/features/clinic/mark";

type Props = {
    /** Rendered size in px. The mark is drawn on a 64 grid and scales cleanly. */
    readonly size?: number | undefined;
    /**
     * Which mark to draw. Comes from the brand, which derives it from the
     * practice's trade and then its identifier — a dentist gets a tooth, a vet
     * a paw. Defaulted so a caller outside a branded tree still renders.
     */
    readonly mark?: MarkId | undefined;
    /**
     * Decorative by default: the wordmark next to it already names the practice,
     * so announcing it twice is noise. Pass a title only where the mark stands
     * alone with no text beside it.
     */
    readonly title?: string | undefined;
};

const STROKE: Readonly<Record<Ink, string>> = {
    on: "var(--color-on-brand, #ffffff)",
    accent: "var(--color-brand-500, #1d8f91)",
};

/**
 * The practice's mark.
 *
 * This used to draw one hardcoded gateway arch, which meant every client on
 * the farm opened with the same icon however carefully the rest of the site
 * was made their own — the single loudest tell that a page is a template. The
 * geometry now comes from mark.ts, shared with the favicon so the two cannot
 * drift.
 *
 * Drawn as strokes on a 64 grid with round caps so it stays legible when it is
 * shrunk to a 16px favicon, which is the size that decides whether a mark
 * works. The tile and the mark are separate shapes so the same geometry can be
 * reused on a dark tile here and in flat colour elsewhere.
 */
export function Logo({ size = 40, mark = "gateway", title }: Props): React.JSX.Element {
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
            {markShapes(mark).map((shape, index) =>
                shape.s === "circle" ? (
                    <circle
                        /* Index is stable here: the shapes of a mark are a fixed
                           literal array, never reordered, filtered or appended to. */
                        key={index}
                        cx={shape.cx}
                        cy={shape.cy}
                        r={shape.r}
                        fill="none"
                        stroke={STROKE[shape.ink]}
                        strokeWidth={shape.w}
                    />
                ) : (
                    <path
                        key={index}
                        d={shape.d}
                        fill="none"
                        stroke={STROKE[shape.ink]}
                        strokeWidth={shape.w}
                        strokeLinecap={shape.cap === true ? "round" : undefined}
                        strokeLinejoin={shape.join === true ? "round" : undefined}
                    />
                ),
            )}
        </svg>
    );
}

import { ImageResponse } from "next/og";

/**
 * Apple touch icon, drawn from the same geometry as icon.svg and the Logo
 * component. Rendered at build time rather than shipped as a PNG so the mark
 * has one definition, not three that drift apart.
 *
 * iOS applies its own rounding, so the tile is drawn square to the edges.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" fill="#0b3b3c"/>
<path d="M19 48V31a13 13 0 0 1 26 0v17" fill="none" stroke="#ffffff" stroke-width="5.5" stroke-linecap="round"/>
<path d="M32 29v10M27 34h10" fill="none" stroke="#1d8f91" stroke-width="4.5" stroke-linecap="round"/>
</svg>`;

export default function AppleIcon(): ImageResponse {
    return new ImageResponse(
        (
            <img
                width={size.width}
                height={size.height}
                src={`data:image/svg+xml;base64,${Buffer.from(MARK).toString("base64")}`}
                alt=""
            />
        ),
        size,
    );
}

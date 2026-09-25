import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import { resolveBrand } from "./features/clinic/brands";
import { markSvg } from "./features/clinic/mark";

/**
 * Favicon, generated per brand.
 *
 * Drawn from the same geometry and the same palette as the header logo, so a
 * prospect's tab icon can never be a different colour from their site. A static
 * file cannot do that, which is why this is a route rather than an SVG asset.
 */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default async function Icon(): Promise<ImageResponse> {
    const brand = resolveBrand((await headers()).get("host"));
    return new ImageResponse(
        (
            <img
                width={size.width}
                height={size.height}
                src={`data:image/svg+xml;base64,${Buffer.from(markSvg(brand, 15)).toString("base64")}`}
                alt=""
            />
        ),
        size,
    );
}

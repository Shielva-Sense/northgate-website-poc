import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import { siteFromHost } from "./core/site";
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
    const site = await siteFromHost((await headers()).get("host"));
    const brand = site.brand;

    /* A client who has uploaded their own mark gets it; the CDN copy is public
       precisely because a favicon request carries no credentials. Everyone
       else gets the monogram drawn from their own palette, which is still
       theirs — never a generic placeholder. */
    if (site.iconUrl !== null) {
        return new ImageResponse(
            (<img width={size.width} height={size.height} src={site.iconUrl} alt="" />),
            size,
        );
    }
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

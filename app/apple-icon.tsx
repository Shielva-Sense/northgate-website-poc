import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import { siteFromHost } from "./core/site";
import { markSvg } from "./features/clinic/mark";

/** Apple touch icon, same mark and palette. iOS applies its own rounding, so
 *  the tile is drawn square to the edges. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon(): Promise<ImageResponse> {
    const brand = (await siteFromHost((await headers()).get("host"))).brand;
    return new ImageResponse(
        (
            <img
                width={size.width}
                height={size.height}
                src={`data:image/svg+xml;base64,${Buffer.from(markSvg(brand, 0)).toString("base64")}`}
                alt=""
            />
        ),
        size,
    );
}

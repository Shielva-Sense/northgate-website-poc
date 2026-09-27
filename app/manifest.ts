import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { siteFromHost } from "./core/site";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const brand = (await siteFromHost((await headers()).get("host"))).brand;
    return {
        name: brand.name,
        short_name: brand.short,
        /* The trade's own line. This was the eighth place the general
           practice's strapline had been hardcoded, and the only one that
           reaches the home-screen icon after someone installs the site. */
        description: `${brand.strapline}. Appointments, opening hours and booking for ${brand.name}.`,
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: brand.palette.brand900,
        icons: [
            { src: "/icon", sizes: "64x64", type: "image/png" },
            { src: "/apple-icon", sizes: "180x180", type: "image/png" },
        ],
    };
}

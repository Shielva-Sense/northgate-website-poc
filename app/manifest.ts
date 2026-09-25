import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { resolveBrand } from "@/app/features/clinic/brands";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    const brand = resolveBrand((await headers()).get("host"));
    return {
        name: brand.name,
        short_name: brand.short,
        description:
            `See a named doctor this week. Appointments, opening hours and booking for ${brand.name}.`,
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

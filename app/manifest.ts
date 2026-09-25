import type { MetadataRoute } from "next";
import { CLINIC } from "@/app/features/clinic/constants";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: CLINIC.name,
        short_name: "Northgate",
        description:
            "See a named doctor this week. Appointments, opening hours and booking for Northgate Family Health.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#0b3b3c",
        icons: [
            { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
            { src: "/apple-icon", sizes: "180x180", type: "image/png" },
        ],
    };
}

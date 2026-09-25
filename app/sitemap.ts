import type { MetadataRoute } from "next";
import { SERVICES } from "@/app/features/clinic/constants";
import { siteUrl } from "@/app/core/seo";

export default function sitemap(): MetadataRoute.Sitemap {
    const url = siteUrl();
    const now = new Date();

    return [
        { url, lastModified: now, changeFrequency: "weekly", priority: 1 },
        {
            url: `${url}/privacy`,
            lastModified: now,
            changeFrequency: "yearly" as const,
            priority: 0.3,
        },
        ...SERVICES.map((service) => ({
            url: `${url}/services/${service.slug}`,
            lastModified: now,
            changeFrequency: "monthly" as const,
            priority: 0.8,
        })),
    ];
}

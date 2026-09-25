import type { MetadataRoute } from "next";
import { SERVICES } from "@/app/features/clinic/constants";
import { ARTICLES } from "@/app/features/clinic/catalogue";
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
        ...["services", "appointments", "find-a-doctor", "health-library", "contact", "refer"].map((path) => ({
            url: `${url}/${path}`,
            lastModified: now,
            changeFrequency: "monthly" as const,
            priority: 0.7,
        })),
        ...ARTICLES.map((article) => ({
            url: `${url}/health-library/${article.slug}`,
            lastModified: now,
            changeFrequency: "yearly" as const,
            priority: 0.5,
        })),
        ...SERVICES.map((service) => ({
            url: `${url}/services/${service.slug}`,
            lastModified: now,
            changeFrequency: "monthly" as const,
            priority: 0.8,
        })),
    ];
}

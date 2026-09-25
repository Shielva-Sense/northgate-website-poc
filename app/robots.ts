import type { MetadataRoute } from "next";
import { isIndexable, siteUrl } from "@/app/core/seo";

/**
 * While the invite gate is on, every URL answers with the login page, so
 * inviting crawlers in would only publish a sitemap of sign-in forms. Clearing
 * POC_PASSWORD opens the site and flips this to a normal allow.
 */
export default function robots(): MetadataRoute.Robots {
    if (!isIndexable()) {
        return { rules: [{ userAgent: "*", disallow: "/" }] };
    }
    return {
        rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/login"] }],
        sitemap: `${siteUrl()}/sitemap.xml`,
        host: siteUrl(),
    };
}

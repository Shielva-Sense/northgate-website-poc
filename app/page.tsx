import type { Metadata } from "next";
import { headers } from "next/headers";
import { HomeClient } from "./HomeClient";
import { JsonLd } from "./components/JsonLd";
import { clinicJsonLd, faqJsonLd, isIndexable, siteUrl } from "./core/seo";
import { resolveBrand } from "./features/clinic/brands";
import { BrandProvider } from "./features/clinic/BrandContext";

export function generateMetadata(): Metadata {
    const canonical = siteUrl();
    return {
        alternates: { canonical },
        robots: isIndexable() ? undefined : { index: false, follow: false },
        openGraph: {
            title: "Northgate Family Health",
            description: "See a named doctor this week, not in three.",
            url: canonical,
            type: "website",
            images: [{ url: `${canonical}/img/consultation.jpg`, width: 1800, height: 1016 }],
        },
    };
}

/** Server shell. All interactivity lives in HomeClient. */
export default async function Page(): Promise<React.JSX.Element> {
    const brand = resolveBrand((await headers()).get("host"));
    return (
        <BrandProvider brand={brand}>
            <JsonLd data={clinicJsonLd(brand)} />
            <JsonLd data={faqJsonLd()} />
            <HomeClient />
        </BrandProvider>
    );
}

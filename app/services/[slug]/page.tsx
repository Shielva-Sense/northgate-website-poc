import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { JsonLd } from "@/app/components/JsonLd";
import { SERVICES } from "@/app/features/clinic/constants";
import { isIndexable, serviceJsonLd, siteUrl } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { BrandProvider } from "@/app/features/clinic/BrandContext";
import { BookingProvider } from "@/app/features/booking/BookingPanel";
import { contentFor } from "@/app/features/clinic/content";
import { ServiceClient } from "./ServiceClient";

type Params = { readonly params: Promise<{ readonly slug: string }> };

/** One static page per service, so each has a URL a search engine can rank. */
export function generateStaticParams(): { slug: string }[] {
    return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { slug } = await params;
    const service = SERVICES.find((item) => item.slug === slug);
    if (!service) return { title: "Not found" };

    const brand = (await siteFromHost((await headers()).get("host"))).brand;
    const title = `${service.name} in ${brand.city} - ${brand.name}`;
    const canonical = `${siteUrl()}/services/${service.slug}`;

    return {
        title,
        description: service.summary,
        alternates: { canonical },
        robots: isIndexable() ? undefined : { index: false, follow: false },
        openGraph: {
            title,
            description: service.summary,
            url: canonical,
            type: "website",
            images: [{ url: `${siteUrl()}/img/consulting.jpg`, width: 1536, height: 864 }],
        },
    };
}

export default async function Page({ params }: Params): Promise<React.JSX.Element> {
    const { slug } = await params;
    const service = SERVICES.find((item) => item.slug === slug);
    if (!service) notFound();

    const site = await siteFromHost((await headers()).get("host"));
    const brand = site.brand;
    const data = serviceJsonLd(slug);

    return (
        <BrandProvider brand={brand} profile={site.profile} content={contentFor(site.profile, brand, site.overrides)}>
            <BookingProvider>
            {data ? <JsonLd data={data} /> : null}
            <ServiceClient service={service} />
            </BookingProvider>
        </BrandProvider>
    );
}

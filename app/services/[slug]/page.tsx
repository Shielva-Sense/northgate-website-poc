import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/app/components/JsonLd";
import { SERVICES } from "@/app/features/clinic/constants";
import { isIndexable, serviceJsonLd, siteUrl } from "@/app/core/seo";
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

    const title = `${service.name} in Manchester — Northgate Family Health`;
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

    const data = serviceJsonLd(slug);

    return (
        <>
            {data ? <JsonLd data={data} /> : null}
            <ServiceClient service={service} />
        </>
    );
}

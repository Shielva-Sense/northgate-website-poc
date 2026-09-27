import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { JsonLd } from "@/app/components/JsonLd";
import { SERVICES } from "@/app/features/clinic/constants";
import { isIndexable, serviceJsonLd, siteUrl } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { ServiceClient } from "./ServiceClient";
import type { Locale } from "@/app/core/locale";

type Params = { readonly params: Promise<{ readonly slug: string; readonly locale: Locale }> };

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

    const data = serviceJsonLd(slug);

    return (
        <>
            {data ? <JsonLd data={data} /> : null}
            <ServiceClient service={service} />
        </>
    );
}

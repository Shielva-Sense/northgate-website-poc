import type { Metadata } from "next";
import { headers } from "next/headers";
import { HomeClient } from "./HomeClient";
import { JsonLd } from "./components/JsonLd";
import { clinicJsonLd, faqJsonLd, isIndexable, siteUrl } from "./core/seo";
import { siteFromHost } from "./core/site";
import { DEFAULT_TEMPLATE, isTemplateId } from "./features/clinic/templates";
import { BrandProvider } from "./features/clinic/BrandContext";
import { contentFor } from "./features/clinic/content";
import { DemoBar } from "./features/clinic/components/DemoBar";

export async function generateMetadata(): Promise<Metadata> {
    const brand = (await siteFromHost((await headers()).get("host"))).brand;
    const canonical = siteUrl();
    return {
        alternates: { canonical },
        robots: isIndexable() ? undefined : { index: false, follow: false },
        openGraph: {
            title: brand.name,
            description: brand.strapline,
            url: canonical,
            type: "website",
            images: [{ url: `${canonical}/img/consultation.jpg`, width: 1800, height: 1016 }],
        },
    };
}

/** Server shell. All interactivity lives in HomeClient. */
type Props = {
    readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: Props): Promise<React.JSX.Element> {
    const site = await siteFromHost((await headers()).get("host"));
    const brand = site.brand;
    /* ?template= lets a client click through all four on one URL. A prospect's
       own subdomain pins a default instead, so the link you send them opens on
       the one you chose for them. */
    const requested = (await searchParams).template;
    const asked = Array.isArray(requested) ? requested[0] : requested;
    const template = isTemplateId(asked) ? asked : DEFAULT_TEMPLATE;
    return (
        <BrandProvider brand={brand} profile={site.profile} content={contentFor(site.profile, brand, site.overrides)}>
            <JsonLd data={clinicJsonLd(brand, site.profile)} />
            <JsonLd data={faqJsonLd()} />
            {/* Sales control: only while this is an invite-only preview. */}
            {isIndexable() ? null : <DemoBar active={template} />}
            <HomeClient template={template} />
        </BrandProvider>
    );
}

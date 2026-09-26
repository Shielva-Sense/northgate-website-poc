import type { Metadata } from "next";
import { headers } from "next/headers";
import { HomeClient } from "./HomeClient";
import { JsonLd } from "@/app/components/JsonLd";
import { clinicJsonLd, faqJsonLd, isIndexable, siteUrl } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { DEFAULT_TEMPLATE, isTemplateId } from "@/app/features/clinic/templates";
import { BrandProvider } from "@/app/features/clinic/BrandContext";
import { BookingProvider } from "@/app/features/booking/BookingPanel";
import { contentFor, mediaFor } from "@/app/features/clinic/content";
import { DemoBar } from "@/app/features/clinic/components/DemoBar";
import { overridesFor } from "@/app/core/locale";
import type { Locale } from "@/app/core/locale";
import { localise } from "@/app/core/content-ar";

export async function generateMetadata(): Promise<Metadata> {
    const site = await siteFromHost((await headers()).get("host"));
    const brand = site.brand;
    const canonical = siteUrl();
    return {
        alternates: { canonical },
        robots: isIndexable() ? undefined : { index: false, follow: false },
        openGraph: {
            title: brand.name,
            description: brand.strapline,
            url: canonical,
            type: "website",
            /* The share card follows the trade too. This is the picture that
               appears when somebody posts the link — and for the veterinary
               practices on this list, Facebook is their entire web presence,
               so it is the first thing their clients would see. A human
               consulting room on a vet's post is the whole problem in one
               image. */
            images: [
                { url: `${canonical}${mediaFor(site.profile.kind).consultation}`, width: 1800, height: 1016 },
            ],
        },
    };
}

/** Server shell. All interactivity lives in HomeClient. */
type Props = {
    readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
    readonly params: Promise<{ readonly locale: Locale }>;
};

export default async function Page({ searchParams, params }: Props): Promise<React.JSX.Element> {
    const { locale } = await params;
    const site = await siteFromHost((await headers()).get("host"));
    const brand = site.brand;
    /* ?template= lets a client click through all four on one URL. A prospect's
       own subdomain pins a default instead, so the link you send them opens on
       the one you chose for them. */
    const requested = (await searchParams).template;
    const asked = Array.isArray(requested) ? requested[0] : requested;
    const template = isTemplateId(asked) ? asked : DEFAULT_TEMPLATE;
    return (
        <BrandProvider brand={brand} profile={localise(site.profile, locale)} content={contentFor(site.profile, brand, overridesFor(site.overrides, site.overridesByLocale, locale), locale)}>
            <BookingProvider>
            <JsonLd data={clinicJsonLd(brand, site.profile)} />
            <JsonLd data={faqJsonLd()} />
            {/* Sales control: only while this is an invite-only preview. */}
            {isIndexable() ? null : <DemoBar active={template} />}
            <HomeClient template={template} />
            </BookingProvider>
        </BrandProvider>
    );
}

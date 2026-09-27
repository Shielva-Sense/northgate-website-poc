import type { Metadata } from "next";
import { PageShell } from "@/app/components/layouts/PageShell";
import { LocaleLink as Link } from "@/app/components/ui/LocaleLink";
import { tr } from "@/app/core/content-ar";
import { headers } from "next/headers";
import { JsonLd } from "@/app/components/JsonLd";
import { isIndexable, serviceJsonLd, siteUrl } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { ServiceClient } from "./ServiceClient";
import type { Locale } from "@/app/core/locale";

type Params = { readonly params: Promise<{ readonly slug: string; readonly locale: Locale }> };

/* This route decides, before it answers, whether the slug is one this
   practice offers — and redirects if it is not. That decision has to happen
   while the status line can still be changed, so the route cannot be
   partially prerendered: with a postponed shell the 200 is already on the
   wire and a later redirect() does nothing but blank the body. The segment
   config in the layout does not reach this far down, so it is declared here.

   No static params. Which services exist is a property of the practice — a
   dentist has fillings, a vet has vaccinations — and that is only known once
   the Host has been resolved, so there is no build-time list to enumerate. */
export const instant = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { slug } = await params;
    const site = await siteFromHost((await headers()).get("host"));
    const service = site.profile.services.find((item) => item.slug === slug);
    if (!service) return { title: "Not found" };

    const brand = site.brand;
    const title = `${service.name} in ${brand.city} - ${brand.name}`;
    const canonical = `${siteUrl()}/services/${service.slug}`;

    return {
        title,
        description: service.blurb,
        alternates: { canonical },
        robots: isIndexable() ? undefined : { index: false, follow: false },
        openGraph: {
            title,
            description: service.blurb,
            url: canonical,
            type: "website",
            images: [{ url: `${siteUrl()}/img/consulting.jpg`, width: 1536, height: 864 }],
        },
    };
}

export default async function Page({ params }: Params): Promise<React.JSX.Element> {
    const { slug } = await params;
    /* The practice's own services. It used to look the slug up in the global
       SERVICES constant, which is a general practice's list: a dental
       practice's /services/fillings — its own service — returned 404, while a
       veterinary clinic happily served a "General practice" page it does not
       offer. */
    const { locale } = await params;
    const site = await siteFromHost((await headers()).get("host"));
    const service = site.profile.services.find((item) => item.slug === slug);
    /* Neither a 404 nor a redirect, but a real page.

       A slug that is not this practice's is almost always a link written for a
       different trade — /services/gp on a hospital, a dental slug on a vet.
       The useful answer is what this practice does offer.

       It is rendered rather than redirected because this route is partially
       prerendered: the 200 and its shell are already on the wire by the time
       the Host is resolved, so a redirect() or notFound() decided here cannot
       change the status line. It only blanked the body — which is exactly the
       empty page a prospect was being shown. */
    if (!service) {
        return (
            <PageShell
                locale={locale}
                kicker={tr("Services", locale)}
                title={tr("Everything we offer", locale)}
                lede={tr("That page is not one of ours, but this is what we do.", locale)}
            >
                <section className="wrap" style={MISS_STYLE}>
                    <ul className="stack stack-3" role="list">
                        {site.profile.services.map((item) => (
                            <li key={item.slug}>
                                <Link href={`/services/${item.slug}`} className="text-bold">
                                    {item.name}
                                </Link>
                                <p className="text-muted">{item.blurb}</p>
                            </li>
                        ))}
                    </ul>
                </section>
            </PageShell>
        );
    }

    const data = serviceJsonLd(slug);

    return (
        <>
            {data ? <JsonLd data={data} /> : null}
            <ServiceClient service={service} />
        </>
    );
}

const MISS_STYLE: React.CSSProperties = { padding: "48px 0 96px" };

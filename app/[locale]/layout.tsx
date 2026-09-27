import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { LOCALES, dirFor, isLocale } from "@/app/core/locale";
import { LocaleProvider } from "@/app/features/clinic/LocaleContext";
import { stringsFor } from "@/app/core/strings";
import { siteFromHost } from "@/app/core/site";
import { DemoRibbon } from "@/app/features/clinic/components/DemoRibbon";
import { DemoBar } from "@/app/features/clinic/components/DemoBar";
import { AnnounceBar } from "@/app/features/clinic/components/AnnounceBar";
import { SiteHeader } from "@/app/features/clinic/components/SiteHeader";
import { SiteFooter } from "@/app/features/clinic/components/SiteFooter";
import { ScrollProgress } from "@/app/features/clinic/components/ScrollProgress";
import { BrandProvider } from "@/app/features/clinic/BrandContext";
import { BookingProvider } from "@/app/features/booking/BookingPanel";
import { contentFor } from "@/app/features/clinic/content";
import { localise } from "@/app/core/content-ar";
import { overridesFor } from "@/app/core/locale";
import { isIndexable } from "@/app/core/seo";

/**
 * The language segment.
 *
 * Locale lives in the route rather than in a header, and that is the whole
 * point. An earlier attempt rewrote `/ar/services` to `/services` and passed
 * the language in a request header — the rewritten request lost both the
 * header and the original Host, so every Arabic page rendered under the
 * default brand instead of the tenant's. Reading the request in the root
 * layout instead would have marked every route dynamic and cost the farm its
 * prerendering.
 *
 * As a static param it is known at build time: no request is read, every
 * route still prerenders, and `dir` is decided before anything paints.
 */

/* Render the whole page on the server before replying, rather than sending a
   shell and streaming the rest in.

   Every byte below the masthead belongs to one specific clinic, resolved from
   the Host header, so the "static" part of a partial prerender was never more
   than a heading on a blank page. Streaming it bought nothing and cost a flash
   on every navigation: the page tore down, app/[locale]/loading.tsx showed a
   full-screen "Getting the practice details" card for the ~0.4s the lookup
   takes, and the real page then replaced it. That loading file is gone, and
   this is what lets it go — `instant: false` is how Cache Components spells a
   blocking route, and it is the honest description of a farm whose every page
   is per-tenant. The cost is time to first byte, which is ~0.4s warm. */
export const instant = false;

export function generateStaticParams(): { locale: string }[] {
    return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params,
}: {
    readonly children: React.ReactNode;
    readonly params: Promise<{ locale: string }>;
}): Promise<React.JSX.Element> {
    const { locale } = await params;
    /* Anything that is not a language we serve is a 404, not a silent fall
       back to English: /foo/services quietly rendering the English site would
       give every page a second address and duplicate the whole farm. */
    if (!isLocale(locale)) notFound();

    /* Resolved once, here, for the whole segment. It used to be resolved by
       PageShell — which every page rendered — so the masthead, the navigation,
       the demo bar and the footer were part of the page rather than the
       layout. In the App Router a layout persists across a navigation and a
       page does not, so every click tore the entire chrome down and built it
       again: the reason the site did not feel like the single-page app it
       actually is. Now only <main> changes. */
    const site = await siteFromHost((await headers()).get("host"));
    const brand = site.brand;
    const content = contentFor(
        site.profile,
        brand,
        overridesFor(site.overrides, site.overridesByLocale, locale),
        locale,
    );

    return (
        <div lang={locale} dir={dirFor(locale)}>
            {/* First focusable element in the language segment, and said in
                that language — a skip link a reader cannot read is a skip link
                that does not work. */}
            <a href="#main-content" className="skip-link">
                {stringsFor(locale).skipToContent}
            </a>
            {/* Not behind Suspense. It was, with a null fallback, which meant
                the page painted without the ribbon and then the ribbon arrived
                and shoved everything down the screen — a visible jolt on every
                load. The segment is a blocking route (`instant` above), so the
                Host read here is allowed to hold the response until it is done
                and the ribbon is in the first paint with everything else. */}
            <DemoRibbon name={brand.name} locale={locale} />
            <LocaleProvider locale={locale}>
                <BrandProvider
                    brand={brand}
                    profile={localise(site.profile, locale)}
                    content={content}
                >
                    <BookingProvider>
                        <ScrollProgress />
                        {isIndexable() ? null : <DemoBar locale={locale} />}
                        <AnnounceBar />
                        <SiteHeader />
                        {children}
                        <SiteFooter />
                    </BookingProvider>
                </BrandProvider>
            </LocaleProvider>
        </div>
    );
}

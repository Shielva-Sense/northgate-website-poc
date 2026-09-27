import { Suspense } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { LOCALES, dirFor, isLocale } from "@/app/core/locale";
import type { Locale } from "@/app/core/locale";
import { LocaleProvider } from "@/app/features/clinic/LocaleContext";
import { stringsFor } from "@/app/core/strings";
import { siteFromHost } from "@/app/core/site";
import { DemoRibbon } from "@/app/features/clinic/components/DemoRibbon";

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

    return (
        <div lang={locale} dir={dirFor(locale)}>
            {/* First focusable element in the language segment, and said in
                that language — a skip link a reader cannot read is a skip link
                that does not work. */}
            <a href="#main-content" className="skip-link">
                {stringsFor(locale).skipToContent}
            </a>
            {/* Behind Suspense because it is the one thing here that reads the
                Host header, and reading it outside a boundary would mark every
                route dynamic and cost the farm its prerendering. */}
            <Suspense fallback={null}>
                <ProposalNotice locale={locale} />
            </Suspense>
            <LocaleProvider locale={locale}>{children}</LocaleProvider>
        </div>
    );
}

/** Names the clinic on the demo ribbon; the one Host read in this layout. */
async function ProposalNotice({ locale }: { readonly locale: Locale }): Promise<React.JSX.Element> {
    const site = await siteFromHost((await headers()).get("host"));
    return <DemoRibbon name={site.brand.name} locale={locale} />;
}

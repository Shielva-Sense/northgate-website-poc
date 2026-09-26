import { notFound } from "next/navigation";
import { LOCALES, dirFor, isLocale } from "@/app/core/locale";
import { LocaleProvider } from "@/app/features/clinic/LocaleContext";

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
            <LocaleProvider locale={locale}>{children}</LocaleProvider>
        </div>
    );
}

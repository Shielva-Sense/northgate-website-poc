import type { Metadata } from "next";
import { headers } from "next/headers";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { PageShell } from "@/app/components/layouts/PageShell";
import type { Locale } from "@/app/core/locale";
import { PriceTable } from "./PriceTable";
import { tr } from "@/app/core/content-ar";

export async function generateMetadata(): Promise<Metadata> {
    const brand = (await siteFromHost((await headers()).get("host"))).brand;
    return {
        title: `Our prices — ${brand.name}`,
        description:
            "Our standard service prices, by the size of your pet, published in full.",
        alternates: { canonical: `${siteUrl()}/prices` },
        robots: isIndexable() ? undefined : { index: false, follow: false },
    };
}

/**
 * The price list, at its own address.
 *
 * A page rather than a section on /services, because the CMA Order requires
 * the list to be reachable in one click from the home page and visible
 * without hunting for it. A section halfway down another page satisfies
 * neither.
 */
export default async function Page({
    params,
}: {
    readonly params: Promise<{ readonly locale: Locale }>;
}): Promise<React.JSX.Element> {
    const { locale } = await params;
    return (
        <PageShell
            locale={locale}
            kicker={tr("Our prices", locale)}
            title={tr("Every standard price, published", locale)}
            imageKey="reception"
            imageAlt="A practice reception desk with daylight from a window behind it"
        >
            <PriceTable locale={locale} />
        </PageShell>
    );
}

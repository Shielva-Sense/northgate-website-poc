import type { Metadata } from "next";
import { headers } from "next/headers";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { PageShell } from "@/app/components/layouts/PageShell";
import { PriceTable } from "./PriceTable";

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
export default function Page(): React.JSX.Element {
    return (
        <PageShell
            kicker="Our prices"
            title="Every standard price, published"
            imageKey="reception"
            imageAlt="A practice reception desk with daylight from a window behind it"
        >
            <PriceTable />
        </PageShell>
    );
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { PageShell } from "@/app/components/layouts/PageShell";
import { ServicesCatalogue } from "./ServicesCatalogue";

export async function generateMetadata(): Promise<Metadata> {
    const brand = (await siteFromHost((await headers()).get("host"))).brand;
    return {
        title: `Services — ${brand.name}`,
        description:
            "Every speciality, treatment and service in one place, each routing to the clinicians who provide it.",
        alternates: { canonical: `${siteUrl()}/services` },
        robots: isIndexable() ? undefined : { index: false, follow: false },
    };
}

export default function Page(): React.JSX.Element {
    return (
        <PageShell
            kicker="Services"
            title="Everything we offer"
            lede="Three ways in: by the department you think you need, by the treatment you have been told to have, or by the practical thing you are after."
            imageKey="consulting"
            imageAlt="A consulting room with two chairs turned toward each other and daylight from a tall window"
        >
            <ServicesCatalogue />
        </PageShell>
    );
}

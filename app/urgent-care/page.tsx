import type { Metadata } from "next";
import { headers } from "next/headers";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { resolveBrand } from "@/app/features/clinic/brands";
import { PageShell } from "@/app/components/layouts/PageShell";
import { UrgentClient } from "./UrgentClient";

export async function generateMetadata(): Promise<Metadata> {
    const brand = resolveBrand((await headers()).get("host"));
    return {
        title: `Urgent care — walk in today | ${brand.name}`,
        description:
            "Search what has happened and come straight in. No slot to pick, no callback — the desk is told you are on your way.",
        alternates: { canonical: `${siteUrl()}/urgent-care` },
        robots: isIndexable() ? undefined : { index: false, follow: false },
    };
}

export default function Page(): React.JSX.Element {
    return (
        <PageShell
            kicker="Urgent and emergency care"
            title="Something that will not wait"
            lede="Tell us what has happened and we will show you which door to come to. Our emergency department is open 24 hours, and urgent care is walk-in — so there is no slot to choose either way."
            image="/img/exterior.jpg"
            imageAlt="The lit entrance of the hospital at dusk, with the way in clearly signed"
        >
            <div className="wrap">
                <UrgentClient />
            </div>
        </PageShell>
    );
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { PageShell } from "@/app/components/layouts/PageShell";
import { FindDoctorClient } from "./FindDoctorClient";
import styles from "./FindDoctor.module.scss";

export async function generateMetadata(): Promise<Metadata> {
    const brand = (await siteFromHost((await headers()).get("host"))).brand;
    return {
        title: `Find a doctor — ${brand.name}`,
        description:
            "Every clinician, what they cost, the languages they speak and the next time they are free.",
        alternates: { canonical: `${siteUrl()}/find-a-doctor` },
        robots: isIndexable() ? undefined : { index: false, follow: false },
    };
}

/**
 * This page used to assemble its own chrome — provider, announce bar, header,
 * footer — which is the duplication PageShell exists to stop. It also meant the
 * one page missing a hero image and the demo bar was this one.
 */
export default function Page(): React.JSX.Element {
    return (
        <PageShell
            kicker="Our clinicians"
            title="Find a doctor"
            lede="Nine clinicians, what each one costs, the languages they speak and the next time they are actually free. Filter to what matters to you — or, if you are not sure who you need, answer a few questions instead."
            image="/img/corridor.jpg"
            imageAlt="A bright clinic corridor lined with consulting room doors in pale oak"
        >
            <div className={`wrap ${styles.page}`}>
                <div className={styles.body}>
                    <FindDoctorClient />
                </div>
            </div>
        </PageShell>
    );
}

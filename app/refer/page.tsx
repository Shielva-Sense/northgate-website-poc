import type { Metadata } from "next";
import { headers } from "next/headers";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { PageShell } from "@/app/components/layouts/PageShell";
import { ReferClient } from "./ReferClient";
import styles from "./Refer.module.scss";

export async function generateMetadata(): Promise<Metadata> {
    const brand = (await siteFromHost((await headers()).get("host"))).brand;
    return {
        title: `Refer a patient — ${brand.name}`,
        description:
            "For clinicians referring a patient. We contact them directly and write back to you once they have been seen.",
        alternates: { canonical: `${siteUrl()}/refer` },
        robots: isIndexable() ? undefined : { index: false, follow: false },
    };
}

export default function Page(): React.JSX.Element {
    return (
        <PageShell
            kicker="For clinicians"
            title="Let's share the care"
            lede="Send us a referral and we take it from there: we contact the patient directly to offer a time, and write back to you once they have been seen. Urgent referrals are picked up the same working day."
            image="/img/treatment.jpg"
            imageAlt="A treatment room prepared and empty, with equipment neatly stowed"
        >
            <section className={styles.section}>
                <div className="wrap">
                    <ReferClient />
                </div>
            </section>
        </PageShell>
    );
}

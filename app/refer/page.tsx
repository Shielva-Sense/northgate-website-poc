import type { Metadata } from "next";
import { headers } from "next/headers";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { resolveBrand } from "@/app/features/clinic/brands";
import { PageShell } from "@/app/components/layouts/PageShell";
import { ReferClient } from "./ReferClient";
import styles from "./Refer.module.scss";

export async function generateMetadata(): Promise<Metadata> {
    const brand = resolveBrand((await headers()).get("host"));
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
        >
            <section className={styles.section}>
                <div className="wrap">
                    <ReferClient />
                </div>
            </section>
        </PageShell>
    );
}

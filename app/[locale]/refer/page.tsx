import type { Metadata } from "next";
import { headers } from "next/headers";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { PageShell } from "@/app/components/layouts/PageShell";
import type { Locale } from "@/app/core/locale";
import { ReferClient } from "./ReferClient";
import styles from "./Refer.module.scss";
import { tr } from "@/app/core/content-ar";

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

export default async function Page({
    params,
}: {
    readonly params: Promise<{ readonly locale: Locale }>;
}): Promise<React.JSX.Element> {
    const { locale } = await params;
    return (
        <PageShell
            locale={locale}
            kicker={tr("For clinicians", locale)}
            title={tr("Let's share the care", locale)}
            lede={tr("Send us a referral and we take it from there: we contact the patient directly to offer a time, and write back to you once they have been seen. Urgent referrals are picked up the same working day.", locale)}
            imageKey="treatment"
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

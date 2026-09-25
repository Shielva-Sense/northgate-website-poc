import type { Metadata } from "next";
import { headers } from "next/headers";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { resolveBrand } from "@/app/features/clinic/brands";
import { PageShell } from "@/app/components/layouts/PageShell";
import { Faq } from "@/app/features/clinic/components/Faq";
import { ContactClient } from "./ContactClient";
import styles from "./Contact.module.scss";

export async function generateMetadata(): Promise<Metadata> {
    const brand = resolveBrand((await headers()).get("host"));
    return {
        title: `Contact — ${brand.name}`,
        description: "WhatsApp, phone or a message. Whichever you would rather use.",
        alternates: { canonical: `${siteUrl()}/contact` },
        robots: isIndexable() ? undefined : { index: false, follow: false },
    };
}

export default function Page(): React.JSX.Element {
    return (
        <PageShell
            kicker="Contact"
            title="Three ways to reach us"
            lede="Use whichever you would rather. All three reach the same reception desk, and all three are answered by a person."
        >
            <section className={styles.section}>
                <div className="wrap">
                    <ContactClient />
                </div>
            </section>
            <Faq />
        </PageShell>
    );
}

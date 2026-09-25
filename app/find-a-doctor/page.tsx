import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { resolveBrand } from "@/app/features/clinic/brands";
import { BrandProvider } from "@/app/features/clinic/BrandContext";
import { AnnounceBar } from "@/app/features/clinic/components/AnnounceBar";
import { SiteHeader } from "@/app/features/clinic/components/SiteHeader";
import { SiteFooter } from "@/app/features/clinic/components/SiteFooter";
import { FindDoctorClient } from "./FindDoctorClient";
import styles from "./FindDoctor.module.scss";

export async function generateMetadata(): Promise<Metadata> {
    const brand = resolveBrand((await headers()).get("host"));
    return {
        title: `Not sure who to see? — ${brand.name}`,
        description:
            "Tell us what it is about and we will point you at the right department, then show you who is free.",
        alternates: { canonical: `${siteUrl()}/find-a-doctor` },
        robots: isIndexable() ? undefined : { index: false, follow: false },
    };
}

export default async function Page(): Promise<React.JSX.Element> {
    const brand = resolveBrand((await headers()).get("host"));

    return (
        <BrandProvider brand={brand}>
            <AnnounceBar />
            <SiteHeader />
            <main id="main-content" tabIndex={-1}>
                <div className={`wrap ${styles.page}`}>
                    <p className={styles.routed}>
                        <Link href="/">
                            <ArrowLeft size={14} aria-hidden="true" />
                            {brand.name}
                        </Link>
                    </p>
                    <h1 className={styles.h1}>Not sure who to see?</h1>
                    <p className={styles.lede}>
                        A few short questions — who it is for, where it hurts, how long and how
                        bad — and we will point you at the department that usually sees it, then
                        show you who is free. About a minute, and you can go back at any point.
                    </p>
                    <div className={styles.body}>
                        <FindDoctorClient />
                    </div>
                </div>
            </main>
            <SiteFooter />
        </BrandProvider>
    );
}

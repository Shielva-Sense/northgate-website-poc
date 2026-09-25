import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { isIndexable } from "@/app/core/seo";
import { resolveBrand } from "@/app/features/clinic/brands";
import { BrandProvider } from "@/app/features/clinic/BrandContext";
import { SiteFooter } from "@/app/features/clinic/components/SiteFooter";
import { TEMPLATES } from "@/app/features/clinic/templates";
import styles from "./Templates.module.scss";

export async function generateMetadata(): Promise<Metadata> {
    const brand = resolveBrand((await headers()).get("host"));
    return {
        title: `Choose a layout — ${brand.name}`,
        description: "Four running orders for the same site. Pick the one that fits the practice.",
        // Never index the chooser: it is a sales surface, not a page for patients.
        robots: { index: false, follow: false },
    };
}

export default async function Page(): Promise<React.JSX.Element> {
    const brand = resolveBrand((await headers()).get("host"));
    const indexable = isIndexable();

    return (
        <BrandProvider brand={brand}>
            <main id="main-content" tabIndex={-1} className={styles.page}>
                <div className="wrap">
                    <p className={styles.kicker}>
                        <Layers size={15} aria-hidden="true" />
                        Layouts
                    </p>
                    <h1 className={styles.h1}>Same site, four running orders</h1>
                    <p className={styles.lede}>
                        Every layout below is the same build — the same booking flow, the same
                        content, the same code. What changes is what a visitor meets first, which
                        is the part that actually differs between a family practice, a hospital and
                        a single-procedure clinic. Pick one and we set it as the default; switching
                        later is a one-line change, not a rebuild.
                    </p>

                    <ul className={styles.grid} role="list">
                        {TEMPLATES.map((template) => (
                            <li key={template.id} className={styles.card}>
                                <p className={styles.tagline}>{template.tagline}</p>
                                <h2 className={styles.name}>{template.name}</h2>
                                <p className={styles.suits}>{template.suits}</p>
                                <p className={styles.rationale}>{template.rationale}</p>

                                <p className={styles.orderLabel}>Running order</p>
                                <ol className={styles.order}>
                                    {template.sections.slice(0, 6).map((section) => (
                                        <li key={section}>{section}</li>
                                    ))}
                                    <li className={styles.more}>
                                        +{template.sections.length - 6} more
                                    </li>
                                </ol>

                                <Link
                                    className={styles.preview}
                                    href={`/?template=${template.id}`}
                                    prefetch={false}
                                >
                                    Preview this layout
                                    <ArrowRight size={16} aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <p className={styles.note}>
                        {indexable
                            ? "This page is not indexed."
                            : "This whole build is invite-only and not indexed."}{" "}
                        Each prospect can have their own subdomain, brand name, palette and icon —
                        that costs a DNS record, not a deploy.
                    </p>
                </div>
            </main>
            <SiteFooter />
        </BrandProvider>
    );
}

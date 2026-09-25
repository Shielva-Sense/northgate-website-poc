import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { resolveBrand } from "@/app/features/clinic/brands";
import { PageShell } from "@/app/components/layouts/PageShell";
import { ARTICLES, ARTICLE_TOPICS } from "@/app/features/clinic/catalogue";
import styles from "./Library.module.scss";

export async function generateMetadata(): Promise<Metadata> {
    const brand = resolveBrand((await headers()).get("host"));
    return {
        title: `Health library — ${brand.name}`,
        description:
            "Plain-language information about common conditions, written to help you decide whether to come in.",
        alternates: { canonical: `${siteUrl()}/health-library` },
        robots: isIndexable() ? undefined : { index: false, follow: false },
    };
}

export default async function Page(): Promise<React.JSX.Element> {
    return (
        <PageShell
            kicker="Health library"
            title="Written to be read, not to rank"
            lede="Plain-language information about the things we are asked about most. Every article ends with when to stop reading and speak to a person."
        >
            <section className={styles.section}>
                <div className="wrap">
                    {ARTICLE_TOPICS.map((topic) => (
                        <div key={topic} className={styles.topic}>
                            <h2 className={styles.topicTitle}>{topic}</h2>
                            <ul className={styles.cards} role="list">
                                {ARTICLES.filter((article) => article.topic === topic).map(
                                    (article) => (
                                        <li key={article.slug} className={styles.card}>
                                            <h3 className={styles.cardTitle}>
                                                <Link href={`/health-library/${article.slug}`}>
                                                    {article.title}
                                                </Link>
                                            </h3>
                                            <p className={styles.cardBody}>{article.summary}</p>
                                        </li>
                                    ),
                                )}
                            </ul>
                        </div>
                    ))}

                    <p className={styles.disclaimer}>
                        This library is general information. It is not medical advice, it cannot
                        account for your history, and nothing in it replaces being seen by someone
                        who can examine you.
                    </p>
                </div>
            </section>
        </PageShell>
    );
}

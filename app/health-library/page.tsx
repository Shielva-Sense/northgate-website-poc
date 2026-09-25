import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { PageShell } from "@/app/components/layouts/PageShell";
import { ARTICLES, ARTICLE_TOPICS } from "@/app/features/clinic/catalogue";
import styles from "./Library.module.scss";

export async function generateMetadata(): Promise<Metadata> {
    const brand = (await siteFromHost((await headers()).get("host"))).brand;
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
            image="/img/consultation.jpg"
            imageAlt="A clinician and a patient talking across a desk, both leaning in"
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
                                                <Link
                                                    className={styles.cardLink}
                                                    href={`/health-library/${article.slug}`}
                                                >
                                                    <span className={styles.cardShot}>
                                                        <Image
                                                            src={article.image}
                                                            alt=""
                                                            width={1200}
                                                            height={800}
                                                            sizes="(min-width: 720px) 340px, 90vw"
                                                            className={styles.cardImg}
                                                        />
                                                    </span>
                                                    <span className={styles.cardBodyWrap}>
                                                        <span className={styles.cardTitle}>
                                                            {article.title}
                                                        </span>
                                                        <span className={styles.cardBody}>
                                                            {article.summary}
                                                        </span>
                                                        <span className={styles.cardGo}>
                                                            Read this
                                                            <ArrowRight
                                                                size={15}
                                                                aria-hidden="true"
                                                            />
                                                        </span>
                                                    </span>
                                                </Link>
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

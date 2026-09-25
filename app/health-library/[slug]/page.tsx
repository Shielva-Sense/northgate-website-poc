import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { PageShell } from "@/app/components/layouts/PageShell";
import { ARTICLES, articleBySlug } from "@/app/features/clinic/catalogue";
import { departmentById } from "@/app/features/clinic/care";
import styles from "../Library.module.scss";

type Params = { readonly params: Promise<{ readonly slug: string }> };

export function generateStaticParams(): { slug: string }[] {
    return ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { slug } = await params;
    const article = articleBySlug(slug);
    if (article === undefined) return { title: "Not found" };
    const brand = (await siteFromHost((await headers()).get("host"))).brand;
    return {
        title: `${article.title} — ${brand.name}`,
        description: article.summary,
        alternates: { canonical: `${siteUrl()}/health-library/${article.slug}` },
        robots: isIndexable() ? undefined : { index: false, follow: false },
    };
}

export default async function Page({ params }: Params): Promise<React.JSX.Element> {
    const { slug } = await params;
    const article = articleBySlug(slug);
    if (article === undefined) notFound();
    const department = departmentById(article.department);

    return (
        <PageShell kicker={article.topic} title={article.title} lede={article.summary}>
            <section className={styles.section}>
                <div className={`wrap ${styles.articleWrap}`}>
                    <article className={styles.article}>
                        {article.sections.map((section) => (
                            <div key={section.heading}>
                                <h2 className={styles.h2}>{section.heading}</h2>
                                <p className={styles.body}>{section.body}</p>
                            </div>
                        ))}

                        {/* The point of the whole page. Deliberately not at the bottom
                            of a long scroll, and deliberately the loudest thing here. */}
                        <div className={styles.redFlags}>
                            <h2 className={styles.redTitle}>
                                <AlertTriangle size={19} aria-hidden="true" />
                                Speak to someone if
                            </h2>
                            <ul role="list">
                                {article.seeSomeoneIf.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <p className={styles.disclaimer}>
                            General information only. It is not medical advice, it cannot account
                            for your history, and it does not replace being seen by someone who can
                            examine you. If you are worried, that is reason enough to ring us.
                        </p>
                    </article>

                    <aside className={styles.aside}>
                        <p className={styles.asideKicker}>Usually seen by</p>
                        <h2 className={styles.asideTitle}>{department?.name ?? "General medicine"}</h2>
                        <p className={styles.cardBody}>{department?.summary}</p>
                        <Link className={styles.asideCta} href="/find-a-doctor">
                            See who is available
                        </Link>
                        <Link className={styles.asideBack} href="/health-library">
                            <ArrowLeft size={14} aria-hidden="true" />
                            All articles
                        </Link>
                    </aside>
                </div>
            </section>
        </PageShell>
    );
}

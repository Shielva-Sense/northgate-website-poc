import type { Metadata } from "next";
import { headers } from "next/headers";
import { LocaleLink as Link } from "@/app/components/ui/LocaleLink";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { PageShell } from "@/app/components/layouts/PageShell";
import type { Locale } from "@/app/core/locale";
import { contentFor } from "@/app/features/clinic/content";
import { EmptyLibrary } from "./EmptyLibrary";
import styles from "./Library.module.scss";
import { overridesFor } from "@/app/core/locale";
import { tr } from "@/app/core/content-ar";

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

export default async function Page({
    params,
}: {
    readonly params: Promise<{ readonly locale: Locale }>;
}): Promise<React.JSX.Element> {
    const { locale } = await params;
    const site = await siteFromHost((await headers()).get("host"));
    const { articles } = contentFor(site.profile, site.brand, overridesFor(site.overrides, site.overridesByLocale, locale), locale);
    /* Topics come from the articles this practice actually has, not from the
       full built-in list — otherwise a dental site printed six empty headings
       above nothing. */
    const topics = [...new Set(articles.map((article) => article.topic))];

    return (
        <PageShell
            locale={locale}
            kicker={tr("Health library", locale)}
            title={tr("Written to be read, not to rank", locale)}
            lede={tr("Plain-language information about the things we are asked about most. Every article ends with when to stop reading and speak to a person.", locale)}
            imageKey="consultation"
            imageAlt="A clinician and a patient talking across a desk, both leaning in"
        >
            <section className={styles.section}>
                <div className="wrap">
                    {articles.length === 0 ? <EmptyLibrary locale={locale} /> : null}
                    {topics.map((topic) => (
                        <div key={topic} className={styles.topic}>
                            <h2 className={styles.topicTitle}>{topic}</h2>
                            <ul className={styles.cards} role="list">
                                {articles.filter((article) => article.topic === topic).map(
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
                                                            {tr("Read this", locale)}
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

                    <p className={styles.disclaimer}>{tr("This library is general information. It is not medical advice, it cannot account for your history, and nothing in it replaces being seen by someone who can examine you.", locale)}</p>
                </div>
            </section>
        </PageShell>
    );
}

import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isIndexable, siteUrl } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { PageShell } from "@/app/components/layouts/PageShell";
import type { Locale } from "@/app/core/locale";
import { pageBySlug } from "@/app/features/clinic/pages";
import type { CustomPage } from "@/app/features/clinic/pages";
import styles from "./Custom.module.scss";

/**
 * A page this clinic was given, rendered from its registry row.
 *
 * The template carries the pages a practice usually needs. A given practice
 * needs one it does not — a fees page, a new-patient guide, a list of
 * insurers — and the whole point of the registry is that this must not need a
 * build. So the row may carry pages, and this renders them.
 *
 * It sits last in the routing order, so it can never shadow a real route: if
 * /services exists as a file, Next serves that and this is never consulted.
 * The API refuses a slug that collides anyway, so the failure is caught when
 * the page is created rather than when someone opens it.
 *
 * Everything rendered here is text. Blocks carry headings, paragraphs and
 * bullets, and React escapes all of it — content arriving from a database is
 * not markup, and treating it as markup would make the registry an XSS vector
 * against a page carrying a real clinic's name.
 */

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string; locale: Locale }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const site = await siteFromHost((await headers()).get("host"));
    const page = pageBySlug(site.pages, slug);
    if (page === undefined) return { title: site.brand.name };

    return {
        title: `${page.title} — ${site.brand.name}`,
        ...(page.lede === undefined ? {} : { description: page.lede }),
        alternates: { canonical: `${siteUrl()}/${page.slug}` },
        robots: isIndexable() ? undefined : { index: false, follow: false },
    };
}

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string; locale: Locale }>;
}): Promise<React.JSX.Element> {
    const { slug, locale } = await params;
    const site = await siteFromHost((await headers()).get("host"));
    const page = pageBySlug(site.pages, slug);

    /* A 404 here is correct and reachable: this route is fully dynamic — it
       has to read the host and the database to know whether the page exists —
       so unlike the prerendered routes there is no static shell already sent
       with a 200. */
    if (page === undefined) notFound();

    return (
        <PageShell
            locale={locale}
            title={page.title}
            {...(page.kicker === undefined ? {} : { kicker: page.kicker })}
            {...(page.lede === undefined ? {} : { lede: page.lede })}
        >
            <Blocks page={page} />
        </PageShell>
    );
}

function Blocks({ page }: { readonly page: CustomPage }): React.JSX.Element {
    return (
        <section className={styles.section}>
            <div className="wrap">
                <div className={styles.prose}>
                    {page.blocks.map((block, index) => (
                        <div
                            /* Index is stable: blocks are an ordered document,
                               never reordered or filtered after they are read. */
                            key={index}
                            className={styles.block}
                        >
                            {block.heading === undefined ? null : (
                                <h2 className={styles.h2}>{block.heading}</h2>
                            )}
                            {(block.body ?? []).map((paragraph, i) => (
                                <p className={styles.p} key={i}>
                                    {paragraph}
                                </p>
                            ))}
                            {block.bullets === undefined ? null : (
                                <ul className={styles.list} role="list">
                                    {block.bullets.map((bullet, i) => (
                                        <li key={i}>{bullet}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}

                    {page.cta === undefined ? null : (
                        <p className={styles.cta}>
                            <Link className={styles.ctaLink} href={page.cta.href}>
                                {page.cta.label}
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}

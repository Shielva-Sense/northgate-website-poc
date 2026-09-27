import type { Metadata } from "next";
import { headers } from "next/headers";
import { LocaleLink as Link } from "@/app/components/ui/LocaleLink";
import { ArrowRight, Layers } from "lucide-react";
import { isIndexable } from "@/app/core/seo";
import { siteFromHost } from "@/app/core/site";
import { ThemePicker } from "@/app/features/clinic/components/ThemePicker";
import { designVars, TEMPLATES } from "@/app/features/clinic/templates";
import styles from "./Templates.module.scss";
import type { Locale } from "@/app/core/locale";
import { localise, tr } from "@/app/core/content-ar";
import { ViewTransition } from "react";

export async function generateMetadata(): Promise<Metadata> {
    const brand = (await siteFromHost((await headers()).get("host"))).brand;
    return {
        title: `Choose a layout — ${brand.name}`,
        description:
            "Four running orders and eight palettes for the same site. Pick what fits the practice.",
        // Never index the chooser: it is a sales surface, not a page for patients.
        robots: { index: false, follow: false },
    };
}

export default async function Page({
    params,
}: {
    readonly params: Promise<{ readonly locale: Locale }>;
}): Promise<React.JSX.Element> {
    const { locale } = await params;
    const indexable = isIndexable();

    return (
        <>
            <ViewTransition default="page">
            <main id="main-content" tabIndex={-1} className={styles.page}>
                <div className="wrap">
                    <p className={styles.kicker}>
                        <Layers size={15} aria-hidden="true" />{tr("Layouts", locale)}</p>
                    <h1 className={styles.h1}>{tr("Same site, your layout and your colours", locale)}</h1>
                    <p className={styles.lede}>{tr("Every layout below is the same build — the same booking flow, the same content, the same code. What changes is what a visitor meets first, which is the part that actually differs between a family practice, a hospital and a single-procedure clinic. Pick one and we set it as the default; switching later is a one-line change, not a rebuild.", locale)}</p>

                    <ul className={styles.grid} role="list">
                        {localise(TEMPLATES, locale).map((template) => (
                            <li
                                key={template.id}
                                className={styles.card}
                                style={designVars(template.id) as React.CSSProperties}
                            >
                                {/* A miniature of the page itself, drawn in that
                                    template's own corner radius and heading face, so
                                    the card shows the design rather than describing
                                    it. Decorative — the running order is listed in
                                    text below for anyone who cannot see it. */}
                                <div className={styles.preview} aria-hidden="true">
                                    <div className={styles.previewChrome}>
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                    <div className={styles.previewBody}>
                                        {template.sections.slice(0, 7).map((section, index) => (
                                            <span
                                                key={section}
                                                className={styles.band}
                                                data-band={section}
                                                data-first={index === 0 ? "" : undefined}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <p className={styles.tagline}>{template.tagline}</p>
                                <h2 className={styles.name}>{template.name}</h2>
                                <p className={styles.suits}>{template.suits}</p>
                                <p className={styles.rationale}>{template.rationale}</p>

                                <dl className={styles.specs}>
                                    <div>
                                        <dt>{tr("Corners", locale)}</dt>
                                        <dd>{template.design.radius}</dd>
                                    </div>
                                    <div>
                                        <dt>{tr("Headings", locale)}</dt>
                                        <dd>{template.design.display}</dd>
                                    </div>
                                    <div>
                                        <dt>{tr("Hero", locale)}</dt>
                                        <dd>{template.design.heroStyle}</dd>
                                    </div>
                                </dl>

                                <p className={styles.orderLabel}>
                                    {tr("Running order:", locale)}{" "}
                                    {template.sections
                                        .slice(0, 5)
                                        .map((section) => tr(section, locale))
                                        .join(" · ")}{" "}
                                    + {template.sections.length - 5} {tr("more", locale)}
                                </p>

                                <Link
                                    className={styles.cta}
                                    href={`/?template=${template.id}`}
                                    prefetch={false}
                                >
                                    {tr("Preview this layout", locale)}
                                    <ArrowRight size={16} aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Layout and colour are the two things a practice actually
                        wants to choose, so they belong on the same page. */}
                    <ThemePicker />

                    <p className={styles.note}>
                        {tr(
                            indexable
                                ? "This page is not indexed."
                                : "This whole build is invite-only and not indexed.",
                            locale,
                        )}{" "}
                        {tr(
                            "Each prospect can have their own subdomain, brand name, palette and icon — that costs a DNS record, not a deploy.",
                            locale,
                        )}
                    </p>
                </div>
            </main>
            </ViewTransition>
        </>
    );
}

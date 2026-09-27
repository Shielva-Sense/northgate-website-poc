import { headers } from "next/headers";
import Image from "next/image";
import { siteFromHost } from "@/app/core/site";
import { mediaFor } from "@/app/features/clinic/content";
import type { SiteMedia } from "@/app/features/clinic/content";
import type { Locale } from "@/app/core/locale";
import { tr } from "@/app/core/content-ar";
import styles from "./PageShell.module.scss";
import { ViewTransition } from "react";

interface ShellProps {
    /** Which language this page is being read in, from the route param. */
    readonly locale: Locale;
    readonly title: string;
    readonly lede?: string | undefined;
    readonly kicker?: string | undefined;
    /** Hero image. A page header of flat colour and type read as unfinished. */
    readonly image?: string | undefined;
    /**
     * Which of this practice's photographs to use, rather than a path.
     * A veterinary site has its own; naming the role lets the shell pick.
     */
    readonly imageKey?: keyof SiteMedia | undefined;
    readonly imageAlt?: string | undefined;
    readonly children: React.ReactNode;
}

/**
 * Brand resolution plus the site chrome, in one place.
 *
 * Four pages were each repeating the provider, the announce bar, the header
 * and the footer. That is exactly the duplication that drifts — one page ends
 * up with a stale nav and nobody notices until a prospect does.
 *
 * Prerendering: the tenant is decided by the Host header, and reading headers()
 * opts a segment out of static generation, which is why every route was `ƒ`.
 * The documented Cache Components shape is to read the header outside any
 * cached scope, behind a Suspense boundary, and pass the value in as an
 * argument — so the host is lifted here and the whole branded render is cached
 * per host. The first request for a given host renders it; every later one is
 * served from cache, which is what "prerendered" means for a site whose output
 * legitimately differs per tenant.
 */
export async function PageShell(props: ShellProps): Promise<React.JSX.Element> {
    const host = (await headers()).get("host") ?? "";
    return <CachedShell host={host} {...props} />;
}

async function CachedShell({
    host,
    locale,
    title,
    lede,
    kicker,
    image,
    imageKey,
    imageAlt,
    children,
}: ShellProps & { readonly host: string }): Promise<React.JSX.Element> {
    "use cache";
    const site = await siteFromHost(host);
    const shot = imageKey === undefined ? image : mediaFor(site.profile.kind)[imageKey];

    return (
        /* The page content, and only the page content, is a view transition.
        
           The chrome above and below it is anchored by a fixed
           `view-transition-name` in globals.scss, so the masthead does not slide with
           the page — a header that moves takes away the one fixed point a reader uses
           to understand that the *content* changed rather than the whole window.
           React runs these on route navigations automatically, and a browser without
           the View Transitions API simply swaps as before. */
        <ViewTransition default="page">
            <main id="main-content" tabIndex={-1}>
            <Head
                title={tr(title, locale)}
                lede={lede === undefined ? undefined : tr(lede, locale)}
                kicker={kicker === undefined ? undefined : tr(kicker, locale)}
                image={shot}
                imageAlt={imageAlt}
            />
            {children}
        </main>
            </ViewTransition>
    );
}

function Head({
    title,
    lede,
    kicker,
    image,
    imageAlt,
}: Omit<ShellProps, "children" | "locale" | "imageKey">): React.JSX.Element {
    return (
        <header className={styles.head}>
            <div className={`wrap ${image === undefined ? "" : styles.split}`}>
                <div className={styles.copy}>
                    {kicker === undefined ? null : <p className={styles.kicker}>{kicker}</p>}
                    <h1 className={styles.h1}>{title}</h1>
                    {lede === undefined ? null : <p className={styles.lede}>{lede}</p>}
                </div>
                {image === undefined ? null : (
                    <div className={styles.shot}>
                        <Image
                            src={image}
                            alt={imageAlt ?? ""}
                            width={1400}
                            height={1000}
                            priority
                            sizes="(min-width: 900px) 46vw, 100vw"
                            className={styles.shotImg}
                        />
                    </div>
                )}
            </div>
        </header>
    );
}

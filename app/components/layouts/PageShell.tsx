import { Suspense } from "react";
import { headers } from "next/headers";
import Image from "next/image";
import { siteFromHost } from "@/app/core/site";
import { contentFor } from "@/app/features/clinic/content";
import { BrandProvider } from "@/app/features/clinic/BrandContext";
import { BookingProvider } from "@/app/features/booking/BookingPanel";
import { AnnounceBar } from "@/app/features/clinic/components/AnnounceBar";
import { SiteHeader } from "@/app/features/clinic/components/SiteHeader";
import { SiteFooter } from "@/app/features/clinic/components/SiteFooter";
import { ScrollProgress } from "@/app/features/clinic/components/ScrollProgress";
import { DemoBar } from "@/app/features/clinic/components/DemoBar";
import { isIndexable } from "@/app/core/seo";
import styles from "./PageShell.module.scss";

interface ShellProps {
    readonly title: string;
    readonly lede?: string | undefined;
    readonly kicker?: string | undefined;
    /** Hero image. A page header of flat colour and type read as unfinished. */
    readonly image?: string | undefined;
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
export function PageShell(props: ShellProps): React.JSX.Element {
    return (
        <Suspense fallback={<ShellFallback {...props} />}>
            <ResolveHost {...props} />
        </Suspense>
    );
}

/** The only uncached thing here: one header read. */
async function ResolveHost(props: ShellProps): Promise<React.JSX.Element> {
    const host = (await headers()).get("host") ?? "";
    return <CachedShell host={host} {...props} />;
}

async function CachedShell({
    host,
    title,
    lede,
    kicker,
    image,
    imageAlt,
    children,
}: ShellProps & { readonly host: string }): Promise<React.JSX.Element> {
    "use cache";
    const site = await siteFromHost(host);
    const brand = site.brand;
    const content = contentFor(site.profile, brand, site.overrides);

    return (
        <BrandProvider brand={brand} profile={site.profile} content={content}>
            <BookingProvider>
            <ScrollProgress />
            {/* The colour switcher has to be reachable from whatever page a
                prospect happens to be on, not only the home page. Gated on the
                invite build, like the rest of the demo furniture. */}
            {isIndexable() ? null : <DemoBar />}
            <AnnounceBar />
            <SiteHeader hasEmergency={site.profile.hasEmergency} />
            <main id="main-content" tabIndex={-1}>
                <Head title={title} lede={lede} kicker={kicker} image={image} imageAlt={imageAlt} />
                {children}
            </main>
            <SiteFooter />
            </BookingProvider>
        </BrandProvider>
    );
}

/**
 * What the static shell shows while the host resolves.
 *
 * It is the page header with its real text and image — all of which are known
 * without knowing the tenant — so the first paint is the actual page rather
 * than a spinner, and only the chrome arrives a beat later.
 */
function ShellFallback({ title, lede, kicker, image, imageAlt }: ShellProps): React.JSX.Element {
    return (
        <main id="main-content" tabIndex={-1}>
            <Head title={title} lede={lede} kicker={kicker} image={image} imageAlt={imageAlt} />
        </main>
    );
}

function Head({
    title,
    lede,
    kicker,
    image,
    imageAlt,
}: Omit<ShellProps, "children">): React.JSX.Element {
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

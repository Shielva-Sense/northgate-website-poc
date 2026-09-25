import { headers } from "next/headers";
import Image from "next/image";
import { resolveBrand } from "@/app/features/clinic/brands";
import { BrandProvider } from "@/app/features/clinic/BrandContext";
import { AnnounceBar } from "@/app/features/clinic/components/AnnounceBar";
import { SiteHeader } from "@/app/features/clinic/components/SiteHeader";
import { SiteFooter } from "@/app/features/clinic/components/SiteFooter";
import { ScrollProgress } from "@/app/features/clinic/components/ScrollProgress";
import styles from "./PageShell.module.scss";

/**
 * Brand resolution plus the site chrome, in one place.
 *
 * Four pages were each repeating the provider, the announce bar, the header
 * and the footer. That is exactly the duplication that drifts — one page ends
 * up with a stale nav and nobody notices until a prospect does.
 */
export async function PageShell({
    title,
    lede,
    kicker,
    image,
    imageAlt,
    children,
}: {
    readonly title: string;
    readonly lede?: string | undefined;
    readonly kicker?: string | undefined;
    /** Hero image. A page header of flat colour and type read as unfinished
        next to the home page; every inner page now carries one. */
    readonly image?: string | undefined;
    readonly imageAlt?: string | undefined;
    readonly children: React.ReactNode;
}): Promise<React.JSX.Element> {
    const brand = resolveBrand((await headers()).get("host"));

    return (
        <BrandProvider brand={brand}>
            <ScrollProgress />
            <AnnounceBar />
            <SiteHeader />
            <main id="main-content" tabIndex={-1}>
                <header className={styles.head}>
                    <div className={`wrap ${image === undefined ? "" : styles.split}`}>
                        <div className={styles.copy}>
                            {kicker === undefined ? null : (
                                <p className={styles.kicker}>{kicker}</p>
                            )}
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
                {children}
            </main>
            <SiteFooter />
        </BrandProvider>
    );
}

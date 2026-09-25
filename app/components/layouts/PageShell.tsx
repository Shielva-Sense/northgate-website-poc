import { headers } from "next/headers";
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
    children,
}: {
    readonly title: string;
    readonly lede?: string | undefined;
    readonly kicker?: string | undefined;
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
                    <div className="wrap">
                        {kicker === undefined ? null : (
                            <p className={styles.kicker}>{kicker}</p>
                        )}
                        <h1 className={styles.h1}>{title}</h1>
                        {lede === undefined ? null : <p className={styles.lede}>{lede}</p>}
                    </div>
                </header>
                {children}
            </main>
            <SiteFooter />
        </BrandProvider>
    );
}

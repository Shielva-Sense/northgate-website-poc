import type { Metadata } from "next";
import { LocaleLink as Link } from "@/app/components/ui/LocaleLink";
import { headers } from "next/headers";
import { siteFromHost } from "@/app/core/site";
import { isIndexable, siteUrl } from "@/app/core/seo";
import styles from "./Privacy.module.scss";
import { tr } from "@/app/core/content-ar";
import type { Locale } from "@/app/core/locale";

export async function generateMetadata(): Promise<Metadata> {
    const brand = (await siteFromHost((await headers()).get("host"))).brand;
    return {
        title: `Privacy notice — ${brand.name}`,
        description:
            "How this practice collects, uses and stores the information you give us, including health information.",
        alternates: { canonical: `${siteUrl()}/privacy` },
        robots: isIndexable() ? undefined : { index: false, follow: false },
    };
}

/**
 * Static server page. The form collects health details, which are special
 * category data under UK GDPR Article 9 — a site that collects them without a
 * published notice is not compliant, whatever else it does well.
 *
 * This is a template. The practice must have it reviewed before going live and
 * fill in the bracketed values.
 */
export default async function Page({
    params,
}: {
    readonly params: Promise<{ readonly locale: Locale }>;
}): Promise<React.JSX.Element> {
    const { locale } = await params;
    const brand = (await siteFromHost((await headers()).get("host"))).brand;
    return (
        <main id="main-content" tabIndex={-1} className={styles.page}>
            <div className="wrap">
                <p className={styles.crumb}>
                    <Link href="/">Back to {brand.name}</Link>
                </p>

                <h1 className={styles.h1}>{tr("Privacy notice", locale)}</h1>
                <p className={styles.lede}>{tr("This explains what we do with the information you give us when you request an appointment. It is written to be read, not to be survived.", locale)}</p>

                <p className={styles.review}>
                    <strong>{tr("Template.", locale)}</strong>{tr("The bracketed values must be completed and the whole notice reviewed by the practice’s data protection officer before this site goes live.", locale)}</p>

                <h2 className={styles.h2}>{tr("Who is responsible", locale)}</h2>
                <p>
                    {brand.name}, {brand.address}, is the data controller. Our data protection
                    officer can be reached at {brand.email}. Our ICO registration number is
                    [registration number].
                </p>

                <h2 className={styles.h2}>{tr("What we collect", locale)}</h2>
                <ul className={styles.list}>
                    <li>{tr("Your name, and the phone number or email address you give us.", locale)}</li>
                    <li>{tr("Whether you are already registered with the practice.", locale)}</li>
                    <li>{tr("What the appointment is for, when suits you, and anything you choose to write in the notes.", locale)}</li>
                </ul>
                <p>
                    {tr("Some of that describes your health. Under data protection law that is", locale)}{" "}
                    <strong>{tr("special category data", locale)}</strong>{" "}
                    {tr("and gets stronger protection than ordinary personal data.", locale)}
                </p>

                <h2 className={styles.h2}>{tr("Why we are allowed to hold it", locale)}</h2>
                <ul className={styles.list}>
                    <li>{tr("For the appointment itself: Article 6(1)(b), taking steps at your request before providing care, and Article 9(2)(h), the provision of health care.", locale)}</li>
                    <li>{tr("For contacting you about this request: your consent, which is the box you tick on the form. You can withdraw it at any time.", locale)}</li>
                </ul>

                <h2 className={styles.h2}>{tr("Who sees it", locale)}</h2>
                <p>{tr("The clinicians and reception staff who need it to arrange your appointment, and our IT suppliers under written contract. We do not sell it, and we do not use it for advertising.", locale)}</p>

                <h2 className={styles.h2}>{tr("How long we keep it", locale)}</h2>
                <p>
                    {tr("Appointment requests that do not become appointments are deleted after [x] months. If you become a patient, the request joins your medical record and is kept for the period set by", locale)}{" "}
                    {tr(
                        brand.regulators?.retentionAuthority ??
                            "the applicable medical records retention rules in your jurisdiction",
                        locale,
                    )}
                    .
                </p>

                <h2 className={styles.h2}>{tr("Your rights", locale)}</h2>
                <p>
                    {tr("You can ask for a copy of what we hold, ask us to correct it, ask us to delete it, object to how we use it, or withdraw consent. Write to", locale)}{" "}
                    {brand.email}{" "}
                    {tr("and we will answer within one month.", locale)} If you are unhappy with our answer you can
                    complain to the Information Commissioner&rsquo;s Office at ico.org.uk, or ring
                    them on 0303 123 1113.
                </p>

                <h2 className={styles.h2}>{tr("Cookies", locale)}</h2>
                <p>{tr("This site sets one cookie, which keeps you signed in to the preview. It is strictly necessary, so it does not require consent. There is no analytics and no advertising or tracking on this site. If either is added later, this notice and a consent banner must be added with it.", locale)}</p>

                <p className={styles.updated}>{tr("Last reviewed: [date].", locale)}</p>
            </div>
        </main>
    );
}

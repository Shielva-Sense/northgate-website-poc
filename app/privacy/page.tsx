import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { resolveBrand } from "@/app/features/clinic/brands";
import { isIndexable, siteUrl } from "@/app/core/seo";
import styles from "./Privacy.module.scss";

export async function generateMetadata(): Promise<Metadata> {
    const brand = resolveBrand((await headers()).get("host"));
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
export default async function Page(): Promise<React.JSX.Element> {
    const brand = resolveBrand((await headers()).get("host"));
    return (
        <main id="main-content" tabIndex={-1} className={styles.page}>
            <div className="wrap">
                <p className={styles.crumb}>
                    <Link href="/">Back to {brand.name}</Link>
                </p>

                <h1 className={styles.h1}>Privacy notice</h1>
                <p className={styles.lede}>
                    This explains what we do with the information you give us when you request an
                    appointment. It is written to be read, not to be survived.
                </p>

                <p className={styles.review}>
                    <strong>Template.</strong> The bracketed values must be completed and the
                    whole notice reviewed by the practice&rsquo;s data protection officer before
                    this site goes live.
                </p>

                <h2 className={styles.h2}>Who is responsible</h2>
                <p>
                    {brand.name}, {brand.address}, is the data controller. Our data protection
                    officer can be reached at {brand.email}. Our ICO registration number is
                    [registration number].
                </p>

                <h2 className={styles.h2}>What we collect</h2>
                <ul className={styles.list}>
                    <li>Your name, and the phone number or email address you give us.</li>
                    <li>Whether you are already registered with the practice.</li>
                    <li>
                        What the appointment is for, when suits you, and anything you choose to
                        write in the notes.
                    </li>
                </ul>
                <p>
                    Some of that describes your health. Under UK GDPR that is{" "}
                    <strong>special category data</strong> and gets stronger protection than
                    ordinary personal data.
                </p>

                <h2 className={styles.h2}>Why we are allowed to hold it</h2>
                <ul className={styles.list}>
                    <li>
                        For the appointment itself: Article 6(1)(b), taking steps at your request
                        before providing care, and Article 9(2)(h), the provision of health care.
                    </li>
                    <li>
                        For contacting you about this request: your consent, which is the box you
                        tick on the form. You can withdraw it at any time.
                    </li>
                </ul>

                <h2 className={styles.h2}>Who sees it</h2>
                <p>
                    The clinicians and reception staff who need it to arrange your appointment, and
                    our IT suppliers under written contract. We do not sell it, and we do not use
                    it for advertising.
                </p>

                <h2 className={styles.h2}>How long we keep it</h2>
                <p>
                    Appointment requests that do not become appointments are deleted after [x]
                    months. If you become a patient, the request joins your medical record and is
                    kept for the period set by {brand.regulators?.retentionAuthority ?? "the applicable medical records retention rules in your jurisdiction"}.
                </p>

                <h2 className={styles.h2}>Your rights</h2>
                <p>
                    You can ask for a copy of what we hold, ask us to correct it, ask us to delete
                    it, object to how we use it, or withdraw consent. Write to {brand.email} and
                    we will answer within one month. If you are unhappy with our answer you can
                    complain to the Information Commissioner&rsquo;s Office at ico.org.uk, or ring
                    them on 0303 123 1113.
                </p>

                <h2 className={styles.h2}>Cookies</h2>
                <p>
                    This site sets one cookie, which keeps you signed in to the preview. It is
                    strictly necessary, so it does not require consent. There is no analytics and
                    no advertising or tracking on this site. If either is added later, this notice
                    and a consent banner must be added with it.
                </p>

                <p className={styles.updated}>Last reviewed: [date].</p>
            </div>
        </main>
    );
}

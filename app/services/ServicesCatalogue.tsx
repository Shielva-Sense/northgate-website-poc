import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { siteFromHost } from "@/app/core/site";
import { CatalogueGlyph } from "@/app/features/clinic/components/CatalogueGlyph";
import { contentFor, priceLabel } from "@/app/features/clinic/content";
import styles from "./Index.module.scss";

/**
 * Everything this practice offers, for this host.
 *
 * Split out of the page so the catalogue can be resolved per tenant without
 * making the whole route dynamic. The page keeps its static shell; the host is
 * read here, inside a Suspense boundary, and the branded render is cached per
 * host — the same shape PageShell uses, and the reason these routes prerender
 * at all.
 *
 * What it replaced: three module constants holding one general practice's
 * departments, treatments and services, rendered identically on every site on
 * the farm. A dental practice advertised travel vaccinations and a
 * cardiometabolic department, and quoted both in pounds.
 */
export function ServicesCatalogue(): React.JSX.Element {
    return (
        <Suspense fallback={<CatalogueFallback />}>
            <ResolveHost />
        </Suspense>
    );
}

async function ResolveHost(): Promise<React.JSX.Element> {
    const host = (await headers()).get("host") ?? "";
    return <Catalogue host={host} />;
}

async function Catalogue({ host }: { readonly host: string }): Promise<React.JSX.Element> {
    "use cache";
    const site = await siteFromHost(host);
    const brand = site.brand;
    const { departments, treatments, additionalServices, appointmentTypes, clinicians } =
        contentFor(site.profile, brand);

    return (
        <>
            {/* ── departments ─────────────────────────────────── */}
            {departments.length === 0 ? null : (
                <section className={styles.section}>
                    <div className="wrap">
                        <h2 className={styles.h2}>
                            {site.profile.hasDepartments ? "Specialities and departments" : "What we treat"}
                        </h2>
                        <p className={styles.lede}>
                            Each one routes to the {site.profile.clinicianPlural} who staff it and
                            their real availability.
                        </p>
                        <ul className={styles.deptGrid} role="list">
                            {departments.map((department) => {
                                const count = clinicians.filter((person) =>
                                    person.departments.includes(department.id),
                                ).length;
                                return (
                                    <li key={department.id}>
                                        <Link
                                            className={styles.deptCard}
                                            href={`/find-a-doctor?department=${department.id}`}
                                        >
                                            <span className={styles.deptShot}>
                                                <Image
                                                    src={department.image}
                                                    alt={department.imageAlt}
                                                    width={1200}
                                                    height={800}
                                                    sizes="(min-width: 1040px) 340px, (min-width: 620px) 45vw, 90vw"
                                                    className={styles.deptImg}
                                                />
                                                {count === 0 ? null : (
                                                    <span className={styles.deptCount}>
                                                        {count}{" "}
                                                        {count === 1
                                                            ? site.profile.clinician
                                                            : site.profile.clinicianPlural}
                                                    </span>
                                                )}
                                            </span>
                                            <span className={styles.deptBody}>
                                                <span className={styles.deptName}>
                                                    {department.name}
                                                </span>
                                                <span className={styles.deptSummary}>
                                                    {department.summary}
                                                </span>
                                                <span className={styles.deptGo}>
                                                    See who is available
                                                    <ArrowRight size={15} aria-hidden="true" />
                                                </span>
                                            </span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </section>
            )}

            {/* ── treatments + extras ─────────────────────────── */}
            <section className={`${styles.section} ${styles.alt}`}>
                <div className="wrap">
                    <div className={styles.twoUp}>
                        <div>
                            <h2 className={styles.h2}>Treatments</h2>
                            <p className={styles.lede}>
                                Things you may have been told you need, or booked before.
                            </p>
                            <ul className={styles.rows} role="list">
                                {treatments.map((treatment) => (
                                    <li key={treatment.slug}>
                                        <Link
                                            className={styles.row}
                                            href={`/find-a-doctor?department=${treatment.department}`}
                                        >
                                            <span className={styles.rowIco} aria-hidden="true">
                                                <CatalogueGlyph icon={treatment.icon} />
                                            </span>
                                            <span className={styles.rowBody}>
                                                <span className={styles.rowName}>
                                                    {treatment.name}
                                                </span>
                                                <span className={styles.rowHint}>
                                                    {treatment.summary}
                                                </span>
                                            </span>
                                            <ArrowRight size={16} aria-hidden="true" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h2 className={styles.h2}>Additional services</h2>
                            <p className={styles.lede}>
                                The practical things. Some are bookable, some are walk-in or by
                                referral — it says which.
                            </p>
                            <ul className={styles.rows} role="list">
                                {additionalServices.map((service) => (
                                    <li key={service.slug}>
                                        {service.bookable ? (
                                            <Link className={styles.row} href="/#book">
                                                <span className={styles.rowIco} aria-hidden="true">
                                                    <CatalogueGlyph icon={service.icon} />
                                                </span>
                                                <span className={styles.rowBody}>
                                                    <span className={styles.rowName}>
                                                        {service.name}
                                                    </span>
                                                    <span className={styles.rowHint}>
                                                        {service.summary}
                                                    </span>
                                                </span>
                                                <ArrowRight size={16} aria-hidden="true" />
                                            </Link>
                                        ) : (
                                            <div className={`${styles.row} ${styles.rowStatic}`}>
                                                <span className={styles.rowIco} aria-hidden="true">
                                                    <CatalogueGlyph icon={service.icon} />
                                                </span>
                                                <span className={styles.rowBody}>
                                                    <span className={styles.rowName}>
                                                        {service.name}
                                                    </span>
                                                    <span className={styles.rowHint}>
                                                        {service.summary}
                                                    </span>
                                                </span>
                                                <span className={styles.tag}>No booking needed</span>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── appointment types, by department ────────────── */}
            <section className={styles.section}>
                <div className="wrap">
                    <h2 className={styles.h2}>Appointment types</h2>
                    <p className={styles.lede}>
                        What each {site.profile.visit} is, how long it takes and what it costs —
                        grouped by the department that provides it.
                    </p>
                    {departments.map((department) => {
                        const types = appointmentTypes.filter(
                            (type) => type.department === department.id,
                        );
                        if (types.length === 0) return null;
                        return (
                            <div className={styles.apptGroup} key={department.id}>
                                <h3 className={styles.apptDept}>{department.name}</h3>
                                <ul className={styles.rows} role="list">
                                    {types.map((type) => (
                                        <li key={type.id}>
                                            <Link
                                                className={styles.row}
                                                href={`/appointments?department=${department.id}&type=${type.id}`}
                                            >
                                                <span className={styles.rowBody}>
                                                    <span className={styles.rowName}>
                                                        {type.name}
                                                    </span>
                                                    <span className={styles.rowHint}>
                                                        <Clock size={13} aria-hidden="true" />{" "}
                                                        {type.minutes} minutes
                                                        {type.note === undefined
                                                            ? null
                                                            : ` · ${type.note}`}
                                                    </span>
                                                </span>
                                                <span className={styles.rowPrice}>
                                                    {priceLabel(brand, type.price)}
                                                </span>
                                                <ArrowRight size={16} aria-hidden="true" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </section>
        </>
    );
}

/**
 * What shows while the host resolves.
 *
 * Deliberately not a spinner: the headings are true of every practice, so they
 * can be painted immediately, and only the lists arrive a beat later.
 */
function CatalogueFallback(): React.JSX.Element {
    return (
        <section className={styles.section}>
            <div className="wrap">
                <h2 className={styles.h2}>Specialities and departments</h2>
                <p className={styles.lede}>Loading this practice&rsquo;s services…</p>
            </div>
        </section>
    );
}

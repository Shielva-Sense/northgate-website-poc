import { Suspense } from "react";
import { headers } from "next/headers";
import { LocaleLink as Link } from "@/app/components/ui/LocaleLink";
import { siteFromHost } from "@/app/core/site";
import { groupRows, ordersPriceList, priceListFor } from "@/app/features/clinic/price-list";
import type { PriceBand, PriceRow } from "@/app/features/clinic/price-list";
import styles from "./PriceTable.module.scss";
import { tr } from "@/app/core/content-ar";
import type { Locale } from "@/app/core/locale";

/**
 * The published price list, for this host.
 *
 * Split from the page the same way the services catalogue is, so the route
 * keeps a static shell and only the table resolves per tenant.
 */
export function PriceTable({ locale }: { readonly locale: Locale }): React.JSX.Element {
    return (
        <Suspense fallback={<p className={styles.lede}>{tr("Loading this practice’s price list…", locale)}</p>}>
            <ResolveHost locale={locale} />
        </Suspense>
    );
}

async function ResolveHost({ locale }: { readonly locale: Locale }): Promise<React.JSX.Element> {
    const host = (await headers()).get("host") ?? "";
    return <Table host={host} locale={locale} />;
}

/**
 * Pounds, to the penny only where there are pence.
 *
 * `priceLabelLocal` rounds to whole units, which is right for an indicative
 * fee and wrong here: the Order caps a written prescription at £12.50, and
 * rounding it to £13 publishes a number above the cap.
 */
function pounds(value: number): string {
    return `£${value.toLocaleString("en-GB", {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
    })}`;
}

async function Table({
    host,
    locale,
}: {
    readonly host: string;
    readonly locale: Locale;
}): Promise<React.JSX.Element> {
    "use cache";
    const site = await siteFromHost(host);

    /* A dentist in Leeds and a vet in Montana are not subject to this Order,
       and rendering the table for them would invent an obligation. */
    if (!ordersPriceList(site.profile, site.brand)) {
        return (
            <p className={styles.lede}>
                This practice does not publish a weight-banded veterinary price list. Every
                price we do charge is on the <Link href="/services">services page</Link>.
            </p>
        );
    }

    const list = priceListFor(site.overrides?.priceList);
    const groups = groupRows(list.rows);

    return (
        <>
            <p className={styles.lede}>{tr("Prices for our standard services, by the size of your pet. They are what you will be charged for the work described — where a total cannot be known until we have examined your pet, it says so and the figure is a starting point.", locale)}</p>

            {list.verified === true ? null : (
                <aside className={styles.provisional} role="note">
                    <b>{tr("This list is being checked against the CMA Order.", locale)}</b>{tr("The services and weight categories shown here are our own, published in good faith while we confirm the schedule the Order requires. Ask us for a written estimate for anything you are about to book — we would rather quote you than have you rely on a table we are still checking.", locale)}</aside>
            )}

            <div className={styles.scroll}>
                <table className={styles.table}>
                    <caption className="visually-hidden">{tr("Standard service prices by patient weight category", locale)}</caption>
                    <thead>
                        <tr>
                            <th scope="col" className={styles.serviceCol}>{tr("Service", locale)}</th>
                            {list.bands.map((band: PriceBand) => (
                                <th scope="col" key={band.id} className={styles.bandCol}>
                                    {band.label}
                                    {band.detail === undefined ? null : (
                                        <span className={styles.bandDetail}>{band.detail}</span>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    {groups.map(([group, rows]) => (
                        <tbody key={group}>
                            <tr>
                                {/* A group heading inside the table rather than a
                                    separate table per group, so a screen reader
                                    keeps one set of column headers throughout. */}
                                <th
                                    scope="colgroup"
                                    colSpan={list.bands.length + 1}
                                    className={styles.group}
                                >
                                    {group}
                                </th>
                            </tr>
                            {rows.map((row: PriceRow) => (
                                <tr key={row.id}>
                                    <th scope="row" className={styles.service}>
                                        {row.service}
                                        {row.note === undefined ? null : (
                                            <span className={styles.note}>{row.note}</span>
                                        )}
                                    </th>
                                    {list.bands.map((band) => {
                                        const price = row.prices[band.id];
                                        return (
                                            <td key={band.id} className={styles.price}>
                                                {price === undefined ? (
                                                    <span
                                                        className={styles.absent}
                                                        title={tr("Not offered for this patient", locale)}
                                                    >
                                                        —
                                                    </span>
                                                ) : (
                                                    <>
                                                        {row.estimate === true ? (
                                                            <span className={styles.from}>from </span>
                                                        ) : null}
                                                        {pounds(price)}
                                                    </>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    ))}
                </table>
            </div>

            <p className={styles.foot}>{tr("Prices include VAT. A dash means we do not offer that service for that patient. Medicines are charged separately and we will always tell you the cost before dispensing.", locale)}</p>
        </>
    );
}

"use client";

import { useState } from "react";
import { Crosshair, MapPin, Phone } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Field, Input } from "@/app/components/ui/Field";
import { emergencySites, nearestSites, siteForPostcode } from "@/app/features/clinic/urgent";
import type { EmergencySite } from "@/app/features/clinic/urgent";
import { useBrand } from "@/app/features/clinic/BrandContext";
import styles from "./Urgent.module.scss";
import { tr } from "@/app/core/content-ar";
import { useLocale } from "@/app/features/clinic/LocaleContext";

function mapsHref(address: string): string {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

type Result =
    | { readonly state: "idle" }
    | { readonly state: "locating" }
    | { readonly state: "found"; readonly site: EmergencySite; readonly km: number | null }
    | { readonly state: "unknown" }
    | { readonly state: "denied" };

/**
 * Which of our emergency departments is nearest to this person.
 *
 * Two ways in, because both fail in different situations: the browser's own
 * location is exact but needs permission and a secure origin, and a postcode
 * works when permission is refused or someone is planning for another person.
 *
 * Only the *outward* code is read from what is typed — enough to pick a
 * hospital, and not the person's front door. Nothing typed here is sent
 * anywhere: the sites and the arithmetic are in the page.
 */
export function NearestEmergency({ fullOnly = true }: { readonly fullOnly?: boolean }): React.JSX.Element | null {
    const { locale } = useLocale();
    const brand = useBrand();
    /* The sites follow the tenant, so they are derived here rather than read
       from a module constant that would name the default clinic on every host. */
    const sites = emergencySites(brand);
    const [postcode, setPostcode] = useState("");
    const [result, setResult] = useState<Result>({ state: "idle" });

    /* "Which of our departments is nearest to you?" is only a question worth
       asking a practice that has more than one. With a single door the finder
       asked for a postcode in order to answer with the address already printed
       directly above it. */
    const single = sites.length < 2;

    function locate(): void {
        if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
            setResult({ state: "unknown" });
            return;
        }
        setResult({ state: "locating" });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const near = nearestSites(
                    sites,
                    position.coords.latitude,
                    position.coords.longitude,
                    fullOnly,
                );
                const best = near[0];
                if (best === undefined) {
                    setResult({ state: "unknown" });
                    return;
                }
                setResult({ state: "found", site: best.site, km: best.km });
            },
            () => setResult({ state: "denied" }),
            { timeout: 8_000, maximumAge: 60_000 },
        );
    }

    function byPostcode(): void {
        const site = siteForPostcode(sites, postcode);
        setResult(site === null ? { state: "unknown" } : { state: "found", site, km: null });
    }

    if (single) return null;

    return (
        <section className={styles.nearest} aria-labelledby="nearest-heading">
            <h3 className={styles.nearestTitle} id="nearest-heading">
                <MapPin size={17} aria-hidden="true" />{tr("Which emergency department is nearest to you?", locale)}</h3>
            <p className={styles.nearestLede}>{tr("We run more than one. Rather than send you to the biggest, we will tell you the closest one that can treat this.", locale)}</p>

            <div className={styles.nearestControls}>
                <Button
                    variant="ghost"
                    onClick={locate}
                    leftIcon={<Crosshair size={15} aria-hidden="true" />}
                    disabled={result.state === "locating"}
                >
                    {result.state === "locating" ? "Finding you…" : "Use my location"}
                </Button>
                <span className={styles.nearestOr}>or</span>
                <div className={styles.nearestPostcode}>
                    <Field label={tr("Your postcode", locale)} help={tr("We only read the first part, like M20.", locale)}>
                        {(id, describedBy) => (
                            <Input
                                id={id}
                                aria-describedby={describedBy}
                                value={postcode}
                                autoComplete="postal-code"
                                placeholder="M20 4TY"
                                onChange={(event) => setPostcode(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") byPostcode();
                                }}
                            />
                        )}
                    </Field>
                    <Button variant="ghost" onClick={byPostcode} disabled={postcode.trim() === ""}>{tr("Find", locale)}</Button>
                </div>
            </div>

            <div aria-live="polite">
                {result.state === "found" ? (
                    <div className={styles.nearestResult}>
                        <p className={styles.nearestLabel}>{tr("Nearest to you", locale)}</p>
                        <p className={styles.nearestName}>{result.site.name}</p>
                        <p className={styles.nearestMeta}>
                            {result.site.address} · {result.site.hours}
                            {result.km === null
                                ? null
                                : ` · about ${result.km.toFixed(1)} km away in a straight line`}
                        </p>
                        {result.site.full ? null : (
                            <p className={styles.nearestWarn}>{tr("This is a minor injuries unit, not a full emergency department. If this could be life-threatening, do not come here.", locale)}</p>
                        )}
                        <div className={styles.nearestActions}>
                            <a
                                className={styles.emergencyCall}
                                href={`tel:${result.site.aeLine.replace(/[^+\d]/g, "")}`}
                            >
                                <Phone size={17} aria-hidden="true" />
                                Call {result.site.aeLine}
                            </a>
                            <a
                                className={styles.emergencyWay}
                                href={mapsHref(result.site.address)}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <MapPin size={16} aria-hidden="true" />{tr("Directions", locale)}</a>
                        </div>
                    </div>
                ) : null}

                {result.state === "denied" || result.state === "unknown" ? (
                    /* Never guess a hospital. Listing them all is slower for the
                       reader but cannot send anyone to the wrong door. */
                    <div className={styles.nearestResult}>
                        <p className={styles.nearestLabel}>
                            {result.state === "denied"
                                ? "We could not read your location"
                                : "We could not match that postcode"}
                        </p>
                        <p className={styles.nearestMeta}>{tr("Rather than guess, here is every emergency department we run:", locale)}</p>
                        <ul className={styles.nearestList} role="list">
                            {sites.map((site) => (
                                <li key={site.id}>
                                    <b>{site.name}</b>
                                    <br />
                                    {site.address} · {site.hours} ·{" "}
                                    <a href={`tel:${site.aeLine.replace(/[^+\d]/g, "")}`}>
                                        {site.aeLine}
                                    </a>{" "}
                                    ·{" "}
                                    <a
                                        href={mapsHref(site.address)}
                                        target="_blank"
                                        rel="noreferrer"
                                    >{tr("Directions", locale)}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
        </section>
    );
}

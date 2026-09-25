"use client";

import { useState } from "react";
import { Crosshair, MapPin, Phone } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Field, Input } from "@/app/components/ui/Field";
import { nearestSites, siteForPostcode } from "@/app/features/clinic/urgent";
import type { EmergencySite } from "@/app/features/clinic/urgent";
import { EMERGENCY_SITES } from "@/app/features/clinic/urgent";
import styles from "./Urgent.module.scss";

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
export function NearestEmergency({ fullOnly = true }: { readonly fullOnly?: boolean }): React.JSX.Element {
    const [postcode, setPostcode] = useState("");
    const [result, setResult] = useState<Result>({ state: "idle" });

    function locate(): void {
        if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
            setResult({ state: "unknown" });
            return;
        }
        setResult({ state: "locating" });
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const near = nearestSites(
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
        const site = siteForPostcode(postcode);
        setResult(site === null ? { state: "unknown" } : { state: "found", site, km: null });
    }

    return (
        <section className={styles.nearest} aria-labelledby="nearest-heading">
            <h3 className={styles.nearestTitle} id="nearest-heading">
                <MapPin size={17} aria-hidden="true" />
                Which emergency department is nearest to you?
            </h3>
            <p className={styles.nearestLede}>
                We run more than one. Rather than send you to the biggest, we will tell you the
                closest one that can treat this.
            </p>

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
                    <Field label="Your postcode" help="We only read the first part, like M20.">
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
                    <Button variant="ghost" onClick={byPostcode} disabled={postcode.trim() === ""}>
                        Find
                    </Button>
                </div>
            </div>

            <div aria-live="polite">
                {result.state === "found" ? (
                    <div className={styles.nearestResult}>
                        <p className={styles.nearestLabel}>Nearest to you</p>
                        <p className={styles.nearestName}>{result.site.name}</p>
                        <p className={styles.nearestMeta}>
                            {result.site.address} · {result.site.hours}
                            {result.km === null
                                ? null
                                : ` · about ${result.km.toFixed(1)} km away in a straight line`}
                        </p>
                        {result.site.full ? null : (
                            <p className={styles.nearestWarn}>
                                This is a minor injuries unit, not a full emergency department. If
                                this could be life-threatening, do not come here.
                            </p>
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
                                <MapPin size={16} aria-hidden="true" />
                                Directions
                            </a>
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
                        <p className={styles.nearestMeta}>
                            Rather than guess, here is every emergency department we run:
                        </p>
                        <ul className={styles.nearestList} role="list">
                            {EMERGENCY_SITES.map((site) => (
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
                                    >
                                        Directions
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
        </section>
    );
}

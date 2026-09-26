"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
    ArrowRight,
    CalendarClock,
    Clock,
    Languages,
    MapPin,
    Search,
    SlidersHorizontal,
    Star,
    X,
} from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { siteLabel } from "@/app/features/clinic/constants";
import { useBrand, useContent } from "@/app/features/clinic/BrandContext";
import type { Clinician, SiteKey } from "@/app/features/clinic/types";
import styles from "./Directory.module.scss";
import { tr } from "@/app/core/content-ar";
import { useLocale } from "@/app/features/clinic/LocaleContext";

type Sort = "soonest" | "rated" | "experience" | "price";

const SORTS: readonly { readonly id: Sort; readonly label: string }[] = [
    { id: "soonest", label: "Soonest available" },
    { id: "rated", label: "Highest rated" },
    { id: "experience", label: "Most experienced" },
    { id: "price", label: "Lowest fee" },
];

/**
 * How soon a slot is, for sorting.
 *
 * The data carries display strings ("Today", "Thu 2 Oct") rather than dates,
 * because a demo with hard dates goes stale the week after it is shown. That
 * is fine for display and useless for ordering, so the two named days are
 * ranked explicitly and everything else falls behind them in its given order.
 */
function slotRank(person: Clinician): number {
    const day = person.nextSlot.day.toLowerCase();
    if (day === "today") return 0;
    if (day === "tomorrow") return 1;
    return 2;
}

function feeNumber(person: Clinician): number {
    const digits = person.fee.replace(/[^\d]/g, "");
    return digits === "" ? Number.MAX_SAFE_INTEGER : Number(digits);
}

/* Derived from this practice's own team. At module scope it was one clinic's
   eleven languages, offered as filters on every site on the farm — and on a
   site whose team speaks two of them, nine of the chips matched nobody. */
function languagesOf(team: readonly Clinician[]): readonly string[] {
    return [...new Set(team.flatMap((person) => person.languages))].sort();
}

/* The labels are the tenant's own addresses, so these can only be resolved
   inside the component, where the brand and the team are both known. */
function siteKeysOf(team: readonly Clinician[]): readonly SiteKey[] {
    return [...new Set(team.map((p) => p.site))].sort();
}

/**
 * The doctor directory.
 *
 * "Find a doctor" has to actually let someone find a doctor. The guided
 * symptom flow answers "I don't know who to see"; this answers the far more
 * common "I know roughly what I need — who is there, what do they cost, and
 * when can I be seen?", which no amount of signposting replaces.
 *
 * Every filter here is one a patient genuinely uses: a language they can be
 * understood in, a site they can reach, and whether anyone is free today. None
 * of it is a proxy for clinical quality, and nothing is ranked by what the
 * practice would rather sell.
 */
export function DoctorDirectory({
    onBook,
}: {
    readonly onBook: (departmentId: string, clinician: string) => void;
}): React.JSX.Element {
    const { locale } = useLocale();
    const brand = useBrand();
    const { departments, clinicians } = useContent();
    const [query, setQuery] = useState("");
    const [department, setDepartment] = useState<string | null>(null);
    const [language, setLanguage] = useState<string | null>(null);
    const [site, setSite] = useState<SiteKey | null>(null);
    const [todayOnly, setTodayOnly] = useState(false);
    const [sort, setSort] = useState<Sort>("soonest");

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        const filtered = clinicians.filter((person) => {
            if (department !== null && !person.departments.includes(department)) return false;
            if (language !== null && !person.languages.includes(language)) return false;
            if (site !== null && person.site !== site) return false;
            if (todayOnly && person.nextSlot.day.toLowerCase() !== "today") return false;
            if (q === "") return true;
            // Name, role and focus — the three things someone actually types.
            return [person.name, person.role, person.focus, ...person.languages]
                .join(" ")
                .toLowerCase()
                .includes(q);
        });

        return [...filtered].sort((a, b) => {
            if (sort === "rated") return b.rating - a.rating;
            if (sort === "experience") return b.years - a.years;
            if (sort === "price") return feeNumber(a) - feeNumber(b);
            return slotRank(a) - slotRank(b);
        });
    }, [clinicians, query, department, language, site, todayOnly, sort]);

    const filtersOn =
        department !== null || language !== null || site !== null || todayOnly || query !== "";

    function clearAll(): void {
        setQuery("");
        setDepartment(null);
        setLanguage(null);
        setSite(null);
        setTodayOnly(false);
    }

    return (
        <div className={styles.directory}>
            <div className={styles.searchRow}>
                <Search className={styles.searchIcon} size={18} aria-hidden="true" />
                <input
                    className={styles.search}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={tr("Search by name, speciality or language", locale)}
                    aria-label={tr("Search clinicians", locale)}
                    autoComplete="off"
                />
                {query === "" ? null : (
                    <button
                        className={styles.clear}
                        type="button"
                        onClick={() => setQuery("")}
                        aria-label={tr("Clear search", locale)}
                    >
                        <X size={16} aria-hidden="true" />
                    </button>
                )}
            </div>

            <div className={styles.filters}>
                <p className={styles.filtersLabel}>
                    <SlidersHorizontal size={14} aria-hidden="true" />{tr("Filter", locale)}</p>

                <Facet
                    legend="Department"
                    value={department}
                    onChange={setDepartment}
                    options={departments.map((d) => ({ value: d.id, label: d.name }))}
                />
                <Facet
                    legend="Language"
                    value={language}
                    onChange={setLanguage}
                    options={languagesOf(clinicians).map((l) => ({ value: l, label: l }))}
                />
                <Facet
                    legend="Site"
                    value={site}
                    onChange={(next) => setSite(next as SiteKey | null)}
                    options={siteKeysOf(clinicians).map((key) => ({
                        value: key,
                        label: siteLabel(brand, key),
                    }))}
                />

                <button
                    type="button"
                    className={styles.toggle}
                    aria-pressed={todayOnly}
                    onClick={() => setTodayOnly((value) => !value)}
                >
                    <Clock size={14} aria-hidden="true" />{tr("Free today", locale)}</button>
            </div>

            <div className={styles.resultsBar}>
                <p className={styles.count} role="status">
                    {results.length} {results.length === 1 ? "clinician" : "clinicians"}
                    {filtersOn ? " match" : " available"}
                </p>

                <div className={styles.sorts}>
                    <span className={styles.sortLabel}>{tr("Sort", locale)}</span>
                    {SORTS.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            className={styles.sortChip}
                            aria-pressed={sort === option.id}
                            onClick={() => setSort(option.id)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {results.length === 0 ? (
                <div className={styles.none}>
                    <p className={styles.noneTitle}>{tr("Nobody matches all of those", locale)}</p>
                    <p className={styles.noneBody}>
                        Try removing one filter — language and &ldquo;free today&rdquo; together
                        narrow things quickly. Reception can always find someone:{" "}
                        <b>they hold slots back that are not published here.</b>
                    </p>
                    <Button variant="ghost" onClick={clearAll}>{tr("Clear all filters", locale)}</Button>
                </div>
            ) : (
                <ul className={styles.grid} role="list">
                    {results.map((person) => (
                        <li className={styles.card} key={person.name}>
                            <div className={styles.cardTop}>
                                {person.photo === undefined ? (
                                    /* A designed monogram, never a stock face —
                                       this is a named, registered person. */
                                    <span className={styles.monogram} aria-hidden="true">
                                        {person.initials}
                                    </span>
                                ) : (
                                    <Image
                                        src={person.photo}
                                        alt=""
                                        width={320}
                                        height={320}
                                        sizes="96px"
                                        className={styles.photo}
                                    />
                                )}
                                <div className={styles.who}>
                                    <h3 className={styles.name}>{person.name}</h3>
                                    <p className={styles.role}>{person.role}</p>
                                    <p className={styles.quals}>{person.qualifications}</p>
                                    <p className={styles.rating}>
                                        <Star size={13} aria-hidden="true" />
                                        <b>{person.rating.toFixed(1)}</b>
                                        <span>
                                            {person.reviews} reviews · {person.years} years
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <p className={styles.focus}>{person.focus}</p>

                            <ul className={styles.meta} role="list">
                                <li>
                                    <Languages size={13} aria-hidden="true" />
                                    {person.languages.join(", ")}
                                </li>
                                <li>
                                    <MapPin size={13} aria-hidden="true" />
                                    {siteLabel(brand, person.site)}
                                </li>
                                <li className={styles.depts}>
                                    {person.departments
                                        .map((id) => departments.find((d) => d.id === id)?.name)
                                        .filter(Boolean)
                                        .join(" · ")}
                                </li>
                            </ul>

                            <div className={styles.cardFoot}>
                                <p className={styles.slot}>
                                    <CalendarClock size={15} aria-hidden="true" />
                                    <span>
                                        Next: <b>{person.nextSlot.day}</b> {person.nextSlot.time}
                                    </span>
                                </p>
                                <p className={styles.fee}>{person.fee}</p>
                            </div>

                            <Button
                                fullWidth
                                onClick={() =>
                                    onBook(person.departments[0] ?? "general", person.name)
                                }
                                rightIcon={<ArrowRight size={15} aria-hidden="true" />}
                            >{tr("See availability", locale)}</Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/** One filter row. Selecting the active value again clears it. */
function Facet({
    legend,
    value,
    options,
    onChange,
}: {
    readonly legend: string;
    readonly value: string | null;
    readonly options: readonly { readonly value: string; readonly label: string }[];
    readonly onChange: (next: string | null) => void;
}): React.JSX.Element {
    return (
        <fieldset className={styles.facet}>
            <legend className={styles.facetLegend}>{legend}</legend>
            <div className={styles.facetOptions}>
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        className={styles.chip}
                        aria-pressed={value === option.value}
                        onClick={() => onChange(value === option.value ? null : option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </fieldset>
    );
}

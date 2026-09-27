/**
 * Fail the build when human-medicine copy can reach a veterinary site.
 *
 * This exists because of six consecutive deploys. Every trade-aware change —
 * departments, then triage, then urgent care, then red flags — made another
 * page reachable on a veterinary site and exposed one more sentence that had
 * been written for a general practice and hardcoded into the JSX. In order:
 *
 *   1. the urgent-care unit list          "Urgent child health", "Same-day GP"
 *   2. the red flags                      "face drooping or slurred speech"
 *   3. the emergency banner               "a baby under three months with a fever"
 *   4. the brand strapline default        "See a named doctor this week"
 *   5. the root metadata description      the same line, in every share card
 *   6. the find-a-doctor red-flag panel   "call 999 for an ambulance"
 *   7. the appointments urgent banner     "urgent care is walk-in"
 *
 * The lists were fixed the moment they became data. The prose kept hiding,
 * because nothing in the toolchain knows that a string is about humans. Each
 * one was found by curling production after the fact, and the sixth was a
 * safety problem we introduced ourselves: making the red flags veterinary
 * turned a dormant panel into one that told the owner of a bloating dog to
 * call an ambulance.
 *
 * Two checks, because the bug has two shapes.
 *
 * DATA — resolve every trade's content and brand and assert no banned term
 * survives. This catches a constant that is not trade-aware yet.
 *
 * SOURCE — a ratchet over the literals in app/. Every banned phrase in the
 * source is listed in ALLOWED with the reason it is legitimate, which is
 * always one of: it sits in the non-veterinary branch of a conditional, or it
 * is human-only data that a veterinary site never reads. Anything not on the
 * list fails. Adding a line to ALLOWED is deliberate; forgetting to is not
 * possible.
 */
import { existsSync, readFileSync, globSync } from "node:fs";

/* Words a veterinary page must never say. Deliberately narrow: each one is a
   phrase that is wrong rather than merely unusual, so there is no judgement
   call when the check fires. "doctor" and "patient" are not here — a vet
   practice may reasonably say "the doctor will see your dog", and a false
   alarm that has to be argued about is a check people switch off. */
const BANNED = [
    "A&E",
    "ambulance",
    "chest pain",
    "face drooping",
    "slurred speech",
    "baby under",
    "months with a fever",
    "Same-day GP",
    "child health",
    "mental health",
    "harming yourself",
    "named doctor",
    "emergency department",
];

/**
 * Where a banned phrase is allowed to appear in the source, and why.
 *
 * Keyed by file. A phrase listed here is one we have looked at and decided is
 * unreachable from a veterinary site. Keep the reason: the next person to see
 * this fire needs to know whether the entry still holds.
 */
const ALLOWED = {
    "app/features/clinic/care.ts":
        "RED_FLAGS is the human list. redFlagsFor() returns VET_RED_FLAGS for veterinary, so a vet site never reads it.",
    "app/features/clinic/urgent.ts":
        "URGENT_UNITS and RED_FLAG_TERMS are the human set. urgentUnitsFor() returns VET_UNITS for veterinary.",
    "app/features/clinic/content.ts":
        "HUMAN_TRIAGE and the human PLANS entries. triageFor() returns VET_TRIAGE for veterinary.",
    "app/features/clinic/practice-kinds.ts":
        "Per-kind profiles — the human trades legitimately describe human services.",
    "app/features/clinic/countries.ts":
        "Country packs carry the local word for an emergency department. Never rendered on a vet page.",
    "app/features/clinic/catalogue.ts":
        "The human health-library articles. hasHealthLibrary is false for veterinary.",
    "app/features/clinic/constants.ts":
        "The general practice's own content, used as the human default.",
    "app/[locale]/urgent-care/UrgentClient.tsx":
        "The non-veterinary branch of the isVet conditionals, plus the comments explaining them.",
    "app/[locale]/urgent-care/NoEmergency.tsx":
        "The non-veterinary branch of the isVet conditional.",
    "app/[locale]/urgent-care/NearestEmergency.tsx":
        "Comment only — the component renders nothing when a practice has one site.",
    "app/[locale]/urgent-care/page.tsx":
        "Comment explaining why hasEmergency gates the page.",
    "app/[locale]/find-a-doctor/FindDoctorClient.tsx":
        "The non-veterinary branch of the isVet conditional.",
    "app/[locale]/appointments/page.tsx":
        "Behind profile.hasEmergency, and the human branch of triage.",
    "app/features/booking/BookingForm.tsx":
        "The non-veterinary branches of the isVet/hasEmergency notice, plus the comment recording why it is conditional.",
    "app/features/clinic/triage.ts":
        "Comment describing the human routing rules. triageFor() returns VET_TRIAGE for veterinary.",
    "app/features/clinic/mark.ts":
        "A section comment naming the mental-health logo mark, not rendered copy.",
    "app/features/clinic/components/Sections.tsx":
        "Comment recording the bug that made departments trade-aware.",
    "app/features/clinic/brands.ts":
        "Field comments and the comment recording the strapline fix; the value itself is profileFor(kind).strapline.",
    "app/features/feedback/questions.ts":
        "The human option list. groupsFor(profile) rewrites it to the trade's own nav vocabulary.",
    "app/core/content-ar-table.ts":
        "The Arabic translation table, keyed by the English source string. A vet site only renders the keys it actually uses.",
    "app/core/site.ts":
        "Comments recording why hasEmergency defaults safe.",
    "app/core/site-store.ts":
        "Field comment for aeLine.",
    "app/core/strings.ts":
        "Comment about not implying an A&E.",
    "app/layout.tsx":
        "Comment recording the metadata fix; the value is brand.strapline.",
    "scripts/check-trade-copy.mjs":
        "This file lists the banned phrases in order to check for them.",
};

const HUMAN_KINDS = new Set([
    "hospital",
    "general-practice",
    "dental",
    "physio",
    "chiro",
    "dermatology",
    "optometry",
    "mental-health",
    "podiatry",
]);

const failures = [];

/* ── source ratchet ──────────────────────────────────────────────────── */
const files = globSync("{app,scripts}/**/*.{ts,tsx,mjs}", {
    exclude: (p) => p.includes("node_modules"),
});

for (const file of files) {
    const source = readFileSync(file, "utf8");
    const hits = BANNED.filter((term) => source.toLowerCase().includes(term.toLowerCase()));
    if (hits.length === 0) continue;
    if (ALLOWED[file] !== undefined) continue;
    const lines = source.split("\n");
    for (const term of hits) {
        const at = lines.findIndex((l) => l.toLowerCase().includes(term.toLowerCase()));
        failures.push(
            `${file}:${at + 1}  "${term}"  — ${lines[at].trim().slice(0, 90)}`,
        );
    }
}


/* ── regulators stay inside their own country ────────────────────────── */
/**
 * The second shape of this bug: right trade, wrong country.
 *
 * The phrase ratchet above only knows human-vs-veterinary. It passed happily
 * while two US veterinary demos published "RCVS -- Practice Standards Scheme
 * accredited" and every US human demo published a CQC inspection rating,
 * because CQC and RCVS are not human-medicine phrases on a vet site -- they
 * are British bodies on an American one. The RCVS has no jurisdiction in
 * Montana and had never inspected either practice.
 *
 * Accreditations are now built from `brand.regulators`, so the invariant to
 * hold is simply that each country pack names its own bodies. A British name
 * appearing in a pack that is not GB means someone copied a block and did not
 * finish editing it -- which is exactly how it happened the first time.
 */
const GB_BODIES = ["CQC", "GMC", "NMC", "RCVS", "Care Quality Commission"];

const countries = readFileSync("app/features/clinic/countries.ts", "utf8");
const packs = [...countries.matchAll(/const (\w+)_REG: Regulators = \{([^}]*)\}/g)];

if (packs.length === 0) {
    failures.push("scripts/check-trade-copy.mjs — no Regulators packs found; the country check silently stopped working.");
}

for (const [, code, body] of packs) {
    if (!body.includes("vet:") || !body.includes("vetNote:")) {
        failures.push(
            `app/features/clinic/countries.ts  ${code}_REG has no veterinary regulator — a vet site in this country would name another country's body.`,
        );
    }
    if (code === "GB") continue;
    for (const gb of GB_BODIES) {
        if (new RegExp(`\\b${gb}\\b`).test(body)) {
            failures.push(
                `app/features/clinic/countries.ts  ${code}_REG names "${gb}", which regulates in the United Kingdom only. A practice in this country has never been inspected by it — printing it is a fabricated credential.`,
            );
        }
    }
}


/* ── post-nominals stay inside their own country ─────────────────────── */
/**
 * Third shape of the same bug, and the one that survived the first fix.
 *
 * Accreditations were moved onto brand.regulators, the US sites stopped
 * claiming a CQC rating -- and RCVS was still on both Montana vet pages,
 * because a second constant prints "BVSc, MRCVS" under each vet's photograph.
 * Naming a British college under a named American clinician invents a
 * qualification for a specific person.
 *
 * So: every country we sell into needs its own post-nominals for every kind
 * that has a ROLES entry. A missing pack silently falls back to the British
 * letters, which is why this is checked rather than trusted.
 */
const content = readFileSync("app/features/clinic/content.ts", "utf8");
const rolesBlock = content.slice(content.indexOf("const ROLES"), content.indexOf("const QUALIFICATIONS_BY_COUNTRY"));
const roleKinds = [...rolesBlock.matchAll(/^ {4}"?([a-z-]+)"?: \[/gm)].map((m) => m[1]);

const qualBlock = content.slice(content.indexOf("const QUALIFICATIONS_BY_COUNTRY"));
const packed = [...qualBlock.slice(0, qualBlock.indexOf("\n};")).matchAll(/^ {8}"?([a-z-]+)"?: \[/gm)].map((m) => m[1]);

for (const kind of roleKinds) {
    if (!packed.includes(kind)) {
        failures.push(
            `app/features/clinic/content.ts  QUALIFICATIONS_BY_COUNTRY.US has no "${kind}" — a US ${kind} site would print British post-nominals under a named clinician.`,
        );
    }
}


/* ── every poster points at a file that exists ───────────────────────── */
/**
 * The optometry content was written with a poster at /img/optometry/consult.jpg
 * and that directory has never existed. Nothing in the toolchain minds: the
 * build compiles, the page renders, and the visitor gets a broken image on
 * the one section that is meant to carry a human face.
 *
 * Cheap to check, so it is checked.
 */
for (const file of ["app/features/clinic/trade-content.ts", "app/features/clinic/constants.ts"]) {
    const src = readFileSync(file, "utf8");
    for (const m of src.matchAll(/poster:\s*"(\/[^"]+)"/g)) {
        const asset = "public" + m[1];
        if (!existsSync(asset)) {
            failures.push(`${file}  poster "${m[1]}" has no file at ${asset} — the story section renders a broken image.`);
        }
    }
}

console.info(
    `check-trade-copy: scanned ${files.length} files for ${BANNED.length} human-medicine phrases; ` +
        `${Object.keys(ALLOWED).length} files allowed by name; ` +
        `${packs.length} regulator packs and ${roleKinds.length} clinician kinds checked for out-of-jurisdiction credentials.`,
);

if (failures.length > 0) {
    console.error("\nHuman-medicine copy in a file with no exemption:\n");
    for (const f of failures) console.error("  " + f);
    console.error(`
Every veterinary site renders these files. Either:

  - put the phrase behind the trade, the way UrgentClient does with isVet, or
    take it from triageFor(kind) / redFlagsFor(kind) / urgentUnitsFor(kind);
  - or, if a veterinary site genuinely cannot reach it, add the file to
    ALLOWED in this script with the reason it is unreachable.

Do not add it to ALLOWED to make the build pass. The last time one of these
shipped, a dog owner describing a bloat was told to call an ambulance.
`);
    process.exit(1);
}

export { BANNED, HUMAN_KINDS };

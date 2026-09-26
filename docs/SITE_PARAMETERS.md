# Every parameter that varies per clinic

One deployment serves every prospect site. What makes two sites different is a
row in `prospect_sites`, so this is the list of everything that row can or
should carry — and, honestly, everything it still cannot.

Three tiers:

- **Per site** — set on the registry row, different for every client.
- **Per trade** — derived from `kind` (see `features/clinic/practice-kinds.ts`
  and `features/clinic/content.ts`). A dentist and a vet get different answers
  without anyone typing them.
- **Per country** — derived from `country` (see `features/clinic/countries.ts`).
  Emergency number, currency, vocabulary, regulators.

A parameter is only listed as **shared** where it is still one clinic's content
rendered on every site. Those are the remaining falsehoods, and they are marked.

---

## 1. Identity — per site

| Field | Type | Notes |
|---|---|---|
| `identifier` | string | The subdomain label. `<identifier>.shielva.ai`. Reserved names refused. |
| `businessName` | string | Full legal-ish name, used in the title and footer. |
| `short` | string | Logo lockup line 1. Defaults to the first word of `businessName`. |
| `kicker` | string | Logo lockup line 2 ("Dental Care", "Family Health"). |
| `theme` | enum | One of 8 palettes. Absent → derived from the identifier hash. |
| `template` | enum | Section running order. Absent → default. |
| `iconPath` | string | R2 key under `website_builder/<identifier>/`. Absent → generated mark. |
| — `mark` | derived | Logo geometry. From `kind` + `identifier`. Not settable yet. |

## 2. Contact and location — per site

| Field | Type | Notes |
|---|---|---|
| `address` | string | Full street address. Shown on contact, footer, directory site filter, JSON-LD. |
| `city` | string | Falls back to the country's default city. |
| `country` | ISO-2 | **Drives tier 3 entirely.** Wrong value = wrong emergency number. |
| `phone` | string | Main switchboard. |
| `aeLine` | string | 24-hour emergency line. Falls back to `phone`, never invented. |
| `email` | string | Reception address. |
| `currency` | symbol | Falls back to the country's. |
| `emergencyNumber` | string | Falls back to the country's. Never guessed. |

## 3. What they do — currently per trade, should be per site

This is the tier the research feeds. Today these come from `kind`; a real
clinic offers a specific subset, and two dental practices are not identical.

| Parameter | Today | Should be |
|---|---|---|
| Departments / specialities | per trade | per site, seeded from trade |
| Treatments | per trade | per site, seeded from trade |
| Additional services | per trade | per site, seeded from trade |
| Appointment types (name, minutes, price) | per trade | per site |
| Prices | per trade × country factor | per site |
| Team (roles, names, languages, fees) | per trade, seeded by identifier | per site, optional real names |
| `hasEmergency` / `hasDepartments` / `hasHealthLibrary` | per trade | per site override |
| Strapline | per trade | per site |

## 4. Country-derived — never set per site unless overridden

`emergencyNumber` · `currency` · `defaultCity` · `samplePhone` ·
`emergencyDept` wording · `emergencyShort` ("A&E" vs "the ER") ·
`generalist` wording · `regulators` (null for unchecked markets — never invent)

## 5. Still shared across every site — the remaining gaps

Each of these is one clinic's content rendered on all of them.

| Constant | Where it renders | Why it is wrong |
|---|---|---|
| `STATS` | home KPI strip | "12,400 appointments a year", "7 clinicians" — contradicts the real team size |
| `ANNOUNCEMENTS` | announce bar | "Same-week appointments, seven clinicians" |
| `ACCREDITATIONS` | home | CQC/GMC/NMC — wrong outside the UK |
| `OPENING` | appointments, footer, JSON-LD | One clinic's hours |
| `FAQS` | home, FAQ page, JSON-LD | GP-specific questions |
| `PACKAGES` | home, hero | GP health-check packages, priced in £ |
| `REVIEWS` / `PATIENT_STORY` | patient story | Named people and a filmed story |
| `FACILITIES` | gallery | One building's rooms |
| `PROMISES` / `JOURNEY` | home | Generic but GP-shaped |
| `ARTICLES` | health library | GP articles; hidden when `hasHealthLibrary` is false |
| `SERVICES` | booking form, service pages, sections | The old GP service list |
| `CLINICIANS` | booking form, appointment flow, service pages | The nine invented GP partners |
| `DEPARTMENTS` | department carousel, hero variants | The six GP departments |
| `RED_FLAGS` / `SYMPTOMS` | triage flow | Clinically generic; safe, but GP-framed |

`/services`, `/find-a-doctor`, the footer and the JSON-LD are already
trade-correct. The list above is what is left.

---

## Minimum row for a new client

```json
{
  "identifier": "montaldo-dental",
  "businessName": "Montaldo Dental",
  "kind": "dental",
  "country": "US",
  "city": "Columbus",
  "address": "118 Main Street, Columbus, OH 43215",
  "phone": "+1 614 555 0142"
}
```

Everything else derives. `kind` and `country` are the two that matter: `kind`
decides which pages exist and what may be claimed, `country` decides the
emergency number. Both have safe defaults — `general-practice` (no emergency
department) and `112` — because a site that wrongly offers A&E, or prints the
wrong ambulance number, is worse than one that omits it.

## Valid `kind` values

`hospital` · `general-practice` · `dental` · `physio` · `chiro` ·
`dermatology` · `optometry` · `mental-health` · `podiatry` · `veterinary`

## Checked markets

`GB` · `US` · `AU` · `AE` · `MT` · `IE` · `IN`

Anything else gets `112`, the local currency symbol if supplied, and **no**
regulator — an unchecked market never claims a regulator it may not answer to.

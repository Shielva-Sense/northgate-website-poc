# Northgate — a clinic-website farm

One Next.js deployment that serves a complete, branded clinic website for any
number of practices. A new site is a row in a registry, not a build: the request
host carries an identifier (`<identifier>.shielva.ai`), the app looks it up, and
the same code renders that practice's name, colours, address, services, team,
prices and language.

Built to put a working website in front of a prospective client before the first
call. **Northgate Family Health is fictional**, and every photograph in
`public/img` is AI-generated — see [IMAGERY.md](IMAGERY.md).

## What a site includes

- Home page assembled from a section template (hero, proof, departments, team,
  pricing, gallery, journey, services…)
- Services catalogue and per-service pages
- Find-a-doctor directory
- Appointments: a two-field call-back form and a full booking flow
- Price list, health library, referrals, contact, privacy
- Urgent-care page that points to the right emergency number for the country
- English and Arabic (RTL), served from the same routes

## How one build becomes many sites

Every value that differs between practices comes from one of three tiers
([docs/SITE_PARAMETERS.md](docs/SITE_PARAMETERS.md) lists them all):

| Tier | Source | Examples |
|---|---|---|
| Per site | the registry row in MongoDB | name, logo lockup, theme, address, phone, template |
| Per trade | `kind` | hospital, dental, physio, chiro, dermatology, optometry, podiatry, veterinary |
| Per country | `country` | emergency number, currency, vocabulary, regulators, post-nominals |

Country packs exist for 16 markets: GB, IE, MT, US, MX, BR, CO, AR, ZA, MA, LY,
SA, AE, IN, ID and AU.

A dentist and a vet get different departments, treatments and copy without
anyone typing them. A build-time check (`scripts/check-trade-copy.mjs`) fails the
build if human-medicine wording can reach a veterinary site.

## Enquiries go to your CRM

Both enquiry forms post to `/api/enquiry`. The route validates the payload again
on the server, rate-limits it, and forwards it as JSON to a configurable webhook,
with an optional fallback destination. With no webhook configured the site still
works, but it returns `202 {"delivered": false}` instead of claiming the enquiry
arrived. Field list and setup: [CRM.md](CRM.md).

## API

| Route | Purpose |
|---|---|
| `GET/POST /api/sites` | Site registry. Create or update one site or a batch (Basic auth, rate-limited) |
| `POST /api/enquiry` | Call-back and booking enquiries, forwarded to the CRM webhook |
| `POST /api/feedback` | Prospect feedback and discovery answers from the in-page panel |
| `GET /api/submissions` | Read back what prospects submitted (its own hashed credentials, not the invite) |
| `POST /api/login` | The invite gate in front of preview sites |

## Stack

Next.js 16 (App Router, standalone output) · React 19 · TypeScript (strict) ·
SCSS modules with design tokens · MongoDB · Docker

## Run it locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. Without `MONGODB_URL` there is no registry, and
every host renders the built-in defaults.

```bash
pnpm lint    # ESLint, plus the client-hook and trade-copy guards
pnpm build
```

## Configuration

Set as environment variables at run time, never in the repo or as build args.

| Variable | What it does |
|---|---|
| `MONGODB_URL`, `SITES_DB_NAME`, `SITES_COLLECTION` | Site registry |
| `NEXT_PUBLIC_SITE_URL`, `CDN_PUBLIC_BASE_URL` | Public URLs for links and per-site icons |
| `POC_USER`, `POC_PASSWORD` | Invite gate for preview sites (unset = open) |
| `ENQUIRY_WEBHOOK_URL`, `ENQUIRY_FALLBACK_URL`, `ENQUIRY_WEBHOOK_TOKEN`, `ENQUIRY_WEBHOOK_AUTH_HEADER` | CRM delivery |
| `FEEDBACK_WEBHOOK_URL`, `FEEDBACK_STORE_PATH`, `FEEDBACK_API_USER_SHA`, `FEEDBACK_API_PASSWORD_HASH` | Feedback intake |
| `NOTIFICATIONS_URL`, `SUBMISSION_EMAIL_TO`, `SUBMISSION_ACTOR_EMAIL`, `SHIELVA_TENANT_ID` | Emailing enquiries and feedback through the platform's notifications service |

## Deploy

`Dockerfile` builds a multi-stage, standalone image: the runtime layer carries
only the server and static assets. One wildcard DNS record (`*.shielva.ai`) is
enough. Every new site after that is a `POST /api/sites`.

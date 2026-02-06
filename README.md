# DZTS Inmobiliaria

A real estate website built as a pnpm monorepo.

## Structure

```text
apps/
  frontend/   # Next.js website
  studio/     # Sanity Studio CMS
```

## Apps

### Frontend

Public-facing website built with Next.js 16 and React 19. Displays property listings for rent and sale, fetching content from Sanity CMS. Styled with Bootstrap 5.

### Studio

Sanity Studio for content management. Used to create and edit properties, images, and other site content.

## Requirements

- Node.js >= 20.0.0
- [pnpm](https://pnpm.io/) >= 10.0.0

## Getting Started

Install dependencies:

```bash
pnpm install
```

Run both apps in development mode:

```bash
pnpm dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Studio: [http://localhost:3333](http://localhost:3333)

## Scripts

| Command      | Description                          |
|--------------|--------------------------------------|
| `pnpm dev`   | Start both apps in development mode  |
| `pnpm build` | Build both apps for production       |

### Frontend (`apps/frontend/`)

| Command             | Description                          |
|---------------------|--------------------------------------|
| `pnpm dev`          | Start Next.js dev server             |
| `pnpm build`        | Production build                     |
| `pnpm lint`         | Run ESLint                           |
| `pnpm test:e2e`     | Run Playwright e2e tests (headless)  |
| `pnpm test:e2e:ui`  | Run e2e tests with Playwright UI     |
| `pnpm test:e2e:headed` | Run e2e tests in headed browser   |

### Studio (`apps/studio/`)

| Command        | Description                          |
|----------------|--------------------------------------|
| `pnpm dev`     | Start Sanity Studio                  |
| `pnpm build`   | Build for deployment                 |
| `pnpm deploy`  | Deploy to Sanity hosting             |
| `pnpm typegen` | Generate TypeScript types from schema|

## Environment Variables

Each app has a `.env.example` file. Copy it to `.env.local` and fill in your values:

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/studio/.env.example apps/studio/.env.local
```

Get the Sanity project ID and dataset from your [Sanity project settings](https://www.sanity.io/manage). The Web3Forms key is needed for the contact form — get one at [web3forms.com](https://web3forms.com).

## Cache Revalidation Webhook

The frontend uses on-demand cache revalidation so content changes published in Sanity appear immediately. This requires a webhook configured in the Sanity dashboard.

### 1. Generate a secret

```bash
openssl rand -hex 32
```

Add the output as `SANITY_REVALIDATE_SECRET` in `apps/frontend/.env.local`.

### 2. Create the webhook in Sanity

Go to **sanity.io/manage → Project → API → Webhooks → Add webhook** and configure:

| Setting | Value |
|---------|-------|
| Name | `Revalidate Next.js cache` |
| URL | `https://<your-domain>/api/revalidate` |
| Dataset | your dataset name |
| Trigger on | Create, Update, Delete |
| Filter | `_type in ["property", "siteSettings", "homePage", "propiedadesPage", "city", "propertyTypeCategory"]` |
| Projection | `{_type}` |
| Secret | same value as `SANITY_REVALIDATE_SECRET` |

Without the webhook (e.g. local development), cache entries still expire based on their `cacheLife` TTL (`"minutes"` or `"hours"`).

### Testing locally

With the dev server running, you can simulate a webhook call using curl. Replace `YOUR_SECRET` with your `SANITY_REVALIDATE_SECRET` value and `_type` with the Sanity document type to revalidate:

```bash
BODY='{"_type":"property"}'
SECRET="YOUR_SECRET"
TS=$(date +%s%3N)
SIG=$(echo -n "${TS}.${BODY}" \
  | openssl dgst -sha256 -hmac "$SECRET" -binary \
  | openssl base64 \
  | tr '+/' '-_' | tr -d '=')

curl -s http://localhost:3000/api/revalidate \
  -X POST \
  -H "Content-Type: application/json" \
  -H "sanity-webhook-signature: t=${TS},v1=${SIG}" \
  -d "$BODY"
```

A successful response looks like: `{"revalidated":true,"tag":"property"}`

## Analytics

The site supports two analytics providers, both optional and independent of each other.

### Vercel Analytics

Tracks page views and real Core Web Vitals from actual users. No cookies, privacy-friendly, ~1KB script.

**Setup:**

1. Go to your [Vercel project dashboard](https://vercel.com/dashboard)
2. Click the **Analytics** tab
3. Click **Enable**

That's it — the `<Analytics />` component is already in the code. It only sends data in production Vercel deployments.

**Free tier:** 2,500 events/month.

### Google Analytics (GA4)

Provides detailed visitor insights, traffic sources, user flows, and property page engagement.

**Setup:**

1. Go to [analytics.google.com](https://analytics.google.com)
2. Click **Start measuring** → create an Account (e.g., "DZTS Inmobiliaria")
3. Create a **Property** (e.g., "DZTS Website")
4. Choose **Web** as the platform and enter your site URL
5. Copy your **Measurement ID** (looks like `G-XXXXXXXXXX`)
6. Add it to your environment:

```bash
# apps/frontend/.env.local
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

For Vercel deployments, add the same variable in **Vercel project settings → Environment Variables**.

Google Analytics is conditionally loaded — if the env var is not set, no GA script is included.

**Free tier:** Unlimited for most sites.

## E2E Tests

The frontend includes Playwright end-to-end smoke tests in `apps/frontend/e2e/`. Tests assert page structure and navigation rather than CMS content, making them resilient to Sanity content changes.

### Setup

Install the Chromium browser for Playwright (one-time):

```bash
pnpm --filter dzts-website exec playwright install --with-deps chromium
```

### Running

Tests require a production build to run (`pnpm start` is used as the web server):

```bash
cd apps/frontend
pnpm build
pnpm test:e2e
```

For interactive debugging, use the Playwright UI:

```bash
pnpm test:e2e:ui
```

### Test Files

| File | Coverage |
|------|----------|
| `e2e/home.spec.ts` | Home page structure, search form, navigation to listings |
| `e2e/propiedades.spec.ts` | Properties listing, filters, URL state, active badges |
| `e2e/property-detail.spec.ts` | Detail page structure, contact modal, JSON-LD, 404 |
| `e2e/not-found.spec.ts` | 404 page heading, navigation links |
| `e2e/navigation.spec.ts` | Header, footer, brand link, breadcrumbs |

## CI

### Lint & Build

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every pull request targeting `dev` or `main`. It performs:

1. **Lint** the frontend (`pnpm --filter frontend lint`)
2. **Build** the frontend (`pnpm --filter frontend build`)
3. **Build** the studio (`pnpm --filter dzts-studio exec sanity build`)

The workflow uses placeholder environment variables so builds can compile without real Sanity/Web3Forms credentials. The studio build uses `exec sanity build` to skip the `prebuild` hook (schema extraction + typegen), which requires a live Sanity API connection.

### E2E Tests

A separate workflow (`.github/workflows/e2e.yml`) runs Playwright tests on PRs to `dev` or `main` when `apps/frontend/` or the workflow file changes. It builds the frontend with real Sanity credentials (from GitHub Secrets) and runs the full e2e suite.

Required GitHub Secrets (Settings > Secrets and variables > Actions):

| Secret | Description |
|--------|-------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID (same as `.env.local`) |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name (same as `.env.local`) |

On failure, the HTML report and test results are uploaded as workflow artifacts for debugging.

### Dependabot

Dependabot (`.github/dependabot.yml`) opens weekly PRs for outdated dependencies, grouped by ecosystem:

| Group | Packages |
|-------|----------|
| `next-ecosystem` | `next`, `next-*`, `@next/*`, `eslint-config-next` |
| `react` | `react`, `react-dom`, `@types/react`, `@types/react-dom` |
| `sanity` | `sanity`, `@sanity/*`, `next-sanity` |
| `eslint` | `eslint`, `eslint-*`, `@eslint/*`, `@typescript-eslint/*` |
| `bootstrap` | `bootstrap`, `bootstrap-icons`, `@popperjs/*` |

GitHub Actions versions (`actions/checkout`, `actions/setup-node`, etc.) are also tracked separately.

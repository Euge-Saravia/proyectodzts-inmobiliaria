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

## Static Export and Deployment

The frontend is a static site (`output: "export"` in `next.config.ts`).

```bash
pnpm --filter dzts-website build   # writes apps/frontend/out/
```

Upload the contents of `apps/frontend/out/` to shared hosting. The bundled `.htaccess` (in `apps/frontend/public/.htaccess`, copied into `out/` at build) sets security headers, normalises trailing slashes, and wires up the custom 404 page. Replace with the equivalent nginx config if the host is nginx.

Content updates require a rebuild and re-upload. For content editors, this is fully automated — see "Automated Deploys" below. The manual checklist is kept here for the first-ever deploy and as a fallback when the automation isn't available.

### Manual deployment checklist

#### Before building

1. **Checkout and sync `dev`** (or whichever branch maps to production):
   ```bash
   git checkout dev && git pull
   ```
2. **Set production env vars in `apps/frontend/.env.local`.** These get baked into the static bundle at build time.
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=<project-id>
   NEXT_PUBLIC_SANITY_DATASET=production       # NOT "development"
   NEXT_PUBLIC_SITE_URL=https://www.dzts.com.ar
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # or leave blank
   SITE_ENV=production                         # required for robots.txt to emit Allow: /
   ```
   `NEXT_PUBLIC_SITE_URL` drives the canonical URL, sitemap, and OpenGraph tags. Without it, `sitemap.xml` emits relative URLs and `llms.txt` is skipped. Without `SITE_ENV=production`, `robots.txt` emits `Disallow: /` and the site gets deindexed from search engines.
3. **Confirm the production Sanity dataset has the expected content.** If you've been editing in `development`, either copy docs across (`sanity dataset export` / `import`) or point the deploy at the `development` dataset intentionally.

#### Build

4. **Install with a frozen lockfile** (matches CI exactly):
   ```bash
   pnpm install --frozen-lockfile
   ```
5. **Clean previous outputs, then build:**
   ```bash
   rm -rf apps/frontend/.next apps/frontend/out
   pnpm --filter dzts-website build
   ```
6. **Smoke-test locally** before uploading anything:
   ```bash
   pnpm --filter dzts-website start
   ```
   Visit `http://localhost:3000/`, click into a property, test `/propiedades` filters, and hit a non-existent URL to confirm the 404 page.
7. **Verify the build output:**
    - `apps/frontend/out/.htaccess` is present (easiest file to lose — breaks trailing-slash rewrites and security headers).
    - `apps/frontend/out/sitemap.xml` references the production URL (not localhost, not relative).
    - `apps/frontend/out/robots.txt` says `Allow: /`. If it says `Disallow: /`, `SITE_ENV` was not set to `production` — rebuild before uploading.
    - `apps/frontend/out/llms.txt` exists.

#### Backup the current live site (first deploy only)

8. Connect to FTP, navigate to the webroot (e.g. `/public_html/`).
9. Create `/public_html/backup/` and move the current live site into it. FTP clients "move" by downloading and re-uploading — slow and risky for a live site. Prefer:
    - **SSH or cPanel File Manager** to do a server-side `mv`, or
    - **Download the live site to local first** as a true backup, then delete over FTP and upload the new build.
10. Add a minimal `.htaccess` inside `/public_html/backup/` to prevent directory listing:
    ```apache
    Options -Indexes
    ```

#### Upload

11. Upload the **contents** of `apps/frontend/out/` to `/public_html/` (not the `out/` folder itself). Make sure **dotfiles are included** — `.htaccess` is the critical one, and many FTP clients hide dotfiles by default. In FileZilla: Server menu → Force showing hidden files.
12. After upload, confirm on the server:
    - `/public_html/.htaccess` exists.
    - `/public_html/index.html` has a fresh modified time.
    - `/public_html/backup/` is still intact and reachable at `https://www.dzts.com.ar/backup/`.

#### Post-deploy smoke test

13. Hard-reload in an incognito window (`Ctrl/Cmd+Shift+N`, then `Ctrl/Cmd+F5`).
14. Check in this order:
    - Home page renders; hero image and office map pin appear.
    - `/propiedades/` lists properties (test both `/propiedades` and `/propiedades/` — the `.htaccess` rewrite should handle both).
    - A property detail page renders with map, JSON-LD, and Ficha button.
    - `/nonexistent-url` shows the branded 404.
    - `/sitemap.xml` and `/robots.txt` load correctly, with `robots.txt` saying `Allow: /`.
15. If the host has Cloudflare or a CDN in front, purge its cache after deploy — visitors may see cached old assets for up to an hour otherwise.

#### First-deploy-only gotchas

- **MIME types.** Some shared hosts don't serve `.webp`, `.woff2`, `.mjs`, or `.avif` with the right `Content-Type`. If DevTools shows the file downloading with the wrong type, add `AddType` rules to `.htaccess`.
- **Case-sensitive paths.** Local filesystems are usually case-insensitive; the server likely isn't. `<img src="/Images/foo.jpg">` that works locally may 404 on the server.
- **Trailing-slash redirect loop.** The `.htaccess` rewrite adds trailing slashes. If the host *also* adds them, you get a redirect loop. Check DevTools → Network for `301 → 301 → 301` on a page and remove one of the rules.

## Automated Deploys (Sanity publish → shared hosting)

The workflow at `.github/workflows/deploy.yml` rebuilds the site and uploads it over FTP. The content editor only ever touches Sanity Studio — the rest happens in the background.

### Triggers

- **`repository_dispatch: sanity-publish`** — fired by a Sanity webhook when a document is published. This is the editor-facing path.
- **Push to `main`** (paths `apps/frontend/**` or the workflow file) — auto-deploys code changes after a PR merge.
- **Manual** — GitHub → Actions → "Deploy Frontend" → Run workflow, as a fallback.

A concurrency group (`deploy-frontend`) coalesces rapid-fire triggers into a single deploy.

### One-time setup

Production and preview run against different Sanity projects, so credentials are scoped through GitHub Environments rather than repo-level variables. Each workflow binds to the right environment (`deploy.yml` → `Production`, `e2e.yml` → `Preview`); `ci.yml` uses placeholder values and needs no environment.

**1. GitHub Environments** (Settings → Environments). Create two:

- **`Production`** — used by `deploy.yml`. Restrict deployments to the `main` branch and add a required reviewer for the first few runs as a safety belt.
- **`Preview`** — used by `e2e.yml` for PR builds. No branch restriction, no required reviewer.

**2. `Production` environment** — add the following:

| Type | Name | Value |
|------|------|-------|
| Variable | `NEXT_PUBLIC_SANITY_PROJECT_ID` | Production Sanity project ID |
| Variable | `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset name (typically `production`) |
| Variable | `NEXT_PUBLIC_SITE_URL` | Live site URL, e.g. `https://www.dzts.com.ar` |
| Variable | `NEXT_PUBLIC_GA_MEASUREMENT_ID` | (optional) GA4 measurement ID |
| Secret | `FTP_SERVER` | FTP host (e.g. `p1000115.ferozo.com`) |
| Secret | `FTP_USERNAME` | FTP username |
| Secret | `FTP_PASSWORD` | FTP password |
| Secret | `FTP_SERVER_DIR` | Remote webroot, must end with `/` (e.g. `/public_html/`) |

**3. `Preview` environment** — add the non-prod Sanity project's `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` as **Secrets** (`e2e.yml` reads them as `secrets.*`, not `vars.*`).

If any of these names also exist as repo-level Variables/Secrets from earlier setup, delete them — environment values take precedence, but leaving repo-level duplicates around invites silent overrides.

**4. GitHub fine-grained PAT for Sanity → GitHub**:

Create at https://github.com/settings/personal-access-tokens with:
- Repository access: only this repo
- Permission: **Contents: Read**, **Actions: Write**

**4. Sanity webhook** (sanity.io/manage → Project → API → Webhooks → Add webhook):

| Setting | Value |
|---------|-------|
| Name | `Deploy frontend` |
| URL | `https://api.github.com/repos/<owner>/<repo>/dispatches` |
| Dataset | your dataset |
| Trigger on | Create, Update, Delete |
| Filter | `_type in ["property", "siteSettings", "homePage", "propiedadesPage", "city", "propertyTypeCategory"]` |
| Projection | `{ "event_type": "sanity-publish", "client_payload": { "_type": _type, "_id": _id } }` |
| HTTP method | `POST` |
| HTTP headers | `Authorization: Bearer <PAT>` and `Accept: application/vnd.github+json` |
| API version | `v2021-03-25` or later |

Once this is in place, publishing in Sanity triggers a new run under GitHub → Actions within seconds.

### Editor workflow

Editing and publishing a property in Sanity Studio. That's it. A deploy kicks off automatically and finishes in ~2 minutes — the live site reflects the change shortly after.

If a deploy fails, GitHub sends an email to the repo watchers. To retry, open Actions → latest run → "Re-run failed jobs", or just republish in Sanity.

### Vercel preview builds

The repo is also connected to a Vercel project, but production lives on the FTP host — Vercel only serves PR/`dev` previews. To prevent `main` pushes from producing a Vercel deployment that could be mistaken for production, the project's **Settings → Git → Ignored Build Step** is set to:

```bash
if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then exit 0; else exit 1; fi
```

This skips Vercel builds on `main` (status: "Ignored") while letting `dev` and PR previews build normally. Vercel and GitHub Actions are independent environments — Vercel uses its own env vars defined in the Vercel project; GitHub Actions uses the GitHub Environments described above. Don't expect them to share secrets.

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

A separate workflow (`.github/workflows/e2e.yml`) runs Playwright tests on PRs to `dev` or `main` when `apps/frontend/` or the workflow file changes. It binds to the `Preview` GitHub Environment and builds the frontend with the non-prod Sanity credentials defined there. The required secrets (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`) live on the `Preview` environment, not at the repo level.

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

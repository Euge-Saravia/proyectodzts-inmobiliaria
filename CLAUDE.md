# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About Website

This is a small real estate website, to work as a catalog of the available properties for rent or sale.

## Monorepo Structure

This is a **pnpm workspace monorepo** with two apps:

```text
apps/
  frontend/   # Next.js 16 website (public-facing)
  studio/     # Sanity Studio CMS (content management)
```

**Note**: The monorepo uses simple pnpm workspaces without Turborepo. This was a deliberate decision to keep the setup simple for a two-app monorepo without shared packages.

## Build & Development Commands

From the repository root:

```bash
pnpm install  # Install all dependencies
pnpm dev      # Start both apps in parallel (frontend + studio)
pnpm build    # Production build for both apps
```

Frontend-specific (from `apps/frontend/`):

```bash
pnpm dev          # Start Next.js dev server with Turbopack
pnpm build        # Static export (writes to ./out)
pnpm start        # Serve the static export locally with `serve`
pnpm lint         # Run ESLint
pnpm test:e2e     # Run Playwright e2e tests (requires build first)
pnpm test:e2e:ui  # Run e2e tests with Playwright UI
```

The frontend is a **fully static site** (`output: "export"` in `next.config.ts`).
`pnpm build` produces `apps/frontend/out/` which is uploaded to shared hosting.
There is no Node server in production — see "Static Export" below.

Studio-specific (from `apps/studio/`):

```bash
pnpm dev      # Start Sanity Studio
pnpm build    # Build for deployment
pnpm deploy   # Deploy to Sanity hosting
pnpm typegen  # Generate TypeScript types from schema
```

## Model Delegation

The main Opus agent delegates coding tasks to lighter models via custom agents in `.claude/agents/`. The Explore subagent (built-in, Haiku) handles codebase search and file discovery automatically.

| Tier | Agent | Model | Use For |
|------|-------|-------|---------|
| **Quick Fix** | `quick-fix` | Haiku | Typos, import changes, renames, toggling a flag, single constant changes |
| **Implement** | `implementer` | Sonnet | Components, bug fixes, schema changes, CSS, lint fixes, new routes, caching updates |
| **Architect** | _(main agent)_ | Opus | Multi-system debugging, architecture decisions, planning, PR reviews, new patterns |

### Delegate to `implementer` (Sonnet) when:

- Creating or modifying a component + its CSS
- Fixing a bug isolated to 1-2 files
- Adding/modifying a Sanity schema type
- Fixing lint or TypeScript errors
- Writing CSS/styling changes
- Adding a new route/page with straightforward requirements
- Writing or updating e2e tests in `apps/frontend/e2e/`

### Delegate to `quick-fix` (Haiku) when:

- Fixing typos or wording
- Adding/removing an import
- Renaming a variable or file
- Changing a single constant value
- Toggling a boolean flag

### Keep on Opus (handle directly) when:

- Task touches 3+ files with interdependencies
- Architecture or design decisions are needed
- Debugging complex issues that require reasoning across multiple systems
- Planning mode
- PR reviews or code audits
- Tasks where the user is asking for opinions/recommendations
- New patterns not yet established in the codebase

## Tech Stack

### Frontend (`apps/frontend/`)

- **Next.js 16** with App Router
- **React 19** with Server Components by default
- **TypeScript** with strict mode
- **Bootstrap 5.x** for styling
- **next-sanity** for CMS integration

### Studio (`apps/studio/`)

- **Sanity Studio v5** for content management
- **React 19**
- **TypeScript**

## Environment Variables

Each app has its own `.env.local` file with different prefixes (Next.js uses `NEXT_PUBLIC_`, Sanity Studio uses `SANITY_STUDIO_`).

### Frontend (`apps/frontend/.env.local`)

| Variable                         | Description                       |
| -------------------------------- | --------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID`  | Sanity project identifier         |
| `NEXT_PUBLIC_SANITY_DATASET`     | Sanity dataset name               |
| `NEXT_PUBLIC_SITE_URL`           | Production site URL (for sitemap.xml and robots.txt) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`  | Google Analytics 4 measurement ID (optional, e.g. `G-XXXXXXXXXX`) |

### Studio (`apps/studio/.env.local`)

| Variable                   | Description               |
| -------------------------- | ------------------------- |
| `SANITY_STUDIO_PROJECT_ID` | Sanity project identifier |
| `SANITY_STUDIO_DATASET`    | Sanity dataset name       |

See `.env.example` files in each app for templates.

## Architecture

### Frontend

Next.js App Router project with route groups:

- `apps/frontend/src/app/` - Root layout (html/body/fonts/bootstrap)
- `apps/frontend/src/app/(site)/` - Site layout (header/footer/WhatsApp button) for public pages
- `apps/frontend/src/app/(print)/` - Minimal layout (no chrome) for print-optimized pages
- `apps/frontend/src/components/` - React components
- `apps/frontend/src/lib/` - Shared utility functions (e.g., `filters.ts`)
- `apps/frontend/src/types/` - Shared TypeScript type definitions (e.g., `filters.ts`)
- `apps/frontend/src/sanity/` - Sanity client and configuration
- `apps/frontend/src/styles/` - Global styles and CSS variables

Path alias: `@/*` maps to `./src/*` within the frontend app

### Studio

Sanity Studio project:

- `apps/studio/schemaTypes/` - Content schema definitions
- `apps/studio/sanity.config.ts` - Studio configuration

## Git Workflow

- **Always create a feature branch** from `dev` before starting new work: `git checkout dev && git pull && git checkout -b feat/feature-name`
- **Never commit directly to `dev` or `main`** unless explicitly asked
- **Default PR Target**: Create PRs against the `dev` branch, not `main`
- Feature branches follow the naming convention: `feat/feature-name`
- Push changes and create PRs using `gh pr create` command

## CI

Two GitHub Actions workflows run on PRs to `dev` and `main`:

### Lint & Build (`.github/workflows/ci.yml`)

1. **Lint frontend**: `pnpm --filter frontend lint`
2. **Build frontend**: `pnpm --filter frontend build`
3. **Build studio**: `pnpm --filter dzts-studio exec sanity build`

- Uses `ubuntu-latest`, Node 24, pnpm 10.
- Placeholder env vars (`ci-placeholder`) satisfy build-time validation without real credentials.
- Studio build uses `exec sanity build` instead of `pnpm build` to skip the `prebuild` hook (schema extraction + typegen require a live Sanity API connection).
- `--frozen-lockfile` ensures lockfile stays in sync with `package.json`.

### E2E Tests (`.github/workflows/e2e.yml`)

- Runs Playwright e2e tests against a production build of the frontend.
- Only triggers when `apps/frontend/` or the workflow file changes (path filter).
- Binds to the GitHub `Preview` environment; reads `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` from that environment's Secrets (non-prod Sanity project). `deploy.yml` binds to `Production` for the real Sanity project + FTP credentials. `ci.yml` is unscoped and uses placeholder values.
- Uploads `playwright-report/` and `test-results/` as artifacts on failure.
- The pnpm filter name for the frontend is `dzts-website` (the `name` field in `package.json`), not `frontend`.

### Dependabot (`.github/dependabot.yml`)

- Opens weekly PRs (Mondays) for outdated npm dependencies and GitHub Actions versions.
- npm updates are grouped by ecosystem (`next-ecosystem`, `react`, `sanity`, `eslint`, `bootstrap`) to reduce PR noise. Ungrouped packages get individual PRs.
- Dependabot PRs target the default branch and trigger the CI workflow, so lint + build are validated before merge.

## Page Structure & Routes

### Frontend Routes

- `/` - Home page with search, featured properties, and location map
- `/propiedades` - Properties listing page with filters, pagination, and active filter badges
- `/propiedades/[slug]` - Property detail page with images, description, JSON-LD structured data, and location map
- `/propiedades/[slug]/ficha` - Print-optimized property sheet (no header/footer, `(print)` route group)
- Custom `not-found.tsx` (branded 404 page) and `error.tsx` (error boundary with retry) at app root and `(site)` route group

### Content Integration

- Property schema includes: title, subtitle, address, description, price, images, operationType (rent/sale), currency, city, and propertyType
- Site Settings singleton in Sanity stores office address for home page map display
- All property and site data is fetched server-side via `sanityFetch` for optimal performance

## Recent Implementation Notes

- Canonical URLs are set via `resolveMetadata()` using `ContentDefaults.canonicalUrl`; `metadataBase` in `apps/frontend/src/app/layout.tsx` is only set when `NEXT_PUBLIC_SITE_URL` is defined (no fallback URL).
- For site URLs and SEO metadata, rely on environment variables or Sanity-managed content only; avoid hardcoded fallback domains.
- Avoid hardcoded content when possible; prefer environment variables or Sanity-managed content.
- Breadcrumb JSON-LD is generated in `apps/frontend/src/components/Breadcrumb.tsx`; pass `href` for all breadcrumb items (including the current page) to populate the schema.
- Home page uses `<Suspense>` to stream featured properties, home sections, and map with skeleton fallbacks.
- LCP image priority is on the home hero background (`SearchProperties`), not on the header logo.
- Reduced motion: smooth scroll falls back to `behavior: "auto"`, carousel auto-advance is disabled, and global CSS reduces animations when `prefers-reduced-motion` is set.
- Header nav background uses `--header-nav-bg` from `apps/frontend/src/styles/variables.css` (no inline style).
- Map iframe titles are passed via the `MapSection` `title` prop for contextual SEO.
- Sanity CDN preconnect is included in `apps/frontend/src/app/layout.tsx`.
- `global-error.tsx` exists as a root error boundary with its own `<html>` and `<body>`.
- Sitemap static entries omit `lastModified` to avoid `new Date()` on every build.
- Disabled pagination controls render as `<span>` instead of `<a>`.
- Footer certification images are set to `loading="lazy"`.
- Inter font no longer sets an unused CSS variable.
- Property detail pages export `generateStaticParams()` to pre-render available property slugs at build time.

## Components

- **MapSection** - Reusable component for displaying embedded Google Maps. Renders full-width iframe (450px height) when address is provided, returns null if no address exists.
- **ShareButton** - Client component with Web Share API (mobile) / clipboard copy with "Link copiado" feedback (desktop). Used on the property detail page.
- **FichaActions** - Client component with "Imprimir Ficha" (`window.print()`) and "Compartir" (same share logic as ShareButton) buttons. Used on the print-optimized ficha page.

## Conventions

- Components in `/app` are Server Components unless marked with `"use client"`
- Use Next.js Metadata API for SEO (exported `metadata` object). The root layout uses a `title.template` (`"%s | DZTS Inmobiliaria"`), so child pages only set the page-specific part (e.g., `title: "Propiedades"`, not `"Propiedades | DZTS Inmobiliaria"`).
- Use `next/image` for optimized images
- Dark mode supported via `prefers-color-scheme` CSS media query.
- Don't add too many comments to the code.
- Use double quotes for strings (Prettier is pre-configured for this).
- Use mobile first for css.
- Prefer bootstrap css classes and components over custom css.
- Use CSS over JavaScript when possible for animations and dynamic behavior.
- Format prices with `toLocaleString("es-AR")` and display currency as `AR$`/`US$` (not `ARS`/`USD`).
- Shared types go in `src/types/`, shared utilities in `src/lib/`. Do not duplicate type definitions or utility functions across components — import from the shared location.

## Static Export

The frontend is deployed as a static site to shared hosting:

- `next.config.ts` sets `output: "export"` and `trailingSlash: true`.
- `pnpm build` emits `apps/frontend/out/`; upload that directory to the host.
- There is **no Node server** in production — no API routes, no middleware, no runtime caching, no server actions.
- `images.unoptimized: true` disables the Next.js image optimizer (no server to run it). `next/image` still works and emits plain `<img>` tags.
- Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) and the trailing-slash redirect live in `apps/frontend/public/.htaccess`, which Next copies into `out/`. Replace with the equivalent nginx config if the host is nginx.
- `/propiedades` fetches **all** active properties at build time. Filtering and pagination happen client-side in `PropertiesListing.tsx` via `useSearchParams`.
- Content updates require a **rebuild + redeploy**. This is automated via `.github/workflows/deploy.yml`: a Sanity webhook fires a `repository_dispatch: sanity-publish` event, the workflow runs `pnpm build`, and `apps/frontend/out/` is uploaded over FTP. See README "Automated Deploys" for the setup. There is no `/api/revalidate` route.

## SEO

- Root layout defines `metadata.title.template` so child pages only set the page-specific title string.
- Property detail pages include `<script type="application/ld+json">` with Schema.org `RealEstateListing` data (name, price, address, images).
- Property detail pages generate OpenGraph metadata via `generateMetadata()`.
- Ensure only one `<h1>` per page. Section headings within page content should use `<h2>` or lower.
- **robots.txt** (`src/app/robots.ts`): Environment-aware. Reads `SITE_ENV`, falling back to `VERCEL_ENV`. Only `"production"` allows indexing; everything else emits `Disallow: /`. `SITE_ENV=production` is set by `.github/workflows/deploy.yml` for FTP builds; `VERCEL_ENV` is auto-injected by Vercel, which keeps preview deploys blocked from search engines automatically.
- **sitemap.xml** (`src/app/sitemap.ts`): Dynamically generated. Includes home, `/propiedades`, and all property detail pages fetched from Sanity.
- **llms.txt** (`src/app/llms.txt/route.ts`): Markdown file for AI agents/LLMs ([spec](https://llmstxt.org/)). Lists main pages and all properties to help LLMs understand site content.

## E2E Tests

Playwright e2e smoke tests live in `apps/frontend/e2e/`. Config is at `apps/frontend/playwright.config.ts`.

### Test Design Principles

- Tests assert **page structure** (element existence, selectors, navigation URLs) rather than CMS content text, making them resilient to Sanity content changes.
- Static UI labels hardcoded in source code (e.g., "Buscar", "Aplicar filtros", "404", "Ficha", "Compartir") are safe to assert.
- Tests navigate from the listing page to discover property detail slugs dynamically — no hardcoded slugs.
- **When a test fails, fix the feature/bug first** — don't make the test more permissive just to pass. Investigate the root cause before adjusting test expectations.

### Running Tests

Tests require a production build (Playwright's `webServer` starts `pnpm start`):

```bash
pnpm build && pnpm test:e2e     # from apps/frontend/
```

### Key Selectors Used by Tests

When modifying components, be aware these selectors are used by e2e tests:

| Selector | Component | Tests |
|----------|-----------|-------|
| `#operacion`, `#propiedad`, `#localidad`, `#dormitorios` | `SearchProperties` | `home.spec.ts` |
| `button.btn-custom` | `SearchProperties` (search button) | `home.spec.ts` |
| `#filters-form` | `PropertiesFilters` | `propiedades.spec.ts` |
| `label[for='operacion-venta']` | `PropertiesFilters` (radio) | `propiedades.spec.ts` |
| `a[href^="/propiedades/"]` | `PropertyCard` (card links) | `propiedades.spec.ts`, `property-detail.spec.ts` |
| `.badge .btn-close` | `ActiveFilterBadges` | `propiedades.spec.ts` |
| `#propertyCarousel` | `ImageCarousel` | `property-detail.spec.ts` |
| `a:has-text('Ficha')` | Property detail (ficha link) | `property-detail.spec.ts` |
| `button:has-text('Compartir')` | `ShareButton` | `property-detail.spec.ts` |
| `nav[aria-label="Breadcrumb"]` | `Breadcrumb` | `navigation.spec.ts`, `propiedades.spec.ts`, `property-detail.spec.ts` |
| `.navbar-brand` | `Header` | `navigation.spec.ts` |
| `footer.site-footer` | `Footer` | `navigation.spec.ts` |
| `script[type="application/ld+json"]` | Property detail page | `property-detail.spec.ts` |

### Configuration Notes

- The `e2e/` directory is excluded from `tsconfig.json` — Playwright handles its own TypeScript compilation.
- Playwright artifact directories (`test-results/`, `playwright-report/`, `blob-report/`, `playwright/.cache/`) are in `.gitignore`.
- Chromium only (single project). Retries: 2 in CI, 0 locally. Workers: 1 in CI.

## Recent Implementation Notes

- Listing skeleton: `apps/frontend/src/app/(site)/propiedades/loading.tsx` mirrors `PropertiesLayout` (filters sidebar + badges/count + grid).
- Property detail skeleton: `apps/frontend/src/app/(site)/propiedades/[slug]/loading.tsx` includes carousel-sized media + 450px map placeholder.
- Sanity property images can have `url`/`metadata` as `null`; normalize before passing to `ImageCarousel` and only cast to `SanityImageSource` when `url` is present.
- `ImageCarousel` accepts `asset?: SanityImageSource | null` and `lqip?: string | null`. Uses `.quality(80)` for consistent compression.
- Property detail `description` is Portable Text; use `PortableTextBlock[] | null` and import `@portabletext/types` (dependency added to frontend).
- `FilterOption` and `FilterOptions` types live in `src/types/filters.ts`. The `parseMultiple()` and `buildFilterOptions()` helpers live in `src/lib/filters.ts`. Both pages and multiple components import from these shared modules.
- `ShareButton` uses Web Share API on mobile (native share sheet) and clipboard copy with "Link copiado" feedback badge on desktop.
- Property detail and ficha share query/types via `src/sanity/queries/propertyDetail.ts`.
- Only one image per page should have `priority` (the LCP candidate). Do not mark logos or secondary images as priority.
- The `html` element uses `lang="es"` (Spanish site targeting Argentine audience).
- Home page sections come from the `homePage` singleton (`apps/frontend/src/sanity/queries/homePage.ts`) and render via `TextImageSection` with Portable Text and images.
- `homePage.sections[]` includes optional `anchorId` for header anchors (e.g., `/#servicios`, `/#nosotros`).
- Header smooth-scrolls to anchors when already on `/` and updates the hash without full navigation.
- `TextImageSection` supports a carousel (multiple images) via `SectionCarousel` component. Always uses `urlFor()` for images (requires `_id` in GROQ query).
- Anchored sections use `scroll-margin-top: 60px` to offset the sticky header.
- The `/propiedades` listing page fetches all active properties at build time and passes them to `PropertiesListing.tsx`, a client component that reads `useSearchParams` to handle filtering and pagination without navigation round-trips.
- Route groups: `(site)` wraps pages with header/footer/WhatsApp button via its own layout; `(print)` provides a minimal layout for the ficha page. Root layout only has html/body/fonts/bootstrap.
- The ficha page (`/propiedades/[slug]/ficha`) uses raw `<img>` tags (not `next/image`) for print reliability. It has `robots: { index: false, follow: false }`.
- Property detail and ficha pages share Sanity queries/types via `src/sanity/queries/propertyDetail.ts`.
- Property detail page includes: "Ficha" button (opens ficha in new tab), "Compartir" (ShareButton), WhatsApp share icon, and "Consultar por WhatsApp" full-width button.
- WhatsApp consultation URL is built from `siteSettings.whatsappNumber` with a pre-filled message including the property name.
- Sold/rented properties display a status banner ribbon (CSS-only, positioned absolute) overlaying the image carousel.
- `TextImageSection` displays images in large circles (full column width, `border-radius: 50%`, `aspect-ratio: 1/1`).

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
pnpm build        # Production build
pnpm start        # Run production server
pnpm lint         # Run ESLint
pnpm test:e2e     # Run Playwright e2e tests (requires build first)
pnpm test:e2e:ui  # Run e2e tests with Playwright UI
```

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
- Updating caching (`cacheLife`/`cacheTag`) on existing functions
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
| `NEXT_PUBLIC_WEB3FORMS_KEY`      | Web3Forms API key for contact form|
| `NEXT_PUBLIC_SITE_URL`           | Production site URL (for sitemap.xml and robots.txt) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`  | Google Analytics 4 measurement ID (optional, e.g. `G-XXXXXXXXXX`) |
| `SANITY_REVALIDATE_SECRET`       | HMAC secret for Sanity webhook (server-only, no `NEXT_PUBLIC_` prefix) |

### Studio (`apps/studio/.env.local`)

| Variable                   | Description               |
| -------------------------- | ------------------------- |
| `SANITY_STUDIO_PROJECT_ID` | Sanity project identifier |
| `SANITY_STUDIO_DATASET`    | Sanity dataset name       |

See `.env.example` files in each app for templates.

## Architecture

### Frontend

Next.js App Router project:

- `apps/frontend/src/app/` - Routes and layouts (file-based routing)
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

- Uses `ubuntu-latest`, Node 20, pnpm 10.
- Placeholder env vars (`ci-placeholder`) satisfy build-time validation without real credentials.
- Studio build uses `exec sanity build` instead of `pnpm build` to skip the `prebuild` hook (schema extraction + typegen require a live Sanity API connection).
- `--frozen-lockfile` ensures lockfile stays in sync with `package.json`.

### E2E Tests (`.github/workflows/e2e.yml`)

- Runs Playwright e2e tests against a production build of the frontend.
- Only triggers when `apps/frontend/` or the workflow file changes (path filter).
- Uses real Sanity credentials from GitHub Secrets (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`) — required for the app to render content.
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
- Custom `not-found.tsx` (branded 404 page) and `error.tsx` (error boundary with retry) at app root

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
- **ContactButton** - Client component that wraps a button + dynamically imported `ContactModal`. Used on the property detail page (server component) to open the contact form without making the entire page a client component.
- **ContactModal** - Client component with Web3Forms integration for the contact form. Dynamically imported (`next/dynamic`, `ssr: false`) wherever used.

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

## Caching Strategy

The frontend uses Next.js 16 cache components (`"use cache"` directive + `cacheLife()` + `cacheTag()`):

- **`cacheLife("hours")`** - For rarely-changing data: site settings, SEO, page headings, map address.
- **`cacheLife("minutes")`** - For content that updates more often: featured properties, individual property detail pages, home sections, filter option lists.
- Cached functions are standalone `async function` with `"use cache"` as the first line, calling `sanityFetch` inside.
- Every cached function includes a `cacheTag()` call matching the Sanity document `_type` it queries, enabling on-demand revalidation via webhook.

### Cache Tags

| Tag | Sanity `_type` | Cached functions |
|-----|----------------|-----------------|
| `"siteSettings"` | `siteSettings` | `getSiteSettings()`, `getCachedMapAddress()`, `getCachedSiteSeo()` |
| `"property"` | `property` | `getCachedProperty()`, `FeaturedProperties`, `getCachedRoomCounts()` |
| `"homePage"` | `homePage` | `getCachedHomeSections()`, `getCachedHomeContent()`, `getCachedHomeSeo()` |
| `"propiedadesPage"` | `propiedadesPage` | `getCachedPropiedadesHeading()`, `getCachedPropiedadesSeo()` |
| `"city"` | `city` | `getCachedCities()` |
| `"propertyTypeCategory"` | `propertyTypeCategory` | `getCachedPropertyTypes()` |

### On-Demand Revalidation

- A webhook route at `POST /api/revalidate` (`src/app/api/revalidate/route.ts`) receives Sanity webhook payloads, validates the HMAC signature via `parseBody` from `next-sanity/webhook`, and calls `revalidateTag(body._type, "max")`.
- The `"max"` second argument is required by Next.js 16 to invalidate cache entries across all cache life profiles.
- The webhook must be configured in the Sanity dashboard (see README for setup instructions).
- Without the webhook (e.g. local development), `cacheLife` TTLs still apply as a fallback.

## SEO

- Root layout defines `metadata.title.template` so child pages only set the page-specific title string.
- Property detail pages include `<script type="application/ld+json">` with Schema.org `RealEstateListing` data (name, price, address, images).
- Property detail pages generate OpenGraph metadata via `generateMetadata()`.
- Ensure only one `<h1>` per page. Section headings within page content should use `<h2>` or lower.
- **robots.txt** (`src/app/robots.ts`): Environment-aware. Blocks all bots in non-production (`VERCEL_ENV !== "production"`), allows indexing in production.
- **sitemap.xml** (`src/app/sitemap.ts`): Dynamically generated. Includes home, `/propiedades`, and all property detail pages fetched from Sanity.
- **llms.txt** (`src/app/llms.txt/route.ts`): Markdown file for AI agents/LLMs ([spec](https://llmstxt.org/)). Lists main pages and all properties to help LLMs understand site content.

## E2E Tests

Playwright e2e smoke tests live in `apps/frontend/e2e/`. Config is at `apps/frontend/playwright.config.ts`.

### Test Design Principles

- Tests assert **page structure** (element existence, selectors, navigation URLs) rather than CMS content text, making them resilient to Sanity content changes.
- Static UI labels hardcoded in source code (e.g., "Buscar", "Aplicar filtros", "404", "contactate con") are safe to assert.
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
| `button:has-text('contactate con')` | `ContactButton` | `property-detail.spec.ts` |
| `.modal.show`, `#contactName`, `#contactEmail`, `#contactPhone`, `#contactComments` | `ContactModal` | `property-detail.spec.ts` |
| `nav[aria-label="Breadcrumb"]` | `Breadcrumb` | `navigation.spec.ts`, `propiedades.spec.ts`, `property-detail.spec.ts` |
| `.navbar-brand` | `Header` | `navigation.spec.ts` |
| `footer.site-footer` | `Footer` | `navigation.spec.ts` |
| `script[type="application/ld+json"]` | Property detail page | `property-detail.spec.ts` |

### Configuration Notes

- The `e2e/` directory is excluded from `tsconfig.json` — Playwright handles its own TypeScript compilation.
- Playwright artifact directories (`test-results/`, `playwright-report/`, `blob-report/`, `playwright/.cache/`) are in `.gitignore`.
- Chromium only (single project). Retries: 2 in CI, 0 locally. Workers: 1 in CI.

## Recent Implementation Notes

- Listing skeleton: `apps/frontend/src/app/propiedades/loading.tsx` mirrors `PropertiesLayout` (filters sidebar + badges/count + grid).
- Property detail skeleton: `apps/frontend/src/app/propiedades/[slug]/loading.tsx` includes carousel-sized media + 450px map placeholder.
- Sanity property images can have `url`/`metadata` as `null`; normalize before passing to `ImageCarousel` and only cast to `SanityImageSource` when `url` is present.
- `ImageCarousel` accepts `asset?: SanityImageSource | null` and `lqip?: string | null`. Uses `.quality(80)` for consistent compression.
- Property detail `description` is Portable Text; use `PortableTextBlock[] | null` and import `@portabletext/types` (dependency added to frontend).
- `FilterOption` and `FilterOptions` types live in `src/types/filters.ts`. The `parseMultiple()` and `buildFilterOptions()` helpers live in `src/lib/filters.ts`. Both pages and multiple components import from these shared modules.
- `ContactButton` is the pattern for triggering the contact modal from server components — a thin client component that manages modal state and dynamically imports `ContactModal`.
- Only one image per page should have `priority` (the LCP candidate). Do not mark logos or secondary images as priority.
- The `html` element uses `lang="es"` (Spanish site targeting Argentine audience).
- Home page sections come from the `homePage` singleton (`apps/frontend/src/sanity/queries/homePage.ts`) and render via `TextImageSection` with Portable Text and images.
- `homePage.sections[]` includes optional `anchorId` for header anchors (e.g., `/#servicios`, `/#nosotros`).
- Header smooth-scrolls to anchors when already on `/` and updates the hash without full navigation.
- `TextImageSection` supports a carousel (multiple images) and uses `asset.url` directly when present (fallback to `urlFor`).
- Anchored sections use `scroll-margin-top: 60px` to offset the sticky header.
- Webhook revalidation route: `src/app/api/revalidate/route.ts`. Uses `parseBody` from `next-sanity/webhook` for HMAC validation and `revalidateTag(type, "max")` from `next/cache`.
- In Next.js 16, `revalidateTag()` requires two arguments: `(tag, profile)`. Pass `"max"` as the profile to revalidate all cache entries for a tag regardless of their original `cacheLife`.
- The `/propiedades` listing page calls `sanityFetch` directly without `"use cache"` (dynamic `searchParams`), so it has no cache tag and is unaffected by revalidation.

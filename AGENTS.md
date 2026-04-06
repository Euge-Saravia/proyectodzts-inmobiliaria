# AGENTS.md - DZTS Inmobiliaria

This file contains essential information for agentic coding agents working in this repository.

## Monorepo Structure

This is a **pnpm workspace monorepo** with two apps:

```text
apps/
  frontend/   # Next.js 16 website (public-facing)
  studio/     # Sanity Studio CMS (content management)
```

**Important**: This monorepo uses simple pnpm workspaces without Turborepo. Keep the setup simple.

## Build, Lint, and Test Commands

From repository root:

```bash
pnpm install          # Install all dependencies
pnpm dev              # Start both apps in parallel
pnpm build            # Production build for both apps
```

Frontend-specific (from `apps/frontend/`):

```bash
pnpm dev              # Start Next.js dev server with Turbopack
pnpm build            # Production build
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

Studio-specific (from `apps/studio/`):

```bash
pnpm dev              # Start Sanity Studio
pnpm build            # Build for deployment
pnpm deploy           # Deploy to Sanity hosting
pnpm typegen          # Generate TypeScript types from schema
```

**Note**: This project does not currently have a test suite configured. No test commands are available.

### CI

GitHub Actions (`.github/workflows/ci.yml`) runs on PRs to `dev` and `main`:

1. Lint frontend: `pnpm --filter frontend lint`
2. Build frontend: `pnpm --filter frontend build`
3. Build studio: `pnpm --filter dzts-studio exec sanity build`

Placeholder env vars are set at the job level so builds compile without real credentials. The studio build uses `exec sanity build` to skip the `prebuild` hook (which requires a live Sanity API).

## Project Stack

### Frontend (`apps/frontend/`)

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5 with strict mode
- **Styling**: Bootstrap 5.x + custom CSS
- **CMS Integration**: next-sanity for content fetching
- **Icons**: Bootstrap Icons
- **React**: 19 with React Compiler enabled

### Studio (`apps/studio/`)

- **Framework**: Sanity Studio v5
- **Language**: TypeScript 5
- **React**: 19

## Code Style Guidelines

### File Organization

```text
apps/
├── frontend/                    # Next.js website
│   └── src/
│       ├── app/                 # Next.js App Router pages
│       │   ├── error.tsx        # Global error boundary
│       │   └── not-found.tsx    # Custom 404 page
│       ├── components/          # React components
│       │   ├── ComponentName.tsx
│       │   └── ComponentName.css
│       ├── lib/                 # Shared utility functions
│       │   └── filters.ts      # parseMultiple(), buildFilterOptions()
│       ├── types/               # Shared TypeScript type definitions
│       │   └── filters.ts      # FilterOption, FilterOptions
│       ├── sanity/              # Sanity CMS configuration
│       │   ├── lib/             # Client helpers
│       │   └── env.ts
│       └── styles/              # Global styles and variables
└── studio/                      # Sanity Studio
    ├── schemaTypes/             # Content schema definitions
    └── sanity.config.ts         # Studio configuration
```

### Imports and Exports

- Use `type` keyword for type-only imports: `import type { Metadata } from "next"`
- Named imports from libraries: `import { createClient } from 'next-sanity'`
- Use path alias `@/*` for absolute imports: `import Component from "@/components/Component"`
- Default exports for components: `export default function ComponentName() {}`

### Component Patterns

- Add `'use client'` directive at the top for client-side components
- Define prop interfaces above the component function
- Use function declarations for components: `export default function ComponentName() {}`
- Arrow functions acceptable for simple presentational components
- Bootstrap classes for styling, inline styles for dynamic values

### TypeScript Conventions

- Always type function parameters and return types when clear
- Use interfaces for prop definitions: `interface Props { title: string }`
- Strict mode is enabled - no `any` types unless absolutely necessary
- Environment variables validated with `assertValue()` helper in `apps/frontend/src/sanity/env.ts`

### Styling Guidelines

- Use Bootstrap utility classes for layout and spacing
- Co-locate CSS with component: `ComponentName.css` in same directory
- Custom CSS variables defined in `src/styles/variables.css`
- Inline styles only for dynamic values: `style={{ color: primaryColor }}`
- Use Bootstrap's color variables: `var(--bs-primary)`, `var(--bs-dark)`

### Responsive Breakpoints

Use Bootstrap 5 breakpoints consistently. **Important:** CSS custom properties cannot be used in `@media` queries (CSS limitation), so use these hardcoded values:

| Breakpoint | Min-width (mobile-first) | Max-width (desktop-first) |
|------------|--------------------------|---------------------------|
| sm         | `min-width: 576px`       | `max-width: 575.98px`     |
| md         | `min-width: 768px`       | `max-width: 767.98px`     |
| lg         | `min-width: 992px`       | `max-width: 991.98px`     |
| xl         | `min-width: 1200px`      | `max-width: 1199.98px`    |
| xxl        | `min-width: 1400px`      | -                         |

- **Prefer mobile-first** (`min-width`) over desktop-first (`max-width`)
- Use `.98px` for max-width queries to avoid 1px overlap at exact breakpoints
- Reference: `src/styles/variables.css` contains the full breakpoint documentation

### Naming Conventions

- **Components**: PascalCase (`PropertyCard.tsx`)
- **Functions/Variables**: camelCase (`getPropertyData`)
- **CSS Files**: PascalCase matching component name (`SearchProperties.css`, co-located with `SearchProperties.tsx`)
- **CSS Classes**: kebab-case (Bootstrap convention)
- **Constants**: UPPER_SNAKE_CASE (`const API_VERSION`)

### Formatting and Style

- 2-space indentation
- Double quotes for strings (Prettier is pre-configured for this)
- Semicolons required at end of statements
- Trailing commas in multi-line arrays/objects
- Maximum line length: not strictly enforced but prefer readability
- No code comments unless explicitly required

### Error Handling

- Throw `Error` for invalid configuration/missing env vars
- Use TypeScript strict mode to catch type errors at compile time
- Environment variables must be validated before use (see `apps/frontend/src/sanity/env.ts`)
- App-level error boundary exists at `src/app/error.tsx` (client component with retry button)
- Custom 404 page exists at `src/app/not-found.tsx` with navigation links back to home/properties

### Image Handling

- Use Next.js `Image` component for all images
- Only one image per page should have `priority` (the LCP candidate). Do not mark logos or secondary images as priority.
- Use `fill` prop for full-width/background images with parent positioning
- Add remote domains to `next.config.ts` when using external images
- Use `.quality(80)` on Sanity image URLs (`urlFor(...).quality(80)`) for consistent compression

### Environment Variables

Frontend environment variables (in `apps/frontend/.env.local`):

- Client-accessible vars prefixed with `NEXT_PUBLIC_`
- Required: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`
- Optional: `NEXT_PUBLIC_SANITY_API_VERSION` (has default value)
- Server-only: `SANITY_REVALIDATE_SECRET` (HMAC secret for Sanity webhook revalidation, no `NEXT_PUBLIC_` prefix)

### Next.js Specifics

- Use App Router (no Pages Router)
- Use `layout.tsx` for root layout with metadata
- Client components must have `"use client"` directive
- Server components by default (no directive needed)
- Use Turbopack in development (enabled by default in Next.js 16)
- React Compiler and cache components are enabled in `next.config.ts` (`reactCompiler: true`, `cacheComponents: true`)

### Caching

- Use `"use cache"` directive + `cacheLife()` + `cacheTag()` from `next/cache` for server-side data caching.
- `cacheLife("hours")` for rarely-changing data (site settings, SEO, page headings).
- `cacheLife("minutes")` for content that updates more often (featured properties, property detail, home sections, filter lists).
- Pattern: standalone `async function` with `"use cache"` as first line, then `cacheLife(...)`, then `cacheTag(...)`, wrapping `sanityFetch` calls.
- Every cached function must include a `cacheTag("<sanity_type>")` call matching the Sanity document `_type` it queries (e.g., `cacheTag("property")`, `cacheTag("siteSettings")`).
- On-demand revalidation: `POST /api/revalidate` receives Sanity webhook payloads, validates the HMAC signature via `parseBody` from `next-sanity/webhook`, and calls `revalidateTag(body._type, "max")`.
- In Next.js 16, `revalidateTag()` requires a second argument (cache life profile). Use `"max"` to invalidate entries across all profiles.
- Without the webhook, `cacheLife` TTLs still apply as a fallback.

### SEO

- Root layout uses `metadata.title.template` (`"%s | DZTS Inmobiliaria"`). Child pages set only the page-specific title (e.g., `title: "Propiedades"`), not the full title with suffix.
- Property detail pages include JSON-LD structured data (`RealEstateListing`) and OpenGraph metadata via `generateMetadata()`.
- Ensure only one `<h1>` per page. Section headings use `<h2>` or lower.
- The `html` element uses `lang="es"` (Spanish site, Argentine audience).
- Format prices with `toLocaleString("es-AR")` and display currency as `AR$`/`US$`.

### Shared Code

- **Types**: Shared type definitions go in `src/types/`. Example: `FilterOption` and `FilterOptions` in `src/types/filters.ts`.
- **Utilities**: Shared helper functions go in `src/lib/`. Example: `parseMultiple()` and `buildFilterOptions()` in `src/lib/filters.ts`.
- Do not duplicate type definitions or utility functions across components. Import from the shared location.

### Client/Server Component Boundaries

- When a server component page needs client interactivity (e.g., opening a modal), extract a thin client component for just that interaction rather than converting the entire page.
- Example: `ContactButton` is a client component that wraps button + dynamically imported `ContactModal`, used inside the server-rendered property detail page.
- Use `next/dynamic` with `{ ssr: false }` for modals and other components that depend on browser APIs.

### Sanity CMS Integration

**Frontend** (`apps/frontend/`):

- Client configured in `src/sanity/lib/client.ts`
- Use `sanityFetch` for live content with `<SanityLive />` in layout
- Image URL builder available via `urlFor()` from `src/sanity/lib/image.ts`

**Studio** (`apps/studio/`):

- Runs as a separate app at `http://localhost:3333`
- Schema definitions in `schemaTypes/`
- Run `pnpm typegen` to regenerate TypeScript types after schema changes

### ESLint Rules (Frontend)

- Extends `@typescript-eslint/recommended`
- Next.js core web vitals rules enabled
- React rules with `react/no-inline-styles` disabled
- Linting ignores `.next/` and `node_modules/`
- Run `pnpm lint` from `apps/frontend/` to check code before committing

### Path Aliases (Frontend)

- `@/*` resolves to `./src/*` within `apps/frontend/`
- Configure new aliases in `apps/frontend/tsconfig.json` under `paths`

### Security Headers (Frontend)

- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- All configured in `apps/frontend/next.config.ts`

### When Working with This Codebase

1. **Monorepo awareness**: Run commands from appropriate directory (root for both apps, or specific app folder)
2. **Before adding dependencies**: Check if similar functionality exists in Bootstrap or React
3. **Before creating new components**: Check existing components for patterns to follow
4. **When styling**: Prefer Bootstrap classes over custom CSS
5. **When fetching data**: Use Sanity client, ensure proper typing
6. **When modifying types**: Update related components to ensure type safety
7. **Before committing**: Run `pnpm lint` from the frontend directory to verify code quality
8. **When adding images**: Use Next.js Image component with proper props
9. **When changing schema**: Update in `apps/studio/schemaTypes/`, then run `pnpm typegen` in studio

## Recent Implementation Notes

- Listing skeleton: `apps/frontend/src/app/propiedades/loading.tsx` mirrors `PropertiesLayout` (filters sidebar + badges/count + grid).
- Property detail skeleton: `apps/frontend/src/app/propiedades/[slug]/loading.tsx` includes carousel-sized media + 450px map placeholder.
- Sanity property images can have `url`/`metadata` as `null`; only cast to `SanityImageSource` when `url` is present before using `urlFor`.
- `ImageCarousel` accepts `asset?: SanityImageSource | null` and `lqip?: string | null`. Uses `.quality(80)` for compression.
- Property detail `description` is Portable Text; use `PortableTextBlock[] | null` and ensure `@portabletext/types` is installed in the frontend.
- `FilterOption` (`{ name: string; slug: string }`) and `FilterOptions` types are in `src/types/filters.ts`. `parseMultiple()` and `buildFilterOptions()` are in `src/lib/filters.ts`. Both are imported by multiple components and pages — do not redeclare locally.
- `ContactButton` is used on the property detail page to open the contact modal from within a server component.
- Property detail page includes JSON-LD structured data (`RealEstateListing` schema) for SEO.
- Property detail page data is cached via `getCachedProperty()` with `cacheLife("minutes")`.
- Home page sections are powered by the `homePage` singleton: query in `apps/frontend/src/sanity/queries/homePage.ts` and render via `TextImageSection` (Portable Text + images).
- `homePage.sections[]` includes optional `anchorId` (kebab-case) to support header anchors like `/#servicios` and `/#nosotros`.
- `Header` smooth-scrolls when clicking `/#...` links on the home page and updates the hash without a full navigation.
- `TextImageSection` handles single image vs carousel; prefer `asset.url` when present and fall back to `urlFor(...)` if needed.
- Anchored sections use `scroll-margin-top: 60px` to account for the sticky header.
- Canonical URLs are set through `resolveMetadata()` using `ContentDefaults.canonicalUrl`; `metadataBase` in `apps/frontend/src/app/layout.tsx` is only set when `NEXT_PUBLIC_SITE_URL` is defined (no fallback URL).
- For site URLs and SEO metadata, rely on environment variables or Sanity-managed content only; avoid hardcoded fallback domains.
- Avoid hardcoded content when possible; prefer environment variables or Sanity-managed content.
- Breadcrumb JSON-LD is generated inside `apps/frontend/src/components/Breadcrumb.tsx`; pass `href` for all breadcrumb items (including the current page) to populate the schema.
- Home page streams below-the-fold content with `<Suspense>` fallbacks; featured properties, home sections, and map load progressively.
- LCP image priority lives on the home hero background, not on the header logo.
- Reduced motion: smooth scroll falls back to `behavior: "auto"`, carousel auto-advance is disabled, and global CSS reduces animations when `prefers-reduced-motion` is set.
- Header nav background is driven by `--header-nav-bg` in `apps/frontend/src/styles/variables.css` (no inline style).
- Map iframe titles are passed via the `MapSection` `title` prop for contextual SEO.
- Sanity CDN preconnect is included in `apps/frontend/src/app/layout.tsx`.
- `global-error.tsx` exists as a root error boundary with its own `<html>` and `<body>`.
- Sitemap static entries omit `lastModified` to avoid `new Date()` on every build.
- Disabled pagination controls render as `<span>` instead of `<a>`.
- Footer certification images are set to `loading="lazy"`.
- Inter font no longer sets an unused CSS variable.
- Property detail pages export `generateStaticParams()` to pre-render available property slugs at build time.
- Webhook revalidation route: `src/app/api/revalidate/route.ts`. Uses `parseBody` from `next-sanity/webhook` for HMAC validation and `revalidateTag(type, "max")` from `next/cache`.
- In Next.js 16, `revalidateTag()` requires two arguments: `(tag, profile)`. Pass `"max"` as the profile to revalidate all cache entries for a tag regardless of their original `cacheLife`.
- The `/propiedades` listing page calls `sanityFetch` directly without `"use cache"` (dynamic `searchParams`), so it has no cache tag and is unaffected by revalidation.

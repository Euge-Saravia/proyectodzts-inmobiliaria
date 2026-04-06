# Frontend Audit - Remaining Improvements

Audit performed on 2026-02-04 against `apps/frontend/`.

## Completed (Critical)

- [x] ContactModal: focus trap, Escape key handling, auto-focus, error `role="alert"`
- [x] Skip navigation link in root layout
- [x] Canonical URLs via `resolveMetadata()` + `metadataBase`
- [x] LCP priority moved to hero background image
- [x] Hero logo `sizes` attribute added
- [x] Home page streaming with `<Suspense>` fallbacks
- [x] Organization + BreadcrumbList JSON-LD
- [x] Reduced motion behavior for scroll + carousel + CSS
- [x] Header nav background uses CSS variable
- [x] Carousel controls in Spanish
- [x] PropertyCard cleaned up (object-fit + decorative icon)
- [x] MapSection supports contextual iframe title
- [x] Sanity CDN preconnect added
- [x] Verified metadata/robots/sitemap setup
- [x] Global error boundary added

## High Priority

### 3. [SEO] Missing canonical URLs (Done)
**Files:** `src/lib/seo.ts`, `src/app/page.tsx`, `src/app/propiedades/page.tsx`, `src/app/propiedades/[slug]/page.tsx`

No pages define `<link rel="canonical">`. Property detail pages may be indexed at multiple URLs. Add `alternates.canonical` to `resolveMetadata()` and pass the canonical URL from each page's `generateMetadata()`. Ensure `metadataBase` is set in `src/app/layout.tsx` so canonicals resolve to absolute URLs, and strip query params for listing pages so canonicals don't vary by filters.

### 5. [Performance] Image priority conflict (Done)
**Files:** `src/components/Header.tsx:127`, `src/components/SearchProperties.tsx:46`

Header logo has `priority` but isn't the LCP candidate. The hero background image in SearchProperties should have `priority` instead. Remove `priority` from the logo, add it to the hero image.

### 6. [Performance] Hero logo missing `sizes` attribute (Done)
**File:** `src/components/SearchProperties.tsx:62-67`

`<Image fill>` without `sizes` causes the browser to download the largest image variant. Add appropriate `sizes` based on actual container width.

### 7. [Performance] Home page blocks rendering on 6 parallel fetches (Done)
**File:** `src/app/page.tsx:52-60`

All 6 data fetches must complete before anything renders. Wrap `FeaturedProperties`, `TextImageSection` blocks, and `MapSection` in `<Suspense>` boundaries with skeleton fallbacks for progressive streaming. Prioritize a fallback for the LCP section to avoid a blank initial render.

### 8. [SEO] Missing Organization and BreadcrumbList structured data (Done)
**Files:** `src/app/layout.tsx` or `src/app/page.tsx`, `src/components/Breadcrumb.tsx`

Only `RealEstateListing` JSON-LD exists on property detail pages. Add:
- Organization schema on home page (business name, logo, contact). Keep it on the home page only to avoid repetition.
- BreadcrumbList schema in the Breadcrumb component. Ensure labels match the visible breadcrumb text.

### 9. [Accessibility] `prefers-reduced-motion` not respected (Done)
**Files:** `src/styles/variables.css`, `src/components/Header.tsx`, `src/components/ScrollToTopButton.tsx`

Carousel auto-advances, smooth scrolling is used in Header and ScrollToTopButton, and these continue for users who prefer reduced motion. Add global CSS rule and conditionally use `behavior: "smooth"` in JS (fall back to `"auto"`).

## Medium Priority

### 10. [Performance] Hardcoded inline color in Header nav (Done)
**File:** `src/components/Header.tsx:116`

`style={{ backgroundColor: "#3d3d3d" }}` should use a CSS variable.

### 11. [Accessibility] Carousel labels are in English (Done)
**File:** `src/components/ImageCarousel.tsx:82,92`

"Previous" and "Next" should be "Anterior" and "Siguiente" since the site is `lang="es"`.

### 12. [Performance] Redundant object-fit in PropertyCard (Done)
**File:** `src/components/PropertyCard.tsx:50-51`

Both CSS class `object-fit-cover` and inline `style={{ objectFit: "cover" }}` are applied. Remove the inline style.

### 13. [Accessibility] Share icon not marked decorative (Done)
**File:** `src/components/PropertyCard.tsx:75`

`<i className="bi bi-share">` needs `aria-hidden="true"`.

### 14. [SEO] MapSection iframe title is always the same (Done)
**File:** `src/components/MapSection.tsx:19`

Title is always "Ubicación de la oficina" even on property detail pages. Accept a `title` prop for contextual titles.

### 15. [Accessibility] Error alert not announced to screen readers
**File:** `src/components/ContactModal.tsx:178-181`

~~Error message div needs `role="alert"`.~~ **Fixed** as part of critical ContactModal work.

### 16. [Performance] Missing preconnect for Sanity CDN (Done)
**File:** `src/app/layout.tsx`

Add `<link rel="preconnect" href="https://cdn.sanity.io" />` in the `<head>` to speed up image loading.

### 16a. [SEO] Verify metadata base + robots/sitemap basics (Done)
**Files:** `src/app/layout.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`

Confirm `metadataBase` is defined, `robots` allows indexing for public pages, and `sitemap` includes only canonical, indexable URLs.

### 17. [Next.js] Missing `global-error.tsx` (Done)
**File:** `src/app/global-error.tsx` (new)

If the root layout throws, there's no error boundary. Add `global-error.tsx` with its own `<html>` and `<body>` tags.

## Low Priority

### 18. [SEO] Sitemap static entries use `new Date()` (Done)
**File:** `src/app/sitemap.ts`

The static entries (home, /propiedades) use `new Date()` which changes on every build. Consider a fixed date or fetching from CMS.

### 19. [Accessibility] Pagination disabled links use `href="#"` (Done)
**File:** `src/components/Pagination.tsx:68`

Disabled pagination links with `href="#"` cause scroll-to-top on click. Use `<span>` instead of `<Link>` for disabled states.

### 20. [Performance] Bootstrap JS loaded on all pages
**File:** `src/components/BootstrapClient.tsx`

Bootstrap's JS bundle loads on every page but is only needed for carousel and navbar collapse. Consider lazy loading.

### 21. [Accessibility] Footer certification images load eagerly (Done)
**File:** `src/components/Footer.tsx`

Below-the-fold footer images could benefit from `loading="lazy"` on the `<Image>` components.

### 22. [Next.js] Unused font CSS variable (Done)
**File:** `src/app/layout.tsx:14-18`

Inter is configured with `variable: "--font-inter"` but only `inter.className` is used. The CSS variable is never referenced. Either use it in CSS or remove the `variable` config.

## Future

### [SEO] Add `generateStaticParams` for property detail pages
**File:** `src/app/propiedades/[slug]/page.tsx`

When ready to pre-render property pages at build time, add `generateStaticParams()` to fetch all property slugs from Sanity.

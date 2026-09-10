# Responsive Sanity Images

- **Date**: 2026-09-03
- **PR**: TBD
- **Status**: Implemented
- **Owner**: implementer agent (Sonnet tier)

## Goal

An SEO/Lighthouse audit found the home hero image served at its full `w=1920` AVIF (445 KB) to every device, phones included, because `next.config.ts` set `images.unoptimized: true`. That flag makes `next/image` emit a plain `<img src>` with no `srcset`, so the `sizes` attributes already present on `SearchProperties`, `PropertyCard`, `TextImageSection`, `SectionCarousel`, and `ImageCarousel` had no effect. Mobile Lighthouse LCP was 7.5s on home, 5.6s on `/propiedades`, 6.3s on property detail, with roughly 272 KB wasted on the hero image alone.

## Decisions

### Custom loader instead of dropping `unoptimized`

The frontend is a static export (`output: "export"`) with no Node server, so the default Next.js Image Optimization API (which resizes on request) isn't available — Next itself throws `Image Optimization using the default loader is not compatible with export` if `unoptimized` is off and no custom loader is configured. Sanity's own image CDN (`cdn.sanity.io`) already resizes on the fly via query params (`w`, `h`, `q`, `auto=format`, `rect`, `fit`), so a custom loader (`images.loader = "custom"`, `images.loaderFile`) can generate a real `srcset` with zero extra infrastructure. Next only disallows this combination for the *default* loader — `loader: "custom"` is explicitly compatible with `output: "export"`.

### Loader stays a pure, dependency-free function

`src/lib/imageLoader.ts` takes `{ src, width, quality }` and returns a string. It does not import the Sanity client — it runs in the browser bundle on every `<Image>` render, so it only does URL/query-string manipulation:

- Non-Sanity `src` (local `/Images/...`, `placehold.co` placeholders) pass through unchanged.
- `w` is set to the requested `width`, capped at the image's original `w` if the source URL already had one — the loader never asks the CDN to upscale past the asset's configured size.
- If the source URL has both `w` and `h` (the fixed-aspect crops used by `PropertyCard` and `ImageCarousel`, e.g. `.width(800).height(600)`), `h` is scaled proportionally to the new `w` so the crop's aspect ratio is preserved at every breakpoint.
- `q` is only set from the `quality` prop when the URL doesn't already carry one (Sanity URLs built with `.quality()` keep their explicit value).
- `auto=format` is added once if missing; every other existing param (`rect`, `fit`, etc.) is preserved as-is.

### Hero quality 80 → 75

With a real `srcset` now serving appropriately-sized images instead of one oversized one, the marginal byte savings from a small quality drop on the largest breakpoint compounds. `.quality(75)` is still visually lossless at typical viewing sizes; it was the one hero-specific tweak the audit asked for.

## Implementation

- `apps/frontend/next.config.ts` — `images.unoptimized: true` replaced with `images.loader: "custom"` + `images.loaderFile: "./src/lib/imageLoader.ts"`. `remotePatterns` unchanged.
- `apps/frontend/src/lib/imageLoader.ts` — the loader described above.
- `apps/frontend/src/lib/imageLoader.test.ts` — unit tests: local/non-Sanity passthrough, `w` replacement, proportional `h` scaling, width capping, `q`/`auto` added only when absent, `rect`/`fit` preserved.
- `apps/frontend/src/app/(site)/page.tsx` — hero image quality 80 → 75.
- Audited every `next/image` usage (`PropertyCard`, `TextImageSection`, `SectionCarousel`, `ImageCarousel`, `SearchProperties`, `Header`, `Footer`): all `fill` images already carried a `sizes` matching their layout, and all fixed-size ones already had explicit `width`/`height`; only one image per page carries `priority` (home hero, first properties-grid card, first carousel slide). No structural changes were needed there beyond the quality tweak above.
- CLAUDE.md — "Static Export" section's `images.unoptimized` bullet rewritten to describe the custom loader.

## Operational notes

- Baseline (pre-fix) mobile Lighthouse numbers from the audit: LCP 7.5s (home), 5.6s (`/propiedades`), 6.3s (property detail); ~272 KB wasted transfer on the hero image alone. Re-run Lighthouse post-deploy to confirm the improvement — this spec doesn't include a re-measurement because it requires a production deploy with real Sanity content.
- `pnpm build` needs live Sanity credentials to fetch content at build time (static export). No `.env.local` was available in this environment to run a full build against real data; the loader's behavior is instead covered by unit tests, `tsc --noEmit`, and lint. Confirm the `srcset` in production `out/index.html` on the next real build (look for multiple `cdn.sanity.io` candidates with distinct `w` values on the hero `<img>`, and `imagesrcset`/`imagesizes` on its `<link rel="preload" as="image">`).
- `ImageLightbox.tsx` renders its fullscreen view with a raw `<img>` (not `next/image`), so it's unaffected by this change — out of scope here.

# React Doctor — false positives

Diagnostics intentionally suppressed for this project. Drop any matching the patterns below before triage.

---

## `react-hooks-js/todo`

React Compiler "unsupported syntax" advisory. The compiler bails on the file silently; the rule surfaces the bailout as a diagnostic regardless of whether the file carries an explicit `'use no memo'` directive.

Suppress when the file is one of the following, where the unsupported pattern is intentional and the refactor alternatives are worse than skipping memoization:

- `src/components/BootstrapClient.tsx` — dynamic `import()` inside `useEffect`, used to lazy-load Bootstrap's JS bundle after hydration. Component renders `null`; nothing to memoize.
- `src/components/ReferenceSearch.tsx` — `try/finally` in `handleSubmit` to clean up the `pending` state regardless of fetch outcome. Render is small; skipping memoization has no measurable cost.

Both files carry a `'use no memo'` directive making the compiler opt-out explicit.

---

## `react-doctor/no-danger`

`dangerouslySetInnerHTML` used to inject **JSON-LD structured data** for SEO.

Suppress when the surrounding element is a `<script type="application/ld+json">` and the payload comes from a `JSON.stringify(...)` of a Schema.org object built in the same file. There is no user-supplied content in those payloads.

Known sites:

- `src/components/Breadcrumb.tsx` — `BreadcrumbList` JSON-LD.
- `src/app/(site)/propiedades/[slug]/page.tsx` — `RealEstateListing` JSON-LD.
- `src/app/(site)/page.tsx` — home-page Schema.org JSON-LD.

---

## `react-doctor/nextjs-no-img-element`

Plain `<img>` used where `next/image` is not viable.

Suppress when:

1. The file is under `src/app/(print)/` — the ficha page renders for printing on a static export, where `next/image`'s lazy/responsive behavior is undesirable.
2. The `<img>` is rendered inside `react-zoom-pan-pinch`'s `<TransformComponent>` — the library requires a real `<img>` child for its pan/zoom math.

Known sites:

- `src/app/(print)/propiedades/[slug]/ficha/page.tsx` — print layout.
- `src/components/ImageLightbox.tsx` — inside `TransformComponent`.

---

## `react-doctor/iframe-missing-sandbox`

Google Maps embed iframe. Applying `sandbox` strips the scripts and event handlers Maps needs to load tiles and handle interaction, which breaks the embed.

Known site:

- `src/components/MapSection.tsx`.

---

## `react-doctor/nextjs-no-use-search-params-without-suspense`

The rule is a file-level heuristic that misses Suspense boundaries in ancestor files. `PropertiesLayout.tsx` (`src/components/PropertiesLayout.tsx`) wraps its children in `<Suspense>` at the layout level, so any descendant calling `useSearchParams()` is already inside a Suspense boundary.

Suppress when the file is `src/components/PropertiesFilters.tsx` or `src/components/ActiveFilterBadges.tsx`. Both render only as descendants of `PropertiesLayout`.

---

## `react-doctor/no-array-index-as-key` / `react-doctor/no-array-index-key`

Suppress when the keyed list is **append-only or static** in this codebase — never reordered, filtered, or insert-in-middle:

- Breadcrumb trail items (built from page-level props, fixed at render time).
- Carousel slides from Sanity image arrays (the array order is the display order; no client-side mutation).

Known sites:

- `src/components/Breadcrumb.tsx` — breadcrumb items.
- `src/components/ImageCarousel.tsx` — carousel indicators and slides.
- `src/components/SectionCarousel.tsx` — same pattern.

(The Sanity `_key` field isn't projected by the current GROQ queries; adding it is a separate Studio typegen task.)

---

## `deslop/unused-export`

Sanity GROQ queries declared with `defineQuery(...)` and `export const NAME = ...`. The `export` keyword is required for `next-sanity` typegen to register the query string → result type mapping in `src/sanity/types.ts`. Removing `export` breaks type inference at the call site even though the JS value is consumed only inside the same file.

Known sites:

- `src/sanity/queries/properties.ts` — `CITIES_QUERY`, `PROPERTY_TYPES_QUERY`, `ROOM_COUNTS_QUERY`.
- `src/sanity/queries/propertyDetail.ts` — `PROPERTY_QUERY`, `PROPERTY_SLUGS_QUERY`.
- `src/sanity/queries/homePage.ts` — `HOME_SECTIONS_QUERY`.

Suppress for any `export const … = defineQuery(...)` declaration in `src/sanity/queries/**`.

---

## `react-doctor/react-compiler-destructure-method`

Stylistic preference: destructure `useSearchParams()` / `useRouter()` before calling methods. The codebase uses the non-destructured form (`searchParams.get(...)`, `router.push(...)`) consistently for readability — converting every call site is high-churn cosmetic change with no correctness or perf impact under the React Compiler.

Suppress at file level for `useSearchParams()` / `useRouter()` access patterns across the app.

---

## `react-doctor/control-has-associated-label`

Suppress when an `<input>` carries `id="X"` and there is a sibling `<label htmlFor="X">` (whether immediately adjacent or earlier in the same JSX subtree) supplying the visible label. The rule only matches label-wrapping or inline `aria-label`/`aria-labelledby` and can't follow sibling associations statically, but the explicit `id`/`htmlFor` pairing is fully valid for WAI-ARIA and assistive tech.

This codebase uses the explicit pattern intentionally because Bootstrap 5's `.form-check` / `.form-control` styles target adjacent-sibling selectors — wrapping the input inside the label breaks the checkbox/radio glyph positioning and the field spacing without any a11y benefit.

Known sites (all `<input id> + sibling <label htmlFor>`):

- `src/components/PropertiesFilters.tsx` — `solo-disponibles`, `operacion-*`, `propiedad-*`, `localidad-*`, `dormitorios-*`, `superficie-min`, `superficie-max`.
- `src/components/ReferenceSearch.tsx` — `reference-search`.

---

## `react-doctor/no-pure-black-background`

Intentional design choice — fullscreen image lightbox uses pure black to maximize image contrast, mirroring the system gallery viewer pattern. The `bg-black` Bootstrap class is the right primitive here.

Known site:

- `src/components/ImageLightbox.tsx` — `.modal-content.bg-black`.

---

## `react-doctor/no-z-index-9999`

`z-index: 1055` and `1056` are the **Bootstrap 5 modal backdrop + dialog** stacking values. They're not arbitrary; they match the framework's documented scale so the lightbox stacks correctly above other components.

Known site:

- `src/components/ImageLightbox.tsx` — modal backdrop (1055) and modal (1056).

---

## `react-doctor/no-tiny-text`

`font-size: 0.6rem` (≈9.6px) is the inline-style on a Bootstrap `btn-close` icon used to dismiss a filter chip — there's no readable text inside, just the close glyph. The visual size matches the chip's overall height.

Known site:

- `src/components/ActiveFilterBadges.tsx:162` — close-button icon inside filter chip.

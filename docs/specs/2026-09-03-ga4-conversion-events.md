# GA4 Conversion Events

- **Date**: 2026-09-03
- **PR**: [#149](https://github.com/pablocolaiacovo/dzts-website/pull/149)
- **Status**: Implemented
- **Owner**: implementer agent

## Goal

GA4 is loaded on the site (`@next/third-parties/google`) but only tracks pageviews. There was no way to measure the actions that actually turn a visit into a lead: opening WhatsApp, sharing a listing, or opening/printing a property's printable ficha. Add lightweight, safe event tracking for those actions without touching page structure or breaking the site's static-export / no-JS-fallback behavior.

## Decisions

### A single `trackEvent()` wrapper, not raw `sendGAEvent()` calls scattered around

`src/lib/analytics.ts` centralizes the guard logic (missing measurement id, server-side rendering, GA script not yet loaded) so every call site is a one-line `trackEvent(name, params)`. `sendGAEvent()` itself reaches into `window[dataLayerName]` directly and will throw or `console.warn` if GA hasn't initialized — none of that belongs inlined at each call site.

### Guard on `window.gtag`, not on `window.dataLayer`

`@next/third-parties/google`'s injected inline script defines a global `gtag` function before pushing the `config` call, so `window.gtag` existing is a reliable signal that the GA bootstrap script has actually run in the browser (as opposed to only checking `NEXT_PUBLIC_GA_MEASUREMENT_ID`, which is fine at build time but doesn't tell us the client-side script executed). `trackEvent()` never throws and strips `undefined` params before calling `sendGAEvent()`.

### `TrackedLink`, not making every consumer a separate client component

The WhatsApp float button was a Server Component; the property detail page needed the same click-tracking behavior on three different `<a>` links (Ficha, WhatsApp share, WhatsApp consult). Rather than converting each into a bespoke client component, `src/components/TrackedLink.tsx` is one small `"use client"` component that renders a real `<a>` (all anchor props pass through untouched) and fires `trackEvent()` in `onClick` without `preventDefault()` — navigation still works with JS disabled or if analytics fails.

### Event names and params

Four events cover the lead funnel:

- `whatsapp_contact` — `location: "float" | "property_detail"`, `property_slug`, `property_title` (property page only)
- `share` — `method: "native" | "clipboard" | "whatsapp"`, `location: "property_detail" | "ficha"`, `property_slug`
- `ficha_open` — clicking the "Ficha" link; `property_slug`
- `ficha_print` — clicking "Imprimir Ficha"; `property_slug`

`ShareButton` and `FichaActions` both take an optional `propertySlug` prop and report `method: "native"` when `navigator.share` is used, `"clipboard"` otherwise — same logic, so results are directly comparable between the property detail page and the ficha page.

## Implementation

- **`src/lib/analytics.ts`** — `trackEvent(name, params?)` and the `ANALYTICS_EVENT` constant map. No-ops (never throws) when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is unset, on the server, or when `window.gtag` isn't a function.
- **`src/lib/analytics.test.ts`** — vitest coverage for all four no-op paths, the stripped-params happy path, and that a throwing `sendGAEvent` still doesn't propagate. Mocks `@next/third-parties/google` and uses `vi.stubGlobal`/`vi.stubEnv` (the project's vitest environment is `node`, no jsdom).
- **`src/components/TrackedLink.tsx`** — new client component; used by `WhatsAppButton` (now converted to use it, `location: "float"`) and by the property detail page's `PropertyActions` (Ficha, WhatsApp share, WhatsApp consult links).
- **`src/components/ShareButton.tsx`** / **`src/components/FichaActions.tsx`** — accept an optional `propertySlug` prop, fire `share` on both the native-share and clipboard-copy paths.
- **`src/app/(site)/propiedades/[slug]/page.tsx`** — `PropertyActions` now takes `title` in addition to `slug` so `whatsapp_contact` can carry `property_title`; page stays a Server Component.
- **`src/app/(print)/propiedades/[slug]/ficha/page.tsx`** — passes `propertySlug` to `FichaActions`.
- No visible markup, class names, labels, or ARIA attributes changed — the e2e selectors for `button:has-text('Compartir')`, `a:has-text('Ficha')`, and the WhatsApp float's `aria-label` still match.

### Sitemap trailing slashes (same PR)

`next.config.ts` sets `trailingSlash: true` and canonical tags already resolve with a trailing slash (`resolveMetadata()` passes root-relative `canonicalUrl`s like `/propiedades`, which Next appends a slash to when generating `alternates.canonical`), but `sitemap.ts` and `generate-llms-txt.mjs` were still emitting bare URLs. Both now emit the same trailing-slash form as the canonical tags (`${baseUrl}/`, `${baseUrl}/propiedades/`, `${baseUrl}/propiedades/${slug}/`), with `baseUrl` normalized (trailing slash stripped) first so a `NEXT_PUBLIC_SITE_URL` that already ends in `/` doesn't produce a double slash.

## Operational notes

- **Marking `whatsapp_contact` as a Key Event in GA4**: GA4 Admin → Events → find `whatsapp_contact` in the events list (it appears after the event fires at least once in a non-debug session) → toggle "Mark as key event". This is a GA4 console action, not something committed to the repo. Do the same for `ficha_open` or `share` later if they turn out to matter as intermediate funnel signals — start with `whatsapp_contact` since it's the closest proxy to an actual lead.
- Events won't appear in GA4 (or DebugView) locally unless `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in `.env.local` and the dev/preview build is actually pointed at a real GA4 property.
- `trackEvent()` intentionally has no batching/queueing — GA's own script tag and `dataLayer` handle that. If a click fires before the GA script has loaded, `window.gtag` won't exist yet and the event is silently dropped rather than queued; this only affects extremely fast clicks right after page load and was judged an acceptable tradeoff over adding a retry/queue mechanism.
- The sitemap/llms.txt trailing-slash fix is unrelated in code but shipped in the same PR since both were small SEO-adjacent fixes queued for this branch.

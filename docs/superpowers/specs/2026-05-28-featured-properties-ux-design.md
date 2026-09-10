# Featured Properties UX — Design

**Date:** 2026-05-28
**Scope:** Sanity Studio editing UX for the home page "Propiedades Destacadas" field, plus one frontend filter change.

## Problem

1. When picking featured properties in the Studio, the reference selector shows only the title — no image — making it hard to recognize properties.
2. The selector lists all properties, including ones already added, so it's easy to add duplicates or lose track.
3. The frontend hides sold/rented properties from the featured section, overriding the content author's explicit choice.

## Goals

- Show a thumbnail (the property's first image) in the featured selector and in the already-chosen array items.
- Hide already-added properties from the selector's available list.
- Respect the author's selection: featured sold/rented properties should display (with their status ribbon).

## Non-goals

- No custom React input component (native schema config only).
- No data migration. No frontend rendering changes beyond the filter.
- The selector still does **not** filter by status or publish state (author's choice) — only already-added are hidden.

## Design

### 1. Property preview — `apps/studio/schemaTypes/propertyType.ts`

`property` has no `preview` today, so Studio falls back to the title with no image. Add:

```ts
preview: {
  select: { title: "title", subtitle: "subtitle", media: "images.0" },
},
```

The referenced type's preview drives how each option renders, so the thumbnail appears both in the reference selection dialog and in the chosen array items. No custom `prepare` needed (fields map directly). Properties without an image fall back to Sanity's default icon. Side benefit: the general Properties list in the Studio also gains thumbnails.

### 2. Exclude already-added — `apps/studio/schemaTypes/homePageType.ts`

Add `options.filter` to the `featuredProperties` reference member:

```ts
of: [
  defineArrayMember({
    type: "reference",
    to: [{ type: "property" }],
    options: {
      filter: ({ document }) => {
        const added = (document?.featuredProperties ?? [])
          .map((item) => item?._ref)
          .filter(Boolean);
        return { filter: "!(_id in $added)", params: { added } };
      },
    },
  }),
],
```

Excludes only already-added refs. No status/publish filtering. Known minor behavior: re-opening an already-set reference excludes it from its own dropdown (standard Sanity filter behavior); acceptable since items are added, not re-edited.

### 3. Frontend filter — `apps/frontend/src/components/FeaturedProperties.tsx`

Current filter drops sold/rented/unpublished:

```js
property.published !== false &&
property.status !== "vendido" &&
property.status !== "alquilado",
```

Change to keep only the publish guard:

```js
property.published !== false
```

Rationale: sold/rented featured properties should show (the card already renders the status ribbon via `status={property.status}`). The `published !== false` guard stays because unpublished properties have **no detail page** (`generateStaticParams` / slugs query filter `published != false`), so featuring one would link to a hard 404. Update the inline comment accordingly.

## Verification

- `pnpm --filter dzts-studio typegen` after schema edits. These fields keep their shapes (`string` / `reference` / `image`), so `apps/frontend/src/sanity/types.ts` is expected to be unchanged; commit it only if it changes.
- Studio: confirm thumbnails appear in the featured selector and that already-added properties drop out of the list.
- Frontend: build + e2e green. Manually confirm a sold featured property renders with its ribbon and links to a valid detail page.

## Schema-change flow

Per CLAUDE.md: `typegen` → `deploy` (Studio) → commit regenerated `types.ts`. Since shapes don't change, `types.ts` likely won't move, but run typegen to confirm.

# Property Listing Sorting — Design

**Date:** 2026-05-28
**Branch:** `feat/properties-sorting`
**Status:** Approved design

## Goal

Add a sort control to the `/propiedades` listing so visitors can order results by
price (ascending / descending) and size (ascending / descending). The current
listing has no sort affordance; it shows properties in `publishedAt desc` order.

## Sort options

A dropdown above the results grid (aligned with the "X propiedades encontradas"
count) offers:

| Label (es)            | `orden` param  | Behavior |
|-----------------------|----------------|----------|
| Más recientes (default) | _(none)_     | Current order (`publishedAt desc`); no URL param |
| Precio: menor a mayor | `precio-asc`   | Price ascending, grouped by currency |
| Precio: mayor a menor | `precio-desc`  | Price descending, grouped by currency |
| Tamaño: menor a mayor | `tamano-asc`   | Effective surface ascending |
| Tamaño: mayor a menor | `tamano-desc`  | Effective surface descending |

## Sort semantics

### Price (grouped by currency, US$ group always first)

Prices mix currencies (`US$` / `AR$`), so a raw numeric sort would be
meaningless. Instead:

- **`precio-asc`**: US$ group sorted ascending, then AR$ group sorted ascending.
- **`precio-desc`**: US$ group sorted descending, then AR$ group sorted descending.
- The US$ group always appears **before** the AR$ group, regardless of direction
  (the group order is fixed; only the within-group order flips).
- Properties with no `currency` come after both currency groups.
- Properties with no `price` go to the **end** (after everything), in both directions.

### Size

- Uses `getEffectiveSurface(p)` (`sizeTotal ?? size`), already defined in
  `lib/filters.ts`.
- Simple ascending / descending, no grouping.
- Properties with no effective surface go to the **end**, in both directions.

### Null handling (general rule)

Missing sort keys always sink to the end of the list regardless of direction, so
incomplete listings never push to the top.

## URL & behavior

- New query param `orden` with values `precio-asc | precio-desc | tamano-asc |
  tamano-desc`. Absent param = "Más recientes".
- Changing the sort **resets pagination to page 1** (drops the `pagina` param).
- The `orden` param is **preserved across pagination** (added to the
  `currentSearchParams` object already threaded into `Pagination`).
- Sorting is applied **after filtering, before pagination**, in the existing
  `useMemo` in `PropertiesListing`.

## Components & data flow

- **`types/filters.ts`** — add a `SortOption` type (union of the param values)
  plus a default sentinel.
- **`lib/filters.ts`** — add `sortProperties(list, orden)` implementing the
  grouping + null-sinking logic. Pure function, unit-testable in isolation.
- **`components/PropertiesSort.tsx`** — new client component: a `<select>` with
  `id="orden"` (for e2e selection). Reads/writes the `orden` param using the same
  `startTransition` + router pattern the filters use. Self-contained.
- **`components/PropertiesLayout.tsx`** — render `<PropertiesSort />` next to the
  results count, so `PropertiesListing` stays focused on data.
- **`components/PropertiesListing.tsx`** — read `orden` from `useSearchParams`,
  apply `sortProperties` inside the existing filtered `useMemo`, and include
  `orden` in `currentSearchParams`.

### Rejected alternative

Inlining the sort logic directly in `PropertiesListing` without a helper. Rejected
because the currency grouping + null-sinking has enough nuance to warrant an
isolated, testable function.

## Testing

- Unit-level coverage of `sortProperties` for: price asc/desc grouping (US$ before
  AR$), size asc/desc, null price/size sinking to the end, and missing currency
  ordering.
- e2e (Playwright): the sort `<select id="orden">` exists on `/propiedades`,
  changing it updates results and resets to page 1, and the param persists across
  pagination.

## Out of scope

- Currency conversion / FX rates (explicitly rejected during design).
- Sorting by rooms, date pickers, or any other key beyond price and size.
- Persisting sort preference beyond the URL.

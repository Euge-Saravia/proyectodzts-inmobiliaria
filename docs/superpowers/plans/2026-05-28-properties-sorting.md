# Property Listing Sorting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sort control to `/propiedades` letting visitors order results by price (asc/desc) and size (asc/desc), with price grouped by currency (US$ first).

**Architecture:** Client-side sorting on the already-client-side listing. A pure `sortProperties` helper in `lib/filters.ts` (unit-tested with Vitest) is applied after filtering, before pagination, inside the existing `useMemo` in `PropertiesListing`. A self-contained `PropertiesSort` dropdown reads/writes an `orden` URL param and is rendered in `PropertiesLayout` beside the results count.

**Tech Stack:** Next.js 16 (App Router, static export), React 19, TypeScript, Bootstrap 5, Vitest (new dev dependency), Playwright (e2e).

---

## File Structure

- `apps/frontend/vitest.config.ts` — **create** — Vitest config (node env, `@` alias, `src/**/*.test.ts`).
- `apps/frontend/package.json` — **modify** — add `vitest` devDep + `test` script.
- `apps/frontend/tsconfig.json` — **modify** — exclude `**/*.test.ts` from the Next build.
- `apps/frontend/src/types/filters.ts` — **modify** — add `SortOption` type.
- `apps/frontend/src/lib/filters.ts` — **modify** — add `parseSortParam` + `sortProperties`.
- `apps/frontend/src/lib/filters.test.ts` — **create** — Vitest unit tests for the above.
- `apps/frontend/src/components/PropertiesSort.tsx` — **create** — the dropdown control.
- `apps/frontend/src/components/PropertiesLayout.tsx` — **modify** — render `<PropertiesSort />` by the count.
- `apps/frontend/src/components/PropertiesListing.tsx` — **modify** — apply sort + thread `orden` param.
- `apps/frontend/src/components/PropertiesFilters.tsx` — **modify** — preserve `orden` when applying/clearing filters.
- `apps/frontend/e2e/sorting.spec.ts` — **create** — e2e coverage.

All commands run from `apps/frontend/` unless noted.

---

## Task 1: Vitest setup

**Files:**
- Create: `apps/frontend/vitest.config.ts`
- Modify: `apps/frontend/package.json`
- Modify: `apps/frontend/tsconfig.json`

- [ ] **Step 1: Add Vitest dev dependency**

Run (from `apps/frontend/`): `pnpm add -D vitest`
Expected: `vitest` appears under `devDependencies` in `apps/frontend/package.json`.

- [ ] **Step 2: Add the `test` script**

In `apps/frontend/package.json`, add to `"scripts"` (after the `"lint"` line):

```json
    "test": "vitest run",
    "test:watch": "vitest",
```

- [ ] **Step 3: Create the Vitest config**

Create `apps/frontend/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 4: Exclude test files from the Next build**

In `apps/frontend/tsconfig.json`, add `"**/*.test.ts"` to the `"exclude"` array (it currently lists `"e2e"`). Result:

```json
  "exclude": ["node_modules", "e2e", "**/*.test.ts"]
```

(Match the existing array contents; just append `"**/*.test.ts"`.)

- [ ] **Step 5: Add a throwaway smoke test to confirm the runner works**

Create `apps/frontend/src/lib/sanity-check.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("vitest", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run the smoke test**

Run: `pnpm test`
Expected: PASS (1 test passed).

- [ ] **Step 7: Delete the smoke test**

Run: `rm src/lib/sanity-check.test.ts`

- [ ] **Step 8: Commit**

```bash
git add apps/frontend/package.json apps/frontend/vitest.config.ts apps/frontend/tsconfig.json pnpm-lock.yaml
git commit -m "chore(frontend): add vitest for unit tests"
```

---

## Task 2: `SortOption` type, `parseSortParam`, and `sortProperties` (TDD)

**Files:**
- Modify: `apps/frontend/src/types/filters.ts`
- Test: `apps/frontend/src/lib/filters.test.ts` (create)
- Modify: `apps/frontend/src/lib/filters.ts`

- [ ] **Step 1: Add the `SortOption` type**

Append to `apps/frontend/src/types/filters.ts`:

```ts
export type SortOption =
  | "precio-asc"
  | "precio-desc"
  | "tamano-asc"
  | "tamano-desc";
```

- [ ] **Step 2: Write the failing tests**

Create `apps/frontend/src/lib/filters.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { parseSortParam, sortProperties } from "./filters";

type P = {
  id: string;
  price?: number | null;
  currency?: string | null;
  sizeTotal?: number | null;
  size?: number | null;
};

const ids = (list: P[]) => list.map((p) => p.id);

describe("parseSortParam", () => {
  it("returns valid options", () => {
    expect(parseSortParam("precio-asc")).toBe("precio-asc");
    expect(parseSortParam("tamano-desc")).toBe("tamano-desc");
  });

  it("returns null for unknown or empty values", () => {
    expect(parseSortParam("")).toBeNull();
    expect(parseSortParam(null)).toBeNull();
    expect(parseSortParam("nope")).toBeNull();
  });
});

describe("sortProperties", () => {
  it("returns the list unchanged when sort is null", () => {
    const list: P[] = [{ id: "a" }, { id: "b" }];
    expect(sortProperties(list, null)).toEqual(list);
  });

  it("does not mutate the input list", () => {
    const list: P[] = [
      { id: "a", price: 2, currency: "USD" },
      { id: "b", price: 1, currency: "USD" },
    ];
    sortProperties(list, "precio-asc");
    expect(ids(list)).toEqual(["a", "b"]);
  });

  it("sorts price ascending within a single currency", () => {
    const list: P[] = [
      { id: "a", price: 300, currency: "USD" },
      { id: "b", price: 100, currency: "USD" },
      { id: "c", price: 200, currency: "USD" },
    ];
    expect(ids(sortProperties(list, "precio-asc"))).toEqual(["b", "c", "a"]);
  });

  it("sorts price descending within a single currency", () => {
    const list: P[] = [
      { id: "a", price: 300, currency: "USD" },
      { id: "b", price: 100, currency: "USD" },
      { id: "c", price: 200, currency: "USD" },
    ];
    expect(ids(sortProperties(list, "precio-desc"))).toEqual(["a", "c", "b"]);
  });

  it("keeps US$ group before AR$ group in both directions", () => {
    const list: P[] = [
      { id: "ars1", price: 100, currency: "ARS" },
      { id: "usd1", price: 500, currency: "USD" },
      { id: "ars2", price: 200, currency: "ARS" },
      { id: "usd2", price: 50, currency: "USD" },
    ];
    expect(ids(sortProperties(list, "precio-asc"))).toEqual([
      "usd2",
      "usd1",
      "ars1",
      "ars2",
    ]);
    expect(ids(sortProperties(list, "precio-desc"))).toEqual([
      "usd1",
      "usd2",
      "ars2",
      "ars1",
    ]);
  });

  it("places properties with no currency after both currency groups", () => {
    const list: P[] = [
      { id: "none", price: 100 },
      { id: "usd", price: 100, currency: "USD" },
      { id: "ars", price: 100, currency: "ARS" },
    ];
    expect(ids(sortProperties(list, "precio-asc"))).toEqual([
      "usd",
      "ars",
      "none",
    ]);
  });

  it("sinks properties with no price to the end in both directions", () => {
    const list: P[] = [
      { id: "noprice", currency: "USD" },
      { id: "usd", price: 100, currency: "USD" },
    ];
    expect(ids(sortProperties(list, "precio-asc"))).toEqual(["usd", "noprice"]);
    expect(ids(sortProperties(list, "precio-desc"))).toEqual(["usd", "noprice"]);
  });

  it("sorts size ascending/descending using effective surface", () => {
    const list: P[] = [
      { id: "a", sizeTotal: 80 },
      { id: "b", size: 50 },
      { id: "c", sizeTotal: 120 },
    ];
    expect(ids(sortProperties(list, "tamano-asc"))).toEqual(["b", "a", "c"]);
    expect(ids(sortProperties(list, "tamano-desc"))).toEqual(["c", "a", "b"]);
  });

  it("prefers sizeTotal over legacy size for sorting", () => {
    const list: P[] = [
      { id: "a", sizeTotal: 100, size: 999 },
      { id: "b", sizeTotal: 200, size: 1 },
    ];
    expect(ids(sortProperties(list, "tamano-asc"))).toEqual(["a", "b"]);
  });

  it("sinks properties with no surface to the end in both directions", () => {
    const list: P[] = [
      { id: "nosize" },
      { id: "has", sizeTotal: 50 },
    ];
    expect(ids(sortProperties(list, "tamano-asc"))).toEqual(["has", "nosize"]);
    expect(ids(sortProperties(list, "tamano-desc"))).toEqual(["has", "nosize"]);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm test`
Expected: FAIL — `parseSortParam`/`sortProperties` are not exported from `./filters`.

- [ ] **Step 4: Implement `parseSortParam` and `sortProperties`**

Append to `apps/frontend/src/lib/filters.ts` (the file already imports `FilterOption` and exports `getEffectiveSurface`):

```ts
import type { SortOption } from "@/types/filters";

const SORT_OPTIONS: SortOption[] = [
  "precio-asc",
  "precio-desc",
  "tamano-asc",
  "tamano-desc",
];

/** Validates a raw `orden` query param into a SortOption, or null. */
export function parseSortParam(
  value: string | null | undefined,
): SortOption | null {
  return value && (SORT_OPTIONS as string[]).includes(value)
    ? (value as SortOption)
    : null;
}

type SortableProperty = {
  price?: number | null;
  currency?: string | null;
  sizeTotal?: number | null;
  size?: number | null;
};

const CURRENCY_RANK: Record<string, number> = { USD: 0, ARS: 1 };

function currencyRank(currency?: string | null): number {
  if (currency && currency in CURRENCY_RANK) return CURRENCY_RANK[currency];
  return 2;
}

function comparePrice(a: SortableProperty, b: SortableProperty, dir: 1 | -1): number {
  const aHas = typeof a.price === "number";
  const bHas = typeof b.price === "number";
  if (aHas !== bHas) return aHas ? -1 : 1; // missing price sinks to the end
  if (!aHas) return 0;
  const rankDelta = currencyRank(a.currency) - currencyRank(b.currency);
  if (rankDelta !== 0) return rankDelta; // fixed group order (US$ first)
  return ((a.price as number) - (b.price as number)) * dir;
}

function compareSize(a: SortableProperty, b: SortableProperty, dir: 1 | -1): number {
  const sa = getEffectiveSurface(a);
  const sb = getEffectiveSurface(b);
  const aHas = sa !== null;
  const bHas = sb !== null;
  if (aHas !== bHas) return aHas ? -1 : 1; // missing surface sinks to the end
  if (!aHas) return 0;
  return ((sa as number) - (sb as number)) * dir;
}

/**
 * Sorts a copy of `list` by the given option. Price sorts group by currency
 * (US$ before AR$, fixed). Missing sort keys sink to the end in both directions.
 * Returns the list unchanged when `sort` is null. Stable for equal keys.
 */
export function sortProperties<T extends SortableProperty>(
  list: T[],
  sort: SortOption | null,
): T[] {
  if (!sort) return list;
  const sorted = [...list];
  if (sort === "tamano-asc" || sort === "tamano-desc") {
    const dir = sort === "tamano-asc" ? 1 : -1;
    sorted.sort((a, b) => compareSize(a, b, dir));
    return sorted;
  }
  const dir = sort === "precio-asc" ? 1 : -1;
  sorted.sort((a, b) => comparePrice(a, b, dir));
  return sorted;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `pnpm test`
Expected: PASS (all `parseSortParam` and `sortProperties` tests green).

- [ ] **Step 6: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add apps/frontend/src/types/filters.ts apps/frontend/src/lib/filters.ts apps/frontend/src/lib/filters.test.ts
git commit -m "feat(propiedades): add sortProperties helper + SortOption type"
```

---

## Task 3: `PropertiesSort` dropdown component

**Files:**
- Create: `apps/frontend/src/components/PropertiesSort.tsx`

- [ ] **Step 1: Create the component**

Create `apps/frontend/src/components/PropertiesSort.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const SORT_CHOICES: { value: string; label: string }[] = [
  { value: "", label: "Más recientes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "tamano-asc", label: "Tamaño: menor a mayor" },
  { value: "tamano-desc", label: "Tamaño: mayor a menor" },
];

export default function PropertiesSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const current = searchParams.get("orden") || "";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("orden", value);
    } else {
      params.delete("orden");
    }
    params.delete("pagina"); // reset to first page on sort change
    const queryString = params.toString();
    startTransition(() => {
      router.push(queryString ? `/propiedades?${queryString}` : "/propiedades");
    });
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <label
        htmlFor="orden"
        className="form-label small text-muted mb-0 text-nowrap"
      >
        Ordenar por
      </label>
      <select
        id="orden"
        className="form-select form-select-sm"
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        aria-busy={isPending}
      >
        {SORT_CHOICES.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 2: Type-check via build (no test yet — wired up next task)**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/components/PropertiesSort.tsx
git commit -m "feat(propiedades): add PropertiesSort dropdown component"
```

---

## Task 4: Wire sorting into the listing

**Files:**
- Modify: `apps/frontend/src/components/PropertiesLayout.tsx`
- Modify: `apps/frontend/src/components/PropertiesListing.tsx`
- Modify: `apps/frontend/src/components/PropertiesFilters.tsx`

- [ ] **Step 1: Render `PropertiesSort` beside the count in `PropertiesLayout`**

In `apps/frontend/src/components/PropertiesLayout.tsx`, add the import after the `PropertiesFilters` import:

```tsx
import PropertiesSort from "./PropertiesSort";
```

Then replace this block:

```tsx
            <div className="mb-3" aria-live="polite">
              <p className="text-muted mb-0">
                {totalCount === 1
                  ? "1 propiedad encontrada"
                  : `${totalCount} propiedades encontradas`}
              </p>
            </div>
```

with:

```tsx
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3">
              <p className="text-muted mb-0" aria-live="polite">
                {totalCount === 1
                  ? "1 propiedad encontrada"
                  : `${totalCount} propiedades encontradas`}
              </p>
              <PropertiesSort />
            </div>
```

- [ ] **Step 2: Apply the sort in `PropertiesListing`**

In `apps/frontend/src/components/PropertiesListing.tsx`, update the import from `@/lib/filters` to add the two new functions:

```tsx
import {
  parseMultiple,
  parseSurfaceParam,
  getEffectiveSurface,
  sortProperties,
  parseSortParam,
} from "@/lib/filters";
```

Add this line right after the `currentPage` calculation (after line `const currentPage = ...`):

```tsx
  const sort = parseSortParam(searchParams.get("orden"));
```

Rename the filtering memo to apply sorting. Replace:

```tsx
  const filtered = useMemo(() => {
    return properties.filter((p) => {
```

with:

```tsx
  const filtered = useMemo(() => {
    const result = properties.filter((p) => {
```

Then change the `return true;\n  });` that closes the `.filter(...)` callback and the memo so the memo returns the sorted result. Replace:

```tsx
      return true;
    });
  }, [
    properties,
    operationType,
    propertyTypeSlugs,
    citySlugs,
    roomsList,
    onlyAvailable,
    surfaceMin,
    surfaceMax,
  ]);
```

with:

```tsx
      return true;
    });
    return sortProperties(result, sort);
  }, [
    properties,
    operationType,
    propertyTypeSlugs,
    citySlugs,
    roomsList,
    onlyAvailable,
    surfaceMin,
    surfaceMax,
    sort,
  ]);
```

Add `orden` to `currentSearchParams`. Replace:

```tsx
    supmin: searchParams.get("supmin") || undefined,
    supmax: searchParams.get("supmax") || undefined,
  };
```

with:

```tsx
    supmin: searchParams.get("supmin") || undefined,
    supmax: searchParams.get("supmax") || undefined,
    orden: searchParams.get("orden") || undefined,
  };
```

- [ ] **Step 3: Preserve `orden` when applying/clearing filters in `PropertiesFilters`**

In `apps/frontend/src/components/PropertiesFilters.tsx`, in `applyFilters`, after the last `params.set(...)` line (`if (filters.supMax) params.set("supmax", filters.supMax);`) and before `const queryString = params.toString();`, add:

```tsx
    const orden = searchParams.get("orden");
    if (orden) params.set("orden", orden);
```

In `clearFilters`, replace:

```tsx
  const clearFilters = () => {
    dispatch({ type: "RESET" });
    startTransition(() => {
      router.push("/propiedades");
    });
    setIsOpenMobile(false);
  };
```

with:

```tsx
  const clearFilters = () => {
    dispatch({ type: "RESET" });
    const orden = searchParams.get("orden");
    startTransition(() => {
      router.push(orden ? `/propiedades?orden=${orden}` : "/propiedades");
    });
    setIsOpenMobile(false);
  };
```

- [ ] **Step 4: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 5: Build to confirm static export compiles**

Run: `pnpm build`
Expected: "Compiled successfully" and static pages generated, no type errors.

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/components/PropertiesLayout.tsx apps/frontend/src/components/PropertiesListing.tsx apps/frontend/src/components/PropertiesFilters.tsx
git commit -m "feat(propiedades): wire sort control into listing and pagination"
```

---

## Task 5: e2e coverage

**Files:**
- Create: `apps/frontend/e2e/sorting.spec.ts`

- [ ] **Step 1: Write the e2e test**

Create `apps/frontend/e2e/sorting.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("Property listing sorting", () => {
  test("sort control exists and defaults to 'Más recientes'", async ({ page }) => {
    await page.goto("/propiedades");
    const sort = page.locator("#orden");
    await expect(sort).toBeVisible();
    await expect(sort).toHaveValue("");
  });

  test("changing the sort updates the URL and resets to page 1", async ({ page }) => {
    await page.goto("/propiedades?pagina=2");
    await page.locator("#orden").selectOption("precio-asc");
    await expect(page).toHaveURL(/orden=precio-asc/);
    await expect(page).not.toHaveURL(/pagina=/);
  });

  test("the sort persists across pagination when more than one page exists", async ({
    page,
  }) => {
    await page.goto("/propiedades");
    await page.locator("#orden").selectOption("tamano-desc");
    await expect(page).toHaveURL(/orden=tamano-desc/);

    const nextLink = page.locator(
      'nav[aria-label="Paginación de propiedades"] a[aria-label="Página siguiente"]',
    );
    if ((await nextLink.count()) > 0) {
      await nextLink.first().click();
      await expect(page).toHaveURL(/orden=tamano-desc/);
      await expect(page).toHaveURL(/pagina=2/);
    }
  });
});
```

- [ ] **Step 2: Build then run e2e**

Run: `pnpm build && pnpm test:e2e`
Expected: the three `sorting.spec.ts` tests PASS (third may no-op past the pagination click if the dataset has ≤12 results, but still asserts the sort param).

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/e2e/sorting.spec.ts
git commit -m "test(e2e): cover property listing sort control"
```

---

## Task 6: Final verification

- [ ] **Step 1: Unit tests**

Run (from `apps/frontend/`): `pnpm test`
Expected: all `filters.test.ts` tests PASS.

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: no errors.

- [ ] **Step 3: Build**

Run: `pnpm build`
Expected: compiles, static export generated.

- [ ] **Step 4: Manual smoke (dev server)**

Run: `pnpm dev`, open `/propiedades`, change the "Ordenar por" dropdown to each option, confirm the grid reorders, the URL `orden` param updates, paging keeps the sort, and applying/clearing filters keeps the sort. Stop the server when done.

---

## Self-Review Notes

- **Spec coverage:** options (Task 3/4), price currency-grouping + null sink (Task 2), size sort + null sink (Task 2), `orden` param + page-1 reset (Task 3) + persistence across pagination (Task 4) + applied after filtering before pagination (Task 4) + filter interaction (Task 4), components/data flow (Tasks 3–4), Vitest tests (Task 2) + e2e (Task 5). All covered.
- **No placeholders:** every code step shows full code.
- **Type consistency:** `SortOption`, `parseSortParam`, `sortProperties`, `getEffectiveSurface` names consistent across tasks; `orden` param name consistent across components.

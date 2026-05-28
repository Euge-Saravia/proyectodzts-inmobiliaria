import type { FilterOption, SortOption } from "@/types/filters";

export function parseMultiple(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(",").filter(Boolean);
}

/** Parses a surface query param into a non-negative number, or null if invalid. */
export function parseSurfaceParam(
  value: string | null | undefined,
): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/** Total surface of a property, falling back to the legacy `size` field. */
export function getEffectiveSurface(property: {
  sizeTotal?: number | null;
  size?: number | null;
}): number | null {
  if (typeof property.sizeTotal === "number") return property.sizeTotal;
  if (typeof property.size === "number") return property.size;
  return null;
}

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

function comparePrice(
  a: SortableProperty,
  b: SortableProperty,
  dir: 1 | -1,
): number {
  const aHas = typeof a.price === "number";
  const bHas = typeof b.price === "number";
  if (aHas !== bHas) return aHas ? -1 : 1; // missing price sinks to the end
  if (!aHas) return 0;
  const rankDelta = currencyRank(a.currency) - currencyRank(b.currency);
  if (rankDelta !== 0) return rankDelta; // fixed group order (US$ first)
  return ((a.price as number) - (b.price as number)) * dir;
}

function compareSize(
  a: SortableProperty,
  b: SortableProperty,
  dir: 1 | -1,
): number {
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

export function buildFilterOptions(
  cities: ({ name: string | null; slug: string | null } | null)[] | null,
  propertyTypes: ({ name: string | null; slug: string | null } | null)[] | null,
  roomCounts: (number | null)[] | null,
) {
  return {
    cities: (cities || []).filter(
      (c): c is FilterOption => c !== null && c.name !== null && c.slug !== null,
    ),
    propertyTypes: (propertyTypes || []).filter(
      (t): t is FilterOption => t !== null && t.name !== null && t.slug !== null,
    ),
    roomCounts: (roomCounts || []).filter(
      (r): r is number => r !== null && r !== undefined,
    ),
  };
}

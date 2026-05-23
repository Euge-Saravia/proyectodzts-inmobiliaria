import type { FilterOption } from "@/types/filters";

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

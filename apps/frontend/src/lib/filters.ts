import type { FilterOption } from "@/types/filters";

export function parseMultiple(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(",").filter(Boolean);
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

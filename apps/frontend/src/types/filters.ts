export interface FilterOption {
  name: string;
  slug: string;
}

export interface FilterOptions {
  cities: FilterOption[];
  propertyTypes: FilterOption[];
  roomCounts: number[];
}

export type SortOption =
  | "precio-asc"
  | "precio-desc"
  | "tamano-asc"
  | "tamano-desc";

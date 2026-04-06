export interface FilterOption {
  name: string;
  slug: string;
}

export interface FilterOptions {
  cities: FilterOption[];
  propertyTypes: FilterOption[];
  roomCounts: number[];
}

"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { SanityImageSource } from "@sanity/image-url";
import PropertiesLayout from "./PropertiesLayout";
import PropertiesGrid from "./PropertiesGrid";
import Pagination from "./Pagination";
import type { FilterOptions } from "@/types/filters";
import { parseMultiple } from "@/lib/filters";

export interface PropertyListItem {
  _id: string;
  title: string | null;
  slug: string | null;
  subtitle?: string | null;
  price?: number | null;
  currency?: string | null;
  operationType?: string | null;
  status?: string | null;
  propertyType?: string | null;
  propertyTypeSlug?: string | null;
  city?: string | null;
  citySlug?: string | null;
  rooms?: number | null;
  reference?: string | null;
  image?: SanityImageSource | null;
  lqip?: string | null;
}

interface PropertiesListingProps {
  properties: PropertyListItem[];
  filterOptions: FilterOptions;
}

const PAGE_SIZE = 12;

function PropertiesListingInner({
  properties,
  filterOptions,
}: PropertiesListingProps) {
  const searchParams = useSearchParams();

  const operationType = searchParams.get("operacion") || "";
  const propertyTypeSlugs = parseMultiple(searchParams.get("propiedad"));
  const citySlugs = parseMultiple(searchParams.get("localidad"));
  const roomsList = parseMultiple(searchParams.get("dormitorios"))
    .map((r) => parseInt(r, 10))
    .filter((room) => Number.isFinite(room));
  const parsedPage = searchParams.get("pagina")
    ? parseInt(searchParams.get("pagina")!, 10)
    : 1;
  const currentPage = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (operationType && p.operationType !== operationType) return false;
      if (
        propertyTypeSlugs.length > 0 &&
        (!p.propertyTypeSlug || !propertyTypeSlugs.includes(p.propertyTypeSlug))
      )
        return false;
      if (
        citySlugs.length > 0 &&
        (!p.citySlug || !citySlugs.includes(p.citySlug))
      )
        return false;
      if (
        roomsList.length > 0 &&
        (typeof p.rooms !== "number" || !roomsList.includes(p.rooms))
      )
        return false;
      return true;
    });
  }, [properties, operationType, propertyTypeSlugs, citySlugs, roomsList]);

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const currentSearchParams = {
    operacion: operationType || undefined,
    propiedad: searchParams.get("propiedad") || undefined,
    localidad: searchParams.get("localidad") || undefined,
    dormitorios: searchParams.get("dormitorios") || undefined,
  };

  return (
    <PropertiesLayout filterOptions={filterOptions} totalCount={totalCount}>
      <PropertiesGrid properties={pageItems} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        searchParams={currentSearchParams}
      />
    </PropertiesLayout>
  );
}

function PropertiesListingFallback({
  properties,
}: {
  properties: PropertyListItem[];
}) {
  const pageItems = properties.slice(0, PAGE_SIZE);
  return (
    <div className="properties-layout-wrapper">
      <div className="properties-layout properties-layout--expanded">
        <div style={{ gridArea: "filters" }}>
          <div className="bg-light rounded-3 p-3" aria-hidden="true" />
        </div>
        <div style={{ gridArea: "main", minWidth: 0 }}>
          <PropertiesGrid properties={pageItems} />
        </div>
      </div>
    </div>
  );
}

export default function PropertiesListing(props: PropertiesListingProps) {
  return (
    <Suspense fallback={<PropertiesListingFallback properties={props.properties} />}>
      <PropertiesListingInner {...props} />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import {
  getCachedCities,
  getCachedPropertyTypes,
  getCachedRoomCounts,
} from "@/sanity/queries/properties";
import { getCachedPropiedadesSeo, getCachedSiteSeo } from "@/sanity/queries/seo";
import { getCachedPropiedadesHeading } from "@/sanity/queries/propiedadesPage";
import { resolveMetadata } from "@/lib/seo";
import Breadcrumb from "@/components/Breadcrumb";
import PropertiesListing, {
  type PropertyListItem,
} from "@/components/PropertiesListing";
import { buildFilterOptions } from "@/lib/filters";

export async function generateMetadata(): Promise<Metadata> {
  const [pageSeo, siteSeo] = await Promise.all([
    getCachedPropiedadesSeo(),
    getCachedSiteSeo(),
  ]);

  return resolveMetadata(pageSeo, siteSeo, { canonicalUrl: "/propiedades" });
}

const PROPERTIES_QUERY = defineQuery(`
  *[_type == "property"
    && defined(slug.current)
    && published != false
  ] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    subtitle,
    price,
    currency,
    operationType,
    status,
    "propertyType": propertyType->name,
    "propertyTypeSlug": propertyType->slug.current,
    "city": city->name,
    "citySlug": city->slug.current,
    rooms,
    sizeTotal,
    size,
    reference,
    "image": images[0] { asset->{ _id, url, metadata { lqip } } }
  }
`);

interface RawProperty extends Omit<PropertyListItem, "lqip"> {
  image?: {
    asset?: { metadata?: { lqip?: string | null } | null } | null;
  } | null;
}

export default async function PropiedadesPage() {
  const [{ data: properties }, cities, propertyTypes, roomCounts, heading] =
    await Promise.all([
      sanityFetch({ query: PROPERTIES_QUERY }),
      getCachedCities(),
      getCachedPropertyTypes(),
      getCachedRoomCounts(),
      getCachedPropiedadesHeading(),
    ]);

  const filterOptions = buildFilterOptions(cities, propertyTypes, roomCounts);

  const propertiesList: PropertyListItem[] = ((properties || []) as RawProperty[]).map(
    (property) => ({
      ...property,
      lqip: property.image?.asset?.metadata?.lqip ?? null,
    }),
  );

  return (
    <main className="container-fluid px-3 px-lg-4 py-4 py-md-5">
      <Breadcrumb
        items={[
          { label: "Inicio", href: "/", isHome: true },
          { label: "Propiedades", href: "/propiedades" },
        ]}
      />
      <h1 className="text-center mb-4 fw-bold">{heading}</h1>

      <PropertiesListing
        properties={propertiesList}
        filterOptions={filterOptions}
      />
    </main>
  );
}

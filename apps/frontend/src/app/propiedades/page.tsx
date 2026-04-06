import type { Metadata } from "next";
import { defineQuery } from "next-sanity";
import { sanityFetch } from "@/sanity/lib/live";
import type { SanityImageSource } from "@sanity/image-url";
import {
  getCachedCities,
  getCachedPropertyTypes,
  getCachedRoomCounts,
} from "@/sanity/queries/properties";
import { getCachedPropiedadesSeo, getCachedSiteSeo } from "@/sanity/queries/seo";
import { getCachedPropiedadesHeading } from "@/sanity/queries/propiedadesPage";
import { resolveMetadata } from "@/lib/seo";
import Breadcrumb from "@/components/Breadcrumb";
import PropertiesLayout from "@/components/PropertiesLayout";
import PropertiesGrid from "@/components/PropertiesGrid";
import Pagination from "@/components/Pagination";
import { parseMultiple, buildFilterOptions } from "@/lib/filters";

export async function generateMetadata(): Promise<Metadata> {
  const [pageSeo, siteSeo] = await Promise.all([
    getCachedPropiedadesSeo(),
    getCachedSiteSeo(),
  ]);

  return resolveMetadata(pageSeo, siteSeo, { canonicalUrl: "/propiedades" });
}

const PAGE_SIZE = 12;

interface PropertyListItem {
  _id: string;
  title: string | null;
  slug: string | null;
  subtitle?: string | null;
  price?: number | null;
  currency?: string | null;
  operationType?: string | null;
  propertyType?: string | null;
  city?: string | null;
  rooms?: number | null;
  image?: SanityImageSource | null;
}

const PROPERTIES_QUERY = defineQuery(`
  *[_type == "property"
    && defined(slug.current)
    && !(status in ["vendido", "alquilado"])
    && ($operationType == "" || operationType == $operationType)
    && (count($propertyTypeSlugs) == 0 || propertyType->slug.current in $propertyTypeSlugs)
    && (count($citySlugs) == 0 || city->slug.current in $citySlugs)
    && (count($roomsList) == 0 || rooms in $roomsList)
  ] | order(publishedAt desc)[$start...$end] {
    _id,
    title,
    "slug": slug.current,
    subtitle,
    price,
    currency,
    operationType,
    "propertyType": propertyType->name,
    "city": city->name,
    rooms,
    "image": images[0] { asset->{ _id, url, metadata { lqip } } }
  }
`);

const COUNT_QUERY = defineQuery(`
  count(*[_type == "property"
    && defined(slug.current)
    && !(status in ["vendido", "alquilado"])
    && ($operationType == "" || operationType == $operationType)
    && (count($propertyTypeSlugs) == 0 || propertyType->slug.current in $propertyTypeSlugs)
    && (count($citySlugs) == 0 || city->slug.current in $citySlugs)
    && (count($roomsList) == 0 || rooms in $roomsList)
  ])
`);

interface PageProps {
  searchParams: Promise<{
    operacion?: string;
    propiedad?: string;
    localidad?: string;
    dormitorios?: string;
    pagina?: string;
  }>;
}

export default async function PropiedadesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const operationType = params.operacion || "";
  const propertyTypeSlugs = parseMultiple(params.propiedad);
  const citySlugs = parseMultiple(params.localidad);
  const roomsList = parseMultiple(params.dormitorios)
    .map((r) => parseInt(r, 10))
    .filter((room) => Number.isFinite(room));
  const parsedPage = params.pagina ? parseInt(params.pagina, 10) : 1;
  const currentPage = Number.isFinite(parsedPage) ? Math.max(1, parsedPage) : 1;

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;

  const [
    { data: properties },
    { data: totalCount },
    cities,
    propertyTypes,
    roomCounts,
    heading,
  ] = await Promise.all([
    sanityFetch({
      query: PROPERTIES_QUERY,
      params: {
        operationType,
        propertyTypeSlugs,
        citySlugs,
        roomsList,
        start,
        end,
      },
    }),
    sanityFetch({
      query: COUNT_QUERY,
      params: {
        operationType,
        propertyTypeSlugs,
        citySlugs,
        roomsList,
      },
    }),
    getCachedCities(),
    getCachedPropertyTypes(),
    getCachedRoomCounts(),
    getCachedPropiedadesHeading(),
  ]);

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);
  const propertiesList = (properties || []) as PropertyListItem[];

  const filterOptions = buildFilterOptions(cities, propertyTypes, roomCounts);

  const currentSearchParams = {
    operacion: operationType || undefined,
    propiedad: params.propiedad || undefined,
    localidad: params.localidad || undefined,
    dormitorios: params.dormitorios || undefined,
  };

  return (
    <main className="container-fluid px-3 px-lg-4 py-4 py-md-5">
      <Breadcrumb
        items={[
          { label: "Inicio", href: "/", isHome: true },
          { label: "Propiedades", href: "/propiedades" },
        ]}
      />
      <h1 className="text-center mb-4 fw-bold">{heading}</h1>

      <PropertiesLayout filterOptions={filterOptions} totalCount={totalCount || 0}>
        <PropertiesGrid
          properties={propertiesList.map((property) => ({
            ...property,
            lqip:
              (
                property.image as {
                  asset?: { metadata?: { lqip?: string | null } | null } | null;
                } | null
              )?.asset?.metadata?.lqip ?? null,
          }))}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          searchParams={currentSearchParams}
        />
      </PropertiesLayout>
    </main>
  );
}

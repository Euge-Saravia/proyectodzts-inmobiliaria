import type { PortableTextBlock } from "@portabletext/types";
import { defineQuery } from "next-sanity";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityFetch } from "@/sanity/lib/live";
import { client } from "@/sanity/lib/client";

export const PROPERTY_QUERY = defineQuery(`
  *[_type == "property" && slug.current == $slug][0]
  {
    title,
    subtitle,
    reference,
    address,
    description,
    price,
    "propertyType": propertyType->name,
    operationType,
    status,
    currency,
    "city": city->name,
    rooms,
    bathrooms,
    garages,
    sizeLand,
    sizeCovered,
    sizeTotal,
    "images": images[] { asset->{ _id, url, metadata { lqip } } },
    "ogImage": images[0],
    seo {
      metaTitle,
      metaDescription,
      ogImage { asset->{ url } },
      noIndex
    }
  }
`);

export const PROPERTY_SLUGS_QUERY = defineQuery(`
  *[_type == "property" && defined(slug.current) && published != false]{
    "slug": slug.current
  }
`);

export interface PropertyImageAsset {
  _id: string;
  url?: string | null;
  metadata?: { lqip?: string | null } | null;
}

export interface PropertyImage {
  asset: PropertyImageAsset | null;
}

export interface PropertyDetail {
  title: string | null;
  subtitle?: string | null;
  reference?: string | null;
  address?: string | null;
  description?: PortableTextBlock[] | null;
  price?: number | null;
  propertyType?: string | null;
  operationType?: string | null;
  status?: string | null;
  currency?: string | null;
  city?: string | null;
  rooms?: number | null;
  bathrooms?: number | null;
  garages?: number | null;
  sizeLand?: number | null;
  sizeCovered?: number | null;
  sizeTotal?: number | null;
  images?: Array<PropertyImage | null> | null;
  ogImage?: SanityImageSource | null;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    ogImage?: { asset?: { url?: string | null } | null } | null;
    noIndex?: boolean | null;
  } | null;
}

export interface PropertySlugEntry {
  slug: string;
}

export async function getCachedProperty(slug: string) {
  const { data } = await sanityFetch({
    query: PROPERTY_QUERY,
    params: { slug },
  });
  return data as PropertyDetail | null;
}

export async function getAllPropertySlugs() {
  return client.fetch<PropertySlugEntry[]>(PROPERTY_SLUGS_QUERY);
}

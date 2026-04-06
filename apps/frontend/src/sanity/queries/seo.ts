import { defineQuery } from "next-sanity";
import { cacheLife, cacheTag } from "next/cache";
import { sanityFetch } from "@/sanity/lib/live";
import type { SeoFields } from "@/types/seo";

const SEO_PROJECTION = `{
  metaTitle,
  metaDescription,
  ogImage { asset->{ url } },
  noIndex
}`;

const SITE_SEO_QUERY = defineQuery(`
  *[_type == "siteSettings"][0].seo {
    metaTitle,
    metaDescription,
    ogImage { asset->{ url } }
  }
`);

const HOME_SEO_QUERY = defineQuery(`
  *[_type == "homePage"][0].seo ${SEO_PROJECTION}
`);

const PROPIEDADES_SEO_QUERY = defineQuery(`
  *[_type == "propiedadesPage"][0].seo ${SEO_PROJECTION}
`);

export async function getCachedSiteSeo(): Promise<SeoFields | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("siteSettings");
  const { data } = await sanityFetch({ query: SITE_SEO_QUERY });
  return data;
}

export async function getCachedHomeSeo(): Promise<SeoFields | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("homePage");
  const { data } = await sanityFetch({ query: HOME_SEO_QUERY });
  return data;
}

export async function getCachedPropiedadesSeo(): Promise<SeoFields | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("propiedadesPage");
  const { data } = await sanityFetch({ query: PROPIEDADES_SEO_QUERY });
  return data;
}

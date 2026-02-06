import { defineQuery } from "next-sanity";
import { cacheLife, cacheTag } from "next/cache";
import { sanityFetch } from "@/sanity/lib/live";

export const HOME_SECTIONS_QUERY = defineQuery(`
  *[_type == "homePage"][0].sections[]{
    _key,
    title,
    anchorId,
    content,
    imagePosition,
    backgroundColor,
    images[]{ asset->{ url, metadata { lqip } }, alt }
  }
`);

export async function getCachedHomeSections() {
  "use cache";
  cacheLife("minutes");
  cacheTag("homePage");
  const { data } = await sanityFetch({ query: HOME_SECTIONS_QUERY });
  return data;
}

const HOME_CONTENT_QUERY = defineQuery(`
  *[_type == "homePage"][0] {
    heroHeading,
    heroImage { asset->{ _id, url, metadata { lqip, dimensions } } },
    heroLogo { asset->{ _id, url, metadata { lqip, dimensions } }, alt },
    featuredPropertiesHeading
  }
`);

export async function getCachedHomeContent() {
  "use cache";
  cacheLife("hours");
  cacheTag("homePage");
  const { data } = await sanityFetch({ query: HOME_CONTENT_QUERY });
  return data;
}

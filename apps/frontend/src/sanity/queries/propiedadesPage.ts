import { defineQuery } from "next-sanity";
import { cacheLife, cacheTag } from "next/cache";
import { sanityFetch } from "@/sanity/lib/live";

const PROPIEDADES_HEADING_QUERY = defineQuery(`
  *[_type == "propiedadesPage"][0].heading
`);

export async function getCachedPropiedadesHeading() {
  "use cache";
  cacheLife("hours");
  cacheTag("propiedadesPage");
  const { data } = await sanityFetch({ query: PROPIEDADES_HEADING_QUERY });
  return data;
}

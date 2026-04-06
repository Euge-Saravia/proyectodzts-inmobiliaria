import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";

interface PropertySlug {
  slug: string;
  _updatedAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    return [];
  }

  const properties = await client.fetch<PropertySlug[]>(`
    *[_type == "property" && defined(slug.current)] {
      "slug": slug.current,
      _updatedAt
    }
  `);

  const propertyUrls: MetadataRoute.Sitemap = properties.map((property) => ({
    url: `${baseUrl}/propiedades/${property.slug}`,
    lastModified: new Date(property._updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/propiedades`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...propertyUrls,
  ];
}

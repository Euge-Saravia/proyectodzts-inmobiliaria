import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const siteEnv = process.env.SITE_ENV ?? process.env.VERCEL_ENV;
  const isProduction = siteEnv === "production";

  if (!isProduction) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    ...(siteUrl && { sitemap: `${siteUrl}/sitemap.xml` }),
  };
}

import { defineQuery } from "next-sanity";
import { cacheLife, cacheTag } from "next/cache";
import { sanityFetch } from "@/sanity/lib/live";

const ORGANIZATION_QUERY = defineQuery(`
  *[_type == "siteSettings"][0] {
    siteName,
    logo { asset->{ url } },
    phone,
    email,
    address,
    socialLinks[] { url }
  }
`);

export async function getCachedOrganization() {
  "use cache";
  cacheLife("hours");
  cacheTag("siteSettings");
  const { data } = await sanityFetch({ query: ORGANIZATION_QUERY });
  return data;
}

export function buildOrganizationJsonLd(
  org: NonNullable<Awaited<ReturnType<typeof getCachedOrganization>>>,
) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    "@type": "RealEstateAgent",
    name: org.siteName,
    ...(siteUrl && { url: siteUrl }),
    ...(org.logo?.asset?.url && { logo: org.logo.asset.url }),
    ...(org.phone && { telephone: org.phone }),
    ...(org.email && { email: org.email }),
    ...(org.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: org.address,
        addressCountry: "AR",
      },
    }),
    ...(org.socialLinks &&
      org.socialLinks.length > 0 && {
        sameAs: org.socialLinks
          .map((link: { url?: string | null } | null) => link?.url)
          .filter((url: string | null | undefined): url is string => Boolean(url)),
      }),
  };
}

export const SITE_SETTINGS_QUERY = defineQuery(/* groq */ `
  *[_type == "siteSettings"][0] {
    siteName,
    logo {
      asset->{
        _id,
        url,
        metadata { lqip, dimensions }
      },
      alt
    },
    favicon {
      asset->{
        _id,
        url
      }
    },
    mainNavigation[] {
      _key,
      label,
      linkType,
      internalPath,
      externalUrl,
      actionId
    },
    phone,
    email,
    address,
    whatsappNumber,
    whatsappMessage,
    socialLinks[] {
      _key,
      platform,
      url
    },
    footerLinks[] {
      _key,
      label,
      url
    },
    certificationLogos[] {
      _key,
      image {
        asset->{
          _id,
          url,
          metadata { lqip, dimensions }
        }
      },
      alt,
      title,
      url
    },
    creditLine {
      text,
      url
    }
  }
`);

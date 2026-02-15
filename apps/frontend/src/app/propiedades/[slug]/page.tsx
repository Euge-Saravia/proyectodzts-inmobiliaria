import type { Metadata } from "next";
import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/types";
import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { defineQuery } from "next-sanity";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityFetch } from "@/sanity/lib/live";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { getCachedSiteSeo } from "@/sanity/queries/seo";
import {
  getCachedOrganization,
  buildOrganizationJsonLd,
} from "@/sanity/queries/siteSettings";
import { resolveMetadata } from "@/lib/seo";

import Breadcrumb from "@/components/Breadcrumb";
import ContactButton from "@/components/ContactButton";
import ImageCarousel from "@/components/ImageCarousel";
import MapSection from "@/components/MapSection";

const PROPERTY_QUERY = defineQuery(`
  *[_type == "property" && slug.current == $slug][0]
  {
    title,
    subtitle,
    address,
    description,
    price,
    "propertyType": propertyType->name,
    operationType,
    status,
    currency,
    "city": city->name,
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

const PROPERTY_SLUGS_QUERY = defineQuery(`
  *[_type == "property" && defined(slug.current)]{
    "slug": slug.current
  }
`);

interface PropertyImageAsset {
  _id: string;
  url?: string | null;
  metadata?: { lqip?: string | null } | null;
}

interface PropertyImage {
  asset: PropertyImageAsset | null;
}

interface PropertyDetail {
  title: string | null;
  subtitle?: string | null;
  address?: string | null;
  description?: PortableTextBlock[] | null;
  price?: number | null;
  propertyType?: string | null;
  operationType?: string | null;
  status?: string | null;
  currency?: string | null;
  city?: string | null;
  images?: Array<PropertyImage | null> | null;
  ogImage?: SanityImageSource | null;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    ogImage?: { asset?: { url?: string | null } | null } | null;
    noIndex?: boolean | null;
  } | null;
}

interface PropertySlugEntry {
  slug: string;
}

async function getCachedProperty(slug: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("property");
  const { data } = await sanityFetch({
    query: PROPERTY_QUERY,
    params: { slug },
  });
  return data as PropertyDetail | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [property, siteSeo] = await Promise.all([
    getCachedProperty(slug),
    getCachedSiteSeo(),
  ]);

  if (!property) return {};

  const ogImageUrl = property.ogImage
    ? urlFor(property.ogImage).width(1200).height(630).url()
    : undefined;

  return resolveMetadata(property.seo, siteSeo, {
    title: property.title,
    description: property.subtitle,
    ogImageUrl,
    canonicalUrl: `/propiedades/${slug}`,
  });
}

export async function generateStaticParams() {
  const slugs = await client.fetch<PropertySlugEntry[]>(PROPERTY_SLUGS_QUERY);
  return slugs.map((entry) => ({ slug: entry.slug }));
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [property, organization] = await Promise.all([
    getCachedProperty(slug),
    getCachedOrganization(),
  ]);

  if (!property) {
    notFound();
  }

  const imageUrls = (property.images ?? [])
    .filter((img) => img?.asset?.url)
    .map((img) => img!.asset!.url!);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.subtitle,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/propiedades/${slug}`,
    ...(property.price != null && {
      offers: {
        "@type": "Offer",
        price: property.price,
        priceCurrency: property.currency === "ARS" ? "ARS" : "USD",
      },
    }),
    ...(property.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: property.address,
        ...(property.city && { addressLocality: property.city }),
        addressCountry: "AR",
      },
    }),
    ...(imageUrls.length > 0 && { image: imageUrls }),
    ...(organization && {
      offeredBy: buildOrganizationJsonLd(organization),
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <Breadcrumb
              items={[
                { label: "Inicio", href: "/", isHome: true },
                { label: "Propiedades", href: "/propiedades" },
                {
                  label: property.title || "Propiedad",
                  href: `/propiedades/${slug}`,
                },
              ]}
            />
            <h1 className="text-secondary mb-2" style={{ fontSize: "2.5rem" }}>
              {property.title}
            </h1>
            <div className="d-flex gap-2 mb-2">
              {property.operationType && (
                <span
                  className={`badge rounded-pill fs-6 ${property.operationType === "venta" ? "bg-success" : "bg-warning text-dark"}`}
                >
                  {property.operationType === "venta" ? "Venta" : "Alquiler"}
                </span>
              )}
              {property.propertyType && (
                <span className="badge rounded-pill bg-info text-white fs-6">
                  {property.propertyType}
                </span>
              )}
              {property.status && property.status !== "disponible" && (
                <span className="badge rounded-pill bg-danger text-white fs-6">
                  {property.status === "vendido" ? "Vendido" : "Alquilado"}
                </span>
              )}
            </div>

            <div className="text-primary mb-3" style={{ fontSize: "1.1rem" }}>
              {property.subtitle && <div>{property.subtitle}</div>}
              <div>
                {property.address}
                {property.address && property.city && ", "}
                {property.city && <span>{property.city}</span>}
              </div>
            </div>
            <hr className="border-primary mb-4" />

            <ImageCarousel
              images={(property.images ?? []).map((img) => {
                const asset = img?.asset?.url
                  ? (img.asset as SanityImageSource)
                  : null;

                return {
                  asset,
                  lqip: img?.asset?.metadata?.lqip ?? null,
                };
              })}
              title={property.title ?? ""}
            />
            {property.description ? (
              <div className="mb-5">
                <PortableText value={property.description} />
              </div>
            ) : null}

            <hr className="border-secondary my-4" />
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
              <span
                className="text-primary fw-bold fs-3 fs-md-1"
                style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}
              >
                {property.price != null
                  ? `${property.currency === "ARS" ? "AR$" : "US$"}${property.price.toLocaleString("es-AR")}`
                  : "Consultar precio"}
              </span>
              <ContactButton />
            </div>
          </div>
        </div>
      </div>
      <MapSection
        address={[property.address, property.city, "Argentina"]
          .filter(Boolean)
          .join(", ")}
        title={`Ubicación de ${property.title || "la propiedad"}`}
      />
    </>
  );
}

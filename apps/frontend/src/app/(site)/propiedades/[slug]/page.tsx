import type { Metadata } from "next";
import { PortableText } from "@portabletext/react";
import { notFound } from "next/navigation";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/lib/image";
import { getCachedSiteSeo } from "@/sanity/queries/seo";
import {
  getCachedOrganization,
  buildOrganizationJsonLd,
} from "@/sanity/queries/siteSettings";
import {
  getCachedProperty,
  getAllPropertySlugs,
} from "@/sanity/queries/propertyDetail";
import { resolveMetadata } from "@/lib/seo";

import Breadcrumb from "@/components/Breadcrumb";
import ShareButton from "@/components/ShareButton";
import ImageCarousel from "@/components/ImageCarousel";
import MapSection from "@/components/MapSection";
import "./property-detail.css";

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
  const slugs = await getAllPropertySlugs();
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

  const statusLabels: Record<string, string> = {
    reservado: "Reservado",
    vendido: "Vendido",
    alquilado: "Alquilado",
  };
  const statusLabel = property.status ? statusLabels[property.status] : undefined;
  const isReservado = property.status === "reservado";

  const features: { label: string; value: string | number }[] = [
    property.rooms != null && { label: "Dormitorios", value: property.rooms },
    property.bathrooms != null && { label: "Baños", value: property.bathrooms },
    property.garages != null && { label: "Cocheras", value: property.garages },
    property.sizeCovered != null && {
      label: "Sup. cubierta",
      value: `${property.sizeCovered} m²`,
    },
    property.sizeLand != null && {
      label: "Sup. terreno",
      value: `${property.sizeLand} m²`,
    },
    property.sizeTotal != null && {
      label: "Sup. total",
      value: `${property.sizeTotal} m²`,
    },
  ].filter(Boolean) as { label: string; value: string | number }[];

  const whatsappNumber = organization?.whatsappNumber;
  const whatsappConsultUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola, me interesa la propiedad "${property.title}". ¿Podrían darme más información?`)}`
    : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const propertyUrl = `${siteUrl}/propiedades/${slug}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`${property.title} - ${propertyUrl}`)}`;

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
            {property.reference && (
              <div className="text-muted small mb-1">
                Ref: {property.reference}
              </div>
            )}
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

            <div className="position-relative">
              {statusLabel && (
                <div
                  className={`status-banner${isReservado ? " status-banner--reservado" : ""}`}
                  aria-label={`Propiedad ${statusLabel.toLowerCase()}`}
                >
                  <span>{statusLabel}</span>
                </div>
              )}
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
            </div>
            {features.length > 0 && (
              <div className="row g-3 my-4 text-center">
                {features.map((feature) => (
                  <div className="col-6 col-md-4" key={feature.label}>
                    <div className="bg-light rounded-3 p-3 h-100">
                      <div className="fw-bold fs-4 text-primary">
                        {feature.value}
                      </div>
                      <div className="text-muted small">{feature.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {property.description ? (
              <div className="mb-5">
                <PortableText value={property.description} />
              </div>
            ) : null}

            <hr className="border-secondary my-4" />
            <p
              className="text-primary fw-bold text-center mb-3"
              style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}
            >
              {property.price != null
                ? `${property.currency === "ARS" ? "AR$" : "US$"}${property.price.toLocaleString("es-AR")}`
                : "Consultar precio"}
            </p>
            <div className="d-flex gap-2 w-100">
                <a
                  href={`/propiedades/${slug}/ficha`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-secondary text-dark py-2 fw-bold flex-fill text-center"
                >
                  <i className="bi bi-file-earmark-text me-2" aria-hidden="true" />
                  Ficha
                </a>
                <ShareButton />
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-success py-2 fw-bold flex-fill text-center"
                  aria-label="Compartir por WhatsApp"
                >
                  <i className="bi bi-whatsapp me-2" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>

            {whatsappConsultUrl && (
              <div className="mt-4">
                <a
                  href={whatsappConsultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success text-white px-4 py-3 fw-bold fs-5 w-100"
                >
                  <i className="bi bi-whatsapp me-2" aria-hidden="true" />
                  Consultar por WhatsApp
                </a>
              </div>
            )}
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

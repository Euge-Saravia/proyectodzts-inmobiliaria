import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/lib/image";
import {
  getCachedProperty,
  getAllPropertySlugs,
} from "@/sanity/queries/propertyDetail";
import FichaActions from "@/components/FichaActions";
import "./ficha.css";

export async function generateStaticParams() {
  const slugs = await getAllPropertySlugs();
  return slugs.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getCachedProperty(slug);
  return {
    title: property ? `Ficha - ${property.title}` : "Ficha",
    robots: { index: false, follow: false },
  };
}

export default async function FichaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getCachedProperty(slug);

  if (!property) {
    notFound();
  }

  const validImages = (property.images ?? []).filter(
    (img) => img?.asset?.url
  );

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

  return (
    <>
      <div className="ficha-container">
        <FichaActions />
        <header className="ficha-header">
          {property.reference && (
            <div className="ficha-reference">Ref: {property.reference}</div>
          )}
          <h1>{property.title}</h1>
          <div className="ficha-meta">
            {property.operationType && (
              <span className="badge rounded-pill fs-6 bg-dark">
                {property.operationType === "venta" ? "Venta" : "Alquiler"}
              </span>
            )}
            {property.propertyType && (
              <span className="badge rounded-pill fs-6 bg-secondary text-dark">
                {property.propertyType}
              </span>
            )}
            {property.status && property.status !== "disponible" && (
              <span
                className={`badge rounded-pill fs-6 ${property.status === "reservado" ? "bg-warning text-dark" : "bg-danger text-white"}`}
              >
                {property.status === "vendido"
                  ? "Vendido"
                  : property.status === "alquilado"
                    ? "Alquilado"
                    : "Reservado"}
              </span>
            )}
          </div>
        </header>

        <div className="ficha-details">
          {property.subtitle && <p className="ficha-subtitle">{property.subtitle}</p>}
          <p className="ficha-address">
            {property.address}
            {property.address && property.city && ", "}
            {property.city}
          </p>
          <p className="ficha-price">
            {property.price != null
              ? `${property.currency === "ARS" ? "AR$" : "US$"}${property.price.toLocaleString("es-AR")}`
              : "Consultar precio"}
          </p>
        </div>

        {features.length > 0 && (
          <div className="ficha-features">
            {features.map((feature) => (
              <div className="ficha-feature" key={feature.label}>
                <div className="ficha-feature-value">{feature.value}</div>
                <div className="ficha-feature-label">{feature.label}</div>
              </div>
            ))}
          </div>
        )}

        {validImages.length > 0 && (
          <div className="ficha-images">
            {validImages.map((img, index) => {
              const src = urlFor(img!.asset as SanityImageSource)
                .width(800)
                .quality(80)
                .auto("format")
                .url();
              return (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={index}
                  src={src}
                  alt={`${property.title} - Imagen ${index + 1}`}
                  className="ficha-image"
                />
              );
            })}
          </div>
        )}

        {property.description && (
          <div className="ficha-description">
            <h2>Descripción</h2>
            <PortableText value={property.description} />
          </div>
        )}
      </div>
    </>
  );
}

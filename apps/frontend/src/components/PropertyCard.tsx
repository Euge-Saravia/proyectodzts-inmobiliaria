import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { SanityImageSource } from "@sanity/image-url";

interface PropertyCardProps {
  title: string | null;
  slug: string | null;
  subtitle?: string | null;
  price?: number | null;
  currency?: string | null;
  operationType?: string | null;
  status?: string | null;
  image?: SanityImageSource | null;
  lqip?: string | null;
  rooms?: number | null;
  city?: string | null;
  reference?: string | null;
  priority?: boolean;
}

const STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  reservado: { label: "Reservado", badgeClass: "bg-warning text-dark" },
  vendido: { label: "Vendido", badgeClass: "bg-danger text-white" },
  alquilado: { label: "Alquilado", badgeClass: "bg-danger text-white" },
};

export default function PropertyCard({
  title,
  slug,
  subtitle,
  price,
  currency = "USD",
  operationType,
  status,
  image,
  lqip,
  rooms,
  city,
  reference,
  priority,
}: PropertyCardProps) {
  const statusInfo = status ? STATUS_LABELS[status] : undefined;
  const imageUrl = image
    ? urlFor(image).width(800).height(600).quality(80).auto("format").url()
    : "https://placehold.co/400x300/png";

  const currencySymbol = currency === "ARS" ? "AR$" : "US$";

  return (
    <Link href={`/propiedades/${slug}`} className="text-decoration-none w-100">
      <div
        className="card shadow-sm rounded-4 border-0 h-100 mx-auto"
        style={{ maxWidth: 400 }}
      >
        <div className="position-relative" style={{ aspectRatio: "4/3" }}>
          <Image
            src={imageUrl}
            alt={title || "Property Image"}
            fill
            sizes="(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="card-img-top rounded-top-4 object-fit-cover"
            priority={priority}
            {...(lqip ? { placeholder: "blur" as const, blurDataURL: lqip } : {})}
          />
          {operationType && (
            <span
              className={`position-absolute top-0 end-0 m-2 badge rounded-pill ${operationType === "venta" ? "bg-success" : "bg-warning text-dark"}`}
            >
              {operationType === "venta" ? "Venta" : "Alquiler"}
            </span>
          )}
          {statusInfo && (
            <span
              className={`position-absolute top-0 start-0 m-2 badge rounded-pill ${statusInfo.badgeClass}`}
            >
              {statusInfo.label}
            </span>
          )}
        </div>
        <div className="w-100 bg-primary" style={{ height: 4 }}></div>
        <div className="card-body text-center pb-2 bg-light rounded-bottom-4">
          {reference && (
            <div className="text-muted small mb-1" style={{ fontSize: "0.75rem" }}>
              Ref: {reference}
            </div>
          )}
          <h5 className="fw-bold text-primary mb-2 fs-5">{title}</h5>
          {(city || rooms) && (
            <p className="mb-2 text-muted small">
              {city}
              {city && rooms ? " · " : ""}
              {rooms ? `${rooms} dorm.` : ""}
            </p>
          )}
          {subtitle && <p className="mb-3 text-body small">{subtitle}</p>}
          <div className="d-flex align-items-center justify-content-end border-top pt-3">
            <span className="fw-bold text-primary fs-5">
              {price != null
                ? `${currencySymbol}${price.toLocaleString("es-AR")}`
                : "Consultar precio"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

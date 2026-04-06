import { defineQuery } from "next-sanity";
import { cacheLife, cacheTag } from "next/cache";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityFetch } from "@/sanity/lib/live";
import PropertyCard from "./PropertyCard";

const FEATURED_QUERY = defineQuery(`*
  [_type == "property" && featured == true && !(status in ["vendido", "alquilado"])]
  | order(publishedAt desc)[0...6]
  {
    _id,
    title,
    "slug": slug.current,
    subtitle,
    price,
    currency,
    operationType,
    rooms,
    "city": city->name,
    "image": images[0] { asset->{ _id, url, metadata { lqip } } }
  }`);

interface FeaturedProperty {
  _id: string;
  title: string | null;
  slug: string | null;
  subtitle: string | null;
  price: number | null;
  currency: string | null;
  operationType: string | null;
  rooms: number | null;
  city: string | null;
  image: { asset: { _id: string; url: string; metadata: { lqip: string } } | null } | null;
}

export default async function FeaturedProperties({
  heading,
}: {
  heading: string;
}) {
  "use cache";
  cacheLife("minutes");
  cacheTag("property");
  const { data: properties } = await sanityFetch({ query: FEATURED_QUERY }) as { data: FeaturedProperty[] };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-5 fw-bold">{heading}</h2>
      <div className="row justify-content-center g-4">
        {properties.length > 0 ? (
          properties.map((property) => (
            <div
              key={property._id}
              className="col-12 col-md-6 col-lg-4 d-flex justify-content-center"
            >
              <PropertyCard
                title={property.title}
                slug={property.slug}
                subtitle={property.subtitle}
                price={property.price}
                currency={property.currency}
                operationType={property.operationType}
                image={property.image}
                lqip={property.image?.asset?.metadata?.lqip}
                rooms={property.rooms}
                city={property.city}
              />
            </div>
          ))
        ) : (
          <p className="text-center text-muted">
            No hay propiedades disponibles
          </p>
        )}
      </div>
    </div>
  );
}

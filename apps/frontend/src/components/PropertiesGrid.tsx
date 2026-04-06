import type { ComponentProps } from "react";
import PropertyCard from "./PropertyCard";

type PropertyCardData = ComponentProps<typeof PropertyCard> & {
  _id: string;
};

interface PropertiesGridProps {
  properties: PropertyCardData[];
}

export default function PropertiesGrid({ properties }: PropertiesGridProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted fs-5">
          No se encontraron propiedades con los filtros seleccionados.
        </p>
        <p className="text-muted">
          Intenta ajustar los filtros para ver más resultados.
        </p>
      </div>
    );
  }

  return (
    <div className="row g-4">
      {properties.map((property, index) => (
        <div
          key={property._id}
          className="col-12 col-sm-6 col-xl-4 d-flex justify-content-center"
        >
          <PropertyCard
            title={property.title}
            slug={property.slug}
            subtitle={property.subtitle}
            price={property.price}
            currency={property.currency}
            operationType={property.operationType}
            image={property.image}
            lqip={property.lqip}
            rooms={property.rooms}
            city={property.city}
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { FilterOptions } from "@/types/filters";
import "./SearchProperties.css";

interface SearchPropertiesProps {
  filterOptions?: FilterOptions;
  heroHeading: string;
  heroImageUrl: string;
  heroImageLqip?: string | null;
  heroLogoUrl: string;
  heroLogoAlt?: string | null;
}

export default function SearchProperties({
  filterOptions,
  heroHeading,
  heroImageUrl,
  heroImageLqip,
  heroLogoUrl,
  heroLogoAlt,
}: SearchPropertiesProps) {
  const router = useRouter();
  const [operacion, setOperacion] = useState("");
  const [propiedad, setPropiedad] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [dormitorios, setDormitorios] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (operacion) params.set("operacion", operacion);
    if (propiedad) params.set("propiedad", propiedad);
    if (localidad) params.set("localidad", localidad);
    if (dormitorios) params.set("dormitorios", dormitorios);

    const queryString = params.toString();
    router.push(queryString ? `/propiedades?${queryString}` : "/propiedades");
  };

  return (
    <section className="hero min-vh-100 w-100 overflow-hidden position-relative text-white d-flex align-items-center justify-content-center">
      <Image
        src={heroImageUrl}
        alt="Imagen de fondo del formulario de búsqueda"
        fill
        className="object-cover negative-z"
        sizes="100vw"
        priority
        fetchPriority="high"
        {...(heroImageLqip
          ? { placeholder: "blur" as const, blurDataURL: heroImageLqip }
          : {})}
      />

      <div className="overlay position-absolute top-0 start-0 w-100 h-100 position-relative"></div>

      <div className="container position-relative z-1 text-center">
        <div className="row pb-4">
          <div className="col-12 col-md-3 logo-container pb-4 mx-auto position-relative">
            <Image
              src={heroLogoUrl}
              alt={heroLogoAlt ?? ""}
              fill
              className="logo-image"
              sizes="(max-width: 767.98px) 200px, 400px"
            />
          </div>
          <h1 className="text-center">{heroHeading}</h1>
        </div>

        <div className="row gap-4 pb-4 flex-wrap flex-md-nowrap justify-content-center">
          <div className="col-12 col-md-3">
            <label htmlFor="operacion" className="visually-hidden">
              Operación
            </label>
            <select
              id="operacion"
              className="form-select"
              value={operacion}
              onChange={(e) => setOperacion(e.target.value)}
            >
              <option value="">Operación</option>
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="propiedad" className="visually-hidden">
              Propiedad
            </label>
            <select
              id="propiedad"
              className="form-select"
              value={propiedad}
              onChange={(e) => setPropiedad(e.target.value)}
            >
              <option value="">Propiedad</option>
              {filterOptions?.propertyTypes.map((type) => (
                <option key={type.slug} value={type.slug}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="localidad" className="visually-hidden">
              Localidad
            </label>
            <select
              id="localidad"
              className="form-select"
              value={localidad}
              onChange={(e) => setLocalidad(e.target.value)}
            >
              <option value="">Localidad</option>
              {filterOptions?.cities.map((city) => (
                <option key={city.slug} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="dormitorios" className="visually-hidden">
              Dormitorios
            </label>
            <select
              id="dormitorios"
              className="form-select"
              value={dormitorios}
              onChange={(e) => setDormitorios(e.target.value)}
            >
              <option value="">Dormitorios</option>
              {filterOptions?.roomCounts.map((count) => (
                <option key={count} value={count.toString()}>
                  {count} {count === 1 ? "dormitorio" : "dormitorios"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button type="button" className="btn-custom" onClick={handleSearch}>
            Buscar
          </button>
        </div>
      </div>
    </section>
  );
}

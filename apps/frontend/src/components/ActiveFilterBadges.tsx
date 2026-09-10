"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { TransitionStartFunction } from "react";
import type { FilterOption } from "@/types/filters";
import { parseMultiple } from "@/lib/filters";

interface ActiveFilterBadgesProps {
  cities: FilterOption[];
  propertyTypes: FilterOption[];
  startTransition: TransitionStartFunction;
}

export default function ActiveFilterBadges({
  cities,
  propertyTypes,
  startTransition,
}: ActiveFilterBadgesProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const appliedOperacion = searchParams.get("operacion") || "";
  const appliedPropiedad = parseMultiple(searchParams.get("propiedad"));
  const appliedLocalidad = parseMultiple(searchParams.get("localidad"));
  const appliedDormitorios = parseMultiple(searchParams.get("dormitorios"));
  const appliedDisponibles = searchParams.get("disponibles") === "1";
  const appliedSupMin = searchParams.get("supmin") || "";
  const appliedSupMax = searchParams.get("supmax") || "";

  const getOperacionLabel = (value: string) => {
    if (value === "venta") return "Venta";
    if (value === "alquiler") return "Alquiler";
    return value;
  };

  const getPropiedadLabel = (slug: string) => {
    const found = propertyTypes.find((t) => t.slug === slug);
    return found?.name || slug;
  };

  const getLocalidadLabel = (slug: string) => {
    const found = cities.find((c) => c.slug === slug);
    return found?.name || slug;
  };

  const getDormitoriosLabel = (value: string) => {
    const count = parseInt(value, 10);
    return `${count} ${count === 1 ? "dorm." : "dorms."}`;
  };

  const getSuperficieLabel = (min: string, max: string) => {
    if (min && max) return `${min} - ${max} m²`;
    if (min) return `Desde ${min} m²`;
    return `Hasta ${max} m²`;
  };

  const appliedFilters: { key: string; value: string; label: string; icon: string }[] = [];
  if (appliedOperacion) {
    appliedFilters.push({
      key: "operacion",
      value: appliedOperacion,
      label: getOperacionLabel(appliedOperacion),
      icon: "bi-tag",
    });
  }
  appliedPropiedad.forEach((slug) => {
    appliedFilters.push({
      key: "propiedad",
      value: slug,
      label: getPropiedadLabel(slug),
      icon: "bi-house",
    });
  });
  appliedLocalidad.forEach((slug) => {
    appliedFilters.push({
      key: "localidad",
      value: slug,
      label: getLocalidadLabel(slug),
      icon: "bi-geo-alt",
    });
  });
  appliedDormitorios.forEach((value) => {
    appliedFilters.push({
      key: "dormitorios",
      value,
      label: getDormitoriosLabel(value),
      icon: "bi-door-open",
    });
  });
  if (appliedDisponibles) {
    appliedFilters.push({
      key: "disponibles",
      value: "1",
      label: "Solo disponibles",
      icon: "bi-check-circle",
    });
  }
  if (appliedSupMin || appliedSupMax) {
    appliedFilters.push({
      key: "superficie",
      value: "",
      label: getSuperficieLabel(appliedSupMin, appliedSupMax),
      icon: "bi-rulers",
    });
  }

  const removeFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (key === "operacion" || key === "disponibles") {
      params.delete(key);
    } else if (key === "superficie") {
      params.delete("supmin");
      params.delete("supmax");
    } else {
      const current = parseMultiple(params.get(key));
      const updated = current.filter((v) => v !== value);
      if (updated.length > 0) {
        params.set(key, updated.join(","));
      } else {
        params.delete(key);
      }
    }

    params.delete("pagina");
    const queryString = params.toString();
    startTransition(() => {
      router.push(queryString ? `/propiedades?${queryString}` : "/propiedades");
    });
  };

  const clearAllFilters = () => {
    startTransition(() => {
      router.push("/propiedades");
    });
  };

  if (appliedFilters.length === 0) {
    return null;
  }

  return (
    <div className="d-flex flex-wrap align-items-center gap-2 mb-4">
      <span className="text-muted small me-1">Filtros activos:</span>
      {appliedFilters.map(({ key, value, label, icon }) => (
        <span
          key={`${key}-${value}`}
          className="badge bg-primary bg-opacity-10 text-primary border border-primary rounded-pill d-inline-flex align-items-center gap-1 px-3 py-2"
        >
          <i className={`bi ${icon}`}></i>
          {label}
          <button
            type="button"
            className="btn-close btn-close-sm ms-1"
            style={{ fontSize: "0.6rem" }}
            aria-label={`Quitar filtro ${label}`}
            onClick={() => removeFilter(key, value)}
          />
        </span>
      ))}
      <button
        type="button"
        className="btn btn-link btn-sm text-danger text-decoration-none p-0 ms-2"
        onClick={clearAllFilters}
      >
        Limpiar todos
      </button>
    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const SORT_CHOICES: { value: string; label: string }[] = [
  { value: "", label: "Más recientes" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "tamano-asc", label: "Tamaño: menor a mayor" },
  { value: "tamano-desc", label: "Tamaño: mayor a menor" },
];

export default function PropertiesSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const current = searchParams.get("orden") || "";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("orden", value);
    } else {
      params.delete("orden");
    }
    params.delete("pagina"); // reset to first page on sort change
    const queryString = params.toString();
    startTransition(() => {
      router.push(queryString ? `/propiedades?${queryString}` : "/propiedades");
    });
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <label
        htmlFor="orden"
        className="form-label small text-muted mb-0 text-nowrap"
      >
        Ordenar por
      </label>
      <select
        id="orden"
        className="form-select form-select-sm"
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        aria-busy={isPending}
      >
        {SORT_CHOICES.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
    </div>
  );
}

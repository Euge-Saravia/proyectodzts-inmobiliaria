"use client";
"use no memo";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { defineQuery } from "next-sanity";
import { client } from "@/sanity/lib/client";

const REFERENCE_SLUG_QUERY = defineQuery(
  `*[_type == "property" && reference == $reference][0]{ "slug": slug.current }`,
);

export default function ReferenceSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const raw = value.trim().toUpperCase();
    if (!raw) {
      setError("Ingresá un código de referencia.");
      return;
    }

    const normalized = raw.startsWith("DZTS-") ? raw : `DZTS-${raw}`;
    if (!/^DZTS-\d{3,}$/.test(normalized)) {
      setError("El formato debe ser DZTS-### (ej: DZTS-001).");
      return;
    }

    setPending(true);
    try {
      const result = await client.fetch<{ slug: string | null } | null>(
        REFERENCE_SLUG_QUERY,
        { reference: normalized },
      );

      if (!result?.slug) {
        setError(`No se encontró ninguna propiedad con el código ${normalized}.`);
        return;
      }

      router.push(`/propiedades/${result.slug}`);
    } catch {
      setError("No se pudo completar la búsqueda. Intentá de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mb-4 pb-3 border-bottom">
      <label
        htmlFor="reference-search"
        className="fw-semibold small text-uppercase text-muted d-block mb-2"
      >
        Buscar por referencia
      </label>
      <form onSubmit={handleSubmit} className="d-flex gap-2">
        <input
          id="reference-search"
          name="reference"
          type="text"
          className="form-control form-control-sm"
          placeholder="DZTS-001"
          autoComplete="off"
          inputMode="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button
          type="submit"
          className="btn btn-outline-primary"
          disabled={pending}
          aria-busy={pending}
          aria-label="Buscar por referencia"
        >
          {pending ? (
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden="true"
            />
          ) : (
            <i className="bi bi-search" aria-hidden="true" />
          )}
        </button>
      </form>
      {error && (
        <div className="text-danger small mt-2" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

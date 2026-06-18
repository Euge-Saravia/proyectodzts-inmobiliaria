#!/usr/bin/env node
import { createClient } from "@sanity/client";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));

for (const file of [".env.local", ".env"]) {
  try {
    const raw = await readFile(resolve(scriptDir, "..", file), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
      if (!match || line.trim().startsWith("#")) continue;
      const [, key, value] = match;
      if (!(key in process.env)) {
        process.env[key] = value.replace(/^["'](.*)["']$/, "$1");
      }
    }
  } catch {
    // file missing is fine
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-02-19";

const outPath = resolve(scriptDir, "../public/llms.txt");

if (!projectId || !dataset) {
  console.warn(
    "[llms.txt] Skipping generation: NEXT_PUBLIC_SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_DATASET is missing.",
  );
  process.exit(0);
}

if (!baseUrl) {
  console.warn(
    "[llms.txt] Skipping generation: NEXT_PUBLIC_SITE_URL is missing.",
  );
  process.exit(0);
}

const client = createClient({ projectId, dataset, apiVersion, useCdn: true });

const properties = await client.fetch(
  `*[_type == "property" && defined(slug.current) && !(status in ["vendido", "alquilado"])] | order(title asc) {
    "slug": slug.current,
    title
  }`,
);

const propertyLinks = properties
  .map((p) => `- [${p.title}](${baseUrl}/propiedades/${p.slug})`)
  .join("\n");

const content = `# DZTS Inmobiliaria

> Catálogo de propiedades inmobiliarias en venta y alquiler en Argentina. Casas, departamentos, terrenos y más.

DZTS Inmobiliaria es un sitio web de bienes raíces que ofrece propiedades en venta y alquiler. El sitio incluye búsqueda con filtros por tipo de operación, tipo de propiedad, localidad y cantidad de dormitorios.

## Páginas principales

- [Inicio](${baseUrl}/): Página principal con buscador y propiedades destacadas
- [Propiedades](${baseUrl}/propiedades): Listado completo de propiedades con filtros

## Propiedades disponibles

${propertyLinks}
`;

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, content, "utf8");
console.log(`[llms.txt] Generated ${properties.length} property entries at ${outPath}`);

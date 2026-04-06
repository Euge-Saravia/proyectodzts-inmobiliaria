import { client } from "@/sanity/lib/client";

interface PropertySlug {
  slug: string;
  title: string;
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!baseUrl) {
    return new Response("Missing NEXT_PUBLIC_SITE_URL", { status: 500 });
  }

  const properties = await client.fetch<PropertySlug[]>(`
    *[_type == "property" && defined(slug.current) && !(status in ["vendido", "alquilado"])] | order(title asc) {
      "slug": slug.current,
      title
    }
  `);

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

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

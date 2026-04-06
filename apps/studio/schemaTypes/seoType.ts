import { defineField, defineType } from "sanity";

export const seoType = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta título",
      type: "string",
      description: "Título para buscadores. Recomendado: máx. 60 caracteres.",
      validation: (rule) =>
        rule.max(60).warning("El título no debería superar los 60 caracteres"),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta descripción",
      type: "text",
      rows: 3,
      description: "Descripción para buscadores. Recomendado: máx. 160 caracteres.",
      validation: (rule) =>
        rule
          .max(160)
          .warning("La descripción no debería superar los 160 caracteres"),
    }),
    defineField({
      name: "ogImage",
      title: "Imagen para redes sociales",
      type: "image",
      description: "Tamaño recomendado: 1200×630 px",
      options: { hotspot: true },
    }),
    defineField({
      name: "noIndex",
      title: "Ocultar de buscadores",
      type: "boolean",
      description: "Si se activa, los buscadores no indexarán esta página.",
      initialValue: false,
    }),
  ],
});

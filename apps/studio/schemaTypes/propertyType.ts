import { defineField, defineType } from "sanity";
import { HomeIcon } from "@sanity/icons";

export const propertyType = defineType({
  name: "property",
  title: "Propiedades",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "content", title: "Contenido", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtítulo",
      type: "string",
    }),
    defineField({
      name: "publishedAt",
      title: "Fecha de publicación",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "images",
      title: "Imágenes",
      type: "array",
      of: [{ type: "image" }],
    }),
    defineField({
      name: "operationType",
      title: "Tipo de operación",
      type: "string",
      options: {
        list: [
          { title: "Venta", value: "venta" },
          { title: "Alquiler", value: "alquiler" },
        ],
      },
    }),
    defineField({
      name: "status",
      title: "Estado",
      type: "string",
      options: {
        list: [
          { title: "Disponible", value: "disponible" },
          { title: "Vendido", value: "vendido" },
          { title: "Alquilado", value: "alquilado" },
        ],
        layout: "radio",
      },
      initialValue: "disponible",
    }),
    defineField({
      name: "propertyType",
      title: "Tipo de propiedad",
      type: "reference",
      to: [{ type: "propertyTypeCategory" }],
    }),
    defineField({
      name: "address",
      title: "Dirección",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "neighborhood",
      title: "Barrio",
      type: "string",
    }),
    defineField({
      name: "city",
      title: "Ciudad",
      type: "reference",
      to: [{ type: "city" }],
    }),
    defineField({
      name: "rooms",
      title: "Habitaciones",
      type: "number",
    }),
    defineField({
      name: "bathrooms",
      title: "Baños",
      type: "number",
    }),
    defineField({
      name: "garages",
      title: "Cocheras",
      type: "number",
    }),
    defineField({
      name: "size",
      title: "Superficie (m²)",
      type: "number",
    }),
    defineField({
      name: "price",
      title: "Precio",
      type: "number",
    }),
    defineField({
      name: "currency",
      title: "Moneda",
      type: "string",
      options: {
        list: [
          { title: "USD ($)", value: "USD" },
          { title: "ARS ($)", value: "ARS" },
        ],
      },
      initialValue: "USD",
    }),
    defineField({
      name: "featured",
      title: "Destacada",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
});

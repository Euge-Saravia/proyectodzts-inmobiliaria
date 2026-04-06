import { defineField, defineType } from "sanity";
import { DocumentsIcon } from "@sanity/icons";

export const propiedadesPageType = defineType({
  name: "propiedadesPage",
  title: "Página de Propiedades",
  type: "document",
  icon: DocumentsIcon,
  groups: [
    { name: "content", title: "Contenido", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "heading",
      title: "Título",
      type: "string",
      group: "content",
      initialValue: "Propiedades",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
      group: "seo",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Página de Propiedades" };
    },
  },
});

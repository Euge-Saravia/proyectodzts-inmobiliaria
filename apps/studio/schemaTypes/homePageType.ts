import { defineType, defineField, defineArrayMember } from "sanity";
import { HomeIcon, PanelRightIcon } from "@sanity/icons";

export const homePageType = defineType({
  name: "homePage",
  title: "Página de Inicio",
  type: "document",
  icon: HomeIcon,
  groups: [
    { name: "hero", title: "Hero", default: true },
    { name: "content", title: "Contenido" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "heroHeading",
      title: "Título",
      type: "string",
      group: "hero",
      initialValue: "Encontrá la propiedad a medida",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroImage",
      title: "Imagen Hero",
      type: "image",
      group: "hero",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroLogo",
      title: "Logo Hero",
      type: "image",
      group: "hero",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Texto alternativo",
          type: "string",
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featuredPropertiesHeading",
      title: "Título Propiedades Destacadas",
      type: "string",
      group: "content",
      initialValue: "Propiedades Destacadas",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sections",
      group: "content",
      title: "Secciones",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "section",
          title: "Sección",
          icon: PanelRightIcon,
          fields: [
            defineField({
              name: "title",
              title: "Título interno",
              type: "string",
              description: "Etiqueta para identificar la sección en el Studio",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "anchorId",
              title: "Anchor ID",
              type: "string",
              description: "Anchor para enlaces internos (ej: servicios, nosotros)",
              validation: (rule) =>
                rule.regex(/^[a-z0-9-]+$/).warning(
                  "Use lowercase letters, numbers, and dashes only.",
                ),
            }),
            defineField({
              name: "content",
              title: "Contenido",
              type: "array",
              of: [defineArrayMember({ type: "block" })],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "images",
              title: "Imágenes",
              type: "array",
              of: [
                defineArrayMember({
                  type: "image",
                  options: { hotspot: true },
                  fields: [
                    defineField({
                      name: "alt",
                      title: "Texto alternativo",
                      type: "string",
                    }),
                  ],
                }),
              ],
              validation: (rule) => rule.required().min(1),
            }),
            defineField({
              name: "imagePosition",
              title: "Posición de imagen",
              type: "string",
              options: {
                list: [
                  { title: "Izquierda", value: "left" },
                  { title: "Derecha", value: "right" },
                ],
                layout: "radio",
              },
              initialValue: "right",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "backgroundColor",
              title: "Color de fondo",
              type: "string",
              options: {
                list: [
                  { title: "Celeste", value: "primary" },
                  { title: "Oscuro", value: "dark" },
                  { title: "Claro", value: "light" },
                  { title: "Blanco", value: "white" },
                ],
                layout: "radio",
              },
              initialValue: "white",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "title" },
            prepare({ title }) {
              return { title, media: PanelRightIcon };
            },
          },
        }),
      ],
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
      return { title: "Página de Inicio" };
    },
  },
});

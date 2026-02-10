import { defineType, defineField, defineArrayMember } from "sanity";
import { CogIcon, LinkIcon, MenuIcon } from "@sanity/icons";

export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Configuración del Sitio",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "branding", title: "Logo y Marca" },
    { name: "navigation", title: "Navegación" },
    { name: "contact", title: "Contacto" },
    { name: "footer", title: "Pie de Página" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // Logo y Marca
    defineField({
      name: "siteName",
      title: "Nombre del Sitio",
      type: "string",
      group: "branding",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: "branding",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Texto alternativo",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      type: "image",
      group: "branding",
    }),

    // Navegación
    defineField({
      name: "mainNavigation",
      title: "Navegación Principal",
      type: "array",
      group: "navigation",
      icon: MenuIcon,
      of: [
        defineArrayMember({
          type: "object",
          name: "navItem",
          title: "Item de Navegación",
          icon: MenuIcon,
          fields: [
            defineField({
              name: "label",
              title: "Etiqueta",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "linkType",
              title: "Tipo de enlace",
              type: "string",
              options: {
                list: [
                  { title: "Interno", value: "internal" },
                  { title: "Externo", value: "external" },
                  { title: "Acción (modal)", value: "action" },
                ],
                layout: "radio",
              },
              initialValue: "internal",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "internalPath",
              title: "Ruta interna",
              type: "string",
              description: "Ej: /propiedades, /nosotros",
              hidden: ({ parent }) => parent?.linkType !== "internal",
            }),
            defineField({
              name: "externalUrl",
              title: "URL externa",
              type: "url",
              hidden: ({ parent }) => parent?.linkType !== "external",
            }),
            defineField({
              name: "actionId",
              title: "ID de acción",
              type: "string",
              description: "Identificador para modales (ej: contact)",
              hidden: ({ parent }) => parent?.linkType !== "action",
            }),
          ],
          preview: {
            select: { title: "label", linkType: "linkType" },
            prepare({ title, linkType }) {
              const typeLabel =
                linkType === "internal"
                  ? "Interno"
                  : linkType === "external"
                    ? "Externo"
                    : "Acción";
              return { title, subtitle: typeLabel, media: LinkIcon };
            },
          },
        }),
      ],
    }),

    // Contacto
    defineField({
      name: "phone",
      title: "Teléfono",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      group: "contact",
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: "address",
      title: "Dirección",
      type: "string",
      group: "contact",
    }),
    defineField({
      name: "whatsappNumber",
      title: "WhatsApp",
      type: "string",
      group: "contact",
      description: "Número con código de país (ej: 5491155667788)",
    }),
    defineField({
      name: "whatsappMessage",
      title: "Mensaje WhatsApp",
      type: "text",
      group: "contact",
      rows: 3,
      description: "Mensaje que se pre-carga al abrir WhatsApp desde el botón flotante.",
    }),
    defineField({
      name: "socialLinks",
      title: "Redes Sociales",
      type: "array",
      group: "contact",
      of: [
        defineArrayMember({
          type: "object",
          name: "socialLink",
          fields: [
            defineField({
              name: "platform",
              title: "Plataforma",
              type: "string",
              options: {
                list: [
                  { title: "Facebook", value: "facebook" },
                  { title: "Instagram", value: "instagram" },
                  { title: "Twitter / X", value: "twitter" },
                  { title: "LinkedIn", value: "linkedin" },
                  { title: "YouTube", value: "youtube" },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { platform: "platform", url: "url" },
            prepare({ platform, url }) {
              return { title: platform, subtitle: url };
            },
          },
        }),
      ],
    }),

    // Pie de Página
    defineField({
      name: "footerLinks",
      title: "Links Footer",
      type: "array",
      group: "footer",
      of: [
        defineArrayMember({
          type: "object",
          name: "footerLink",
          fields: [
            defineField({
              name: "label",
              title: "Título",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "url" },
          },
        }),
      ],
    }),
    defineField({
      name: "certificationLogos",
      title: "Logos",
      type: "array",
      group: "footer",
      of: [
        defineArrayMember({
          type: "object",
          name: "certificationLogo",
          fields: [
            defineField({
              name: "image",
              title: "Imagen",
              type: "image",
              options: { hotspot: true },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "title",
              title: "Título",
              type: "string",
            }),
            defineField({
              name: "url",
              title: "URL (opcional)",
              type: "url",
            }),
          ],
          preview: {
            select: { title: "title", media: "image" },
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
      return { title: "Configuración del Sitio" };
    },
  },
});

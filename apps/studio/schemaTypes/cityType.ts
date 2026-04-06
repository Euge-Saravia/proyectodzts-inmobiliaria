import { defineField, defineType } from "sanity";
import { MarkerIcon } from "@sanity/icons";

export const cityType = defineType({
    name: "city",
    title: "Ciudades",
    type: "document",
    icon: MarkerIcon,
    fields: [
        defineField({
            name: "name",
            title: "Nombre",
            type: "string",
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: "slug",
            title: "Slug",
            type: "slug",
            options: { source: "name" },
            validation: (rule) => rule.required(),
        }),
    ],
});

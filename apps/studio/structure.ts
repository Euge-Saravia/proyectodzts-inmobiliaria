import type { StructureResolver } from "sanity/structure";
import { CogIcon, DocumentsIcon, HomeIcon } from "@sanity/icons";

const SINGLETONS = ["siteSettings", "homePage", "propiedadesPage"];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Contenido")
    .items([
      S.listItem()
        .title("Página de Inicio")
        .icon(HomeIcon)
        .child(
          S.document()
            .schemaType("homePage")
            .documentId("homePage")
            .title("Página de Inicio")
        ),

      S.listItem()
        .title("Página de Propiedades")
        .icon(DocumentsIcon)
        .child(
          S.document()
            .schemaType("propiedadesPage")
            .documentId("propiedadesPage")
            .title("Página de Propiedades")
        ),

      S.listItem()
        .title("Configuración del Sitio")
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings")
            .title("Configuración del Sitio")
        ),

      S.divider(),

      ...S.documentTypeListItems().filter(
        (listItem) => !SINGLETONS.includes(listItem.getId() as string)
      ),
    ]);

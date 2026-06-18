# Guía: Google Analytics y SEO (paso a paso, no técnico)

Esta guía explica cómo activar **Google Analytics** en el sitio y cómo empezar
con **SEO** usando **Google Search Console**. No requiere tocar código: el sitio
ya está preparado, solo hay que crear las claves en Google y cargarlas en GitHub.

- **Sitio:** https://www.dzts.com.ar
- **Repositorio:** https://github.com/pablocolaiacovo/dzts-website

> **Nota técnica (para quien mantiene el repo):** Google Analytics ya está
> integrado en `apps/frontend/src/app/layout.tsx` mediante
> `@next/third-parties/google`. Solo se renderiza si existe la variable
> `NEXT_PUBLIC_GA_MEASUREMENT_ID`, que el deploy lee del entorno `production`
> de GitHub Actions (`.github/workflows/deploy.yml`). No hay cambios de código
> pendientes.

---

## Parte 1 — Crear la propiedad de Google Analytics y obtener la clave

1. Entrá a **https://analytics.google.com** con la cuenta de Google de la inmobiliaria.
2. Abajo a la izquierda, clic en el engranaje ⚙️ **Administrar** (Admin).
3. Clic en **Crear** → **Propiedad** (Property).
   - Nombre: `DZTS Inmobiliaria`.
   - Zona horaria: Argentina. Moneda: ARS. Clic en **Siguiente** y completá rubro (inmobiliaria) y tamaño.
4. Cuando pregunte la plataforma, elegí **Web**.
   - URL del sitio: `www.dzts.com.ar`
   - Nombre del flujo: `Sitio DZTS`. Clic en **Crear flujo**.
5. Vas a ver un **"ID de medición"** (Measurement ID) con el formato **`G-XXXXXXXXXX`**.
   **Ese es el dato que necesitás.** Copialo.

> No hace falta copiar el bloque de código que ofrece Google ("etiqueta global /
> gtag"). El sitio ya lo tiene incorporado; solo necesita ese `G-XXXXXXXXXX`.

---

## Parte 2 — Configurar la clave en el sitio (en GitHub)

1. Entrá a **https://github.com/pablocolaiacovo/dzts-website**
2. Arriba, pestaña **Settings** (Configuración).
3. Menú de la izquierda: **Environments** → clic en **production**.
4. Bajá hasta **Environment variables** → botón **Add variable**.
5. Completá **exactamente**:
   - **Name:** `NEXT_PUBLIC_GA_MEASUREMENT_ID` (idéntico, respetando mayúsculas y guiones bajos)
   - **Value:** el `G-XXXXXXXXXX` que copiaste.
6. Clic en **Add variable**.

---

## Parte 3 — Publicar el cambio (redeploy)

La clave toma efecto recién cuando el sitio se vuelve a compilar:

- **Opción A (la más simple):** pestaña **Actions** → elegí **Deploy** a la izquierda →
  botón **Run workflow** → **Run workflow**. En unos minutos queda actualizado.
- **Opción B:** publicá cualquier cambio en el Studio de Sanity (dispara el redeploy automático).

---

## Parte 4 — Verificar que Analytics funciona

1. Abrí **www.dzts.com.ar** en el teléfono o navegador.
2. En Google Analytics: **Informes → Tiempo real** (Realtime). Deberías aparecer
   como **1 usuario activo** en unos segundos. ✅

---

## Parte 5 — SEO con Google Search Console

**Importante:** Google Analytics mide *cuánta gente entra y qué hace adentro* del
sitio, pero **no** dice qué busca la gente en Google ni cómo aparecés en los
resultados. Para SEO la herramienta correcta es **Google Search Console** (gratis
y distinta de Analytics): muestra qué términos buscó la gente para encontrarte, en
qué puesto aparecés, cuántos clics recibís y si Google tiene problemas para
indexar páginas.

### Configurar Search Console

1. Entrá a **https://search.google.com/search-console** con la misma cuenta de Google.
2. Clic en **Agregar propiedad**. Te da dos opciones; elegí la de la derecha:
   **Prefijo de la URL** (URL prefix).
3. Escribí la dirección completa: `https://www.dzts.com.ar` y clic en **Continuar**.
4. **Verificar que el sitio es tuyo.** La forma más fácil para este sitio es
   **"Etiqueta HTML"** o **"Google Analytics"**:
   - Si ya hiciste las Partes 1–4, elegí el método **Google Analytics** y se
     verifica solo (usa la misma cuenta).
   - Si no, usá **Etiqueta HTML**: Google te da un código `<meta ...>`. Copialo y
     pasámelo: lo agrego al sitio en un cambio chico y se verifica. *(Este paso sí
     requiere ayuda técnica.)*
5. Una vez verificado, entrá a **Sitemaps** (menú izquierdo) y agregá el sitemap:
   escribí `sitemap.xml` y clic en **Enviar**. (El sitio ya genera el sitemap
   automáticamente en `https://www.dzts.com.ar/sitemap.xml`.)

### Qué mirar para mejorar el SEO (después de unos días con datos)

- **Rendimiento → Consultas:** los términos que la gente busca y por los que
  aparecés. Si ves búsquedas relevantes donde estás en posición baja (puesto 5–20),
  esas son oportunidades: mejorá títulos, descripciones y contenido de esas páginas.
- **Páginas:** qué páginas reciben más clics. Reforzá las que funcionan y revisá
  las que casi no aparecen.
- **Indexación → Páginas:** confirma que Google indexó las propiedades. Si hay
  páginas "no indexadas", ahí hay algo a corregir.

> Search Console tarda unos días en juntar datos. No esperes ver mucho el primer día.

---

## Resumen rápido

| Herramienta | Para qué sirve | Dónde se configura la clave |
|-------------|----------------|------------------------------|
| Google Analytics | Cuánta gente entra y qué hace en el sitio | Variable `NEXT_PUBLIC_GA_MEASUREMENT_ID` en GitHub (entorno `production`) |
| Google Search Console | Qué busca la gente en Google y cómo aparecés (SEO) | Verificación del sitio + envío del sitemap |

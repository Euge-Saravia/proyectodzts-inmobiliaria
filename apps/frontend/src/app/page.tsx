import type { Metadata } from "next";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { defineQuery } from "next-sanity";
import type { SanityImageSource } from "@sanity/image-url";
import { sanityFetch } from "@/sanity/lib/live";
import { urlFor } from "@/sanity/lib/image";
import {
  getCachedCities,
  getCachedPropertyTypes,
  getCachedRoomCounts,
} from "@/sanity/queries/properties";
import {
  getCachedHomeSections,
  getCachedHomeContent,
} from "@/sanity/queries/homePage";
import { getCachedHomeSeo, getCachedSiteSeo } from "@/sanity/queries/seo";
import {
  getCachedOrganization,
  buildOrganizationJsonLd,
} from "@/sanity/queries/siteSettings";
import { resolveMetadata } from "@/lib/seo";
import FeaturedProperties from "@/components/FeaturedProperties";
import SearchProperties from "@/components/SearchProperties";
import TextImageSection from "@/components/TextImageSection";
import MapSection from "@/components/MapSection";
import { buildFilterOptions } from "@/lib/filters";

export async function generateMetadata(): Promise<Metadata> {
  const [pageSeo, siteSeo] = await Promise.all([
    getCachedHomeSeo(),
    getCachedSiteSeo(),
  ]);

  // For the home page, don't set a title - use the layout's default "DZTS Inmobiliaria".
  // The title.template from layout.tsx only applies to child route segments,
  // not to the root page.tsx which is at the same level as layout.tsx.
  const metadata = resolveMetadata(pageSeo, siteSeo, { canonicalUrl: "/" });
  delete metadata.title;
  if (metadata.openGraph) {
    delete metadata.openGraph.title;
  }
  return metadata;
}

const MAP_ADDRESS_QUERY = defineQuery(`
  *[_type == "siteSettings"][0].address
`);

async function getCachedMapAddress() {
  "use cache";
  cacheLife("hours");
  cacheTag("siteSettings");
  const { data } = await sanityFetch({ query: MAP_ADDRESS_QUERY });
  return data;
}

async function HomeSections() {
  const sections = await getCachedHomeSections();
  return (
    <>
      {sections?.map((section, index) => (
        <TextImageSection
          key={section?._key ?? index}
          index={index}
          {...section}
        />
      ))}
    </>
  );
}

async function MapSectionWrapper() {
  const address = await getCachedMapAddress();
  return <MapSection address={address} title="Ubicación de la oficina" />;
}

function FeaturedPropertiesFallback({ heading }: { heading?: string | null }) {
  return (
    <div className="container py-4">
      <h2 className="text-center mb-5 fw-bold">
        {heading || "Propiedades destacadas"}
      </h2>
      <div className="row justify-content-center g-4">
        {[0, 1, 2].map((index) => (
          <div
            key={`featured-fallback-${index}`}
            className="col-12 col-md-6 col-lg-4 d-flex justify-content-center"
          >
            <div className="card w-100 placeholder-glow">
              <div
                className="card-img-top bg-light"
                style={{ height: "220px" }}
              ></div>
              <div className="card-body">
                <span className="placeholder col-7"></span>
                <span className="placeholder col-10"></span>
                <span className="placeholder col-4"></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextSectionsFallback() {
  return (
    <div className="container py-5">
      <div className="row g-4">
        {[0, 1].map((index) => (
          <div key={`section-fallback-${index}`} className="col-12">
            <div className="placeholder-glow">
              <div className="placeholder col-6 mb-3"></div>
              <div className="placeholder col-11 mb-2"></div>
              <div className="placeholder col-10 mb-2"></div>
              <div className="placeholder col-8"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MapSectionFallback() {
  return (
    <div className="w-100">
      <div
        className="bg-light"
        style={{ width: "100%", height: "450px" }}
      ></div>
    </div>
  );
}

export default async function Home() {
  const [cities, propertyTypes, roomCounts, homeContent, organization] =
    await Promise.all([
      getCachedCities(),
      getCachedPropertyTypes(),
      getCachedRoomCounts(),
      getCachedHomeContent(),
      getCachedOrganization(),
    ]);

  const filterOptions = buildFilterOptions(cities, propertyTypes, roomCounts);
  const heroImageUrl = urlFor(homeContent!.heroImage! as SanityImageSource)
    .width(1920)
    .auto("format")
    .quality(80)
    .url();
  const heroLogoUrl = urlFor(homeContent!.heroLogo! as SanityImageSource)
    .width(400)
    .auto("format")
    .quality(80)
    .url();
  const organizationJsonLd = organization
    ? {
        "@context": "https://schema.org",
        ...buildOrganizationJsonLd(organization),
      }
    : null;

  return (
    <>
      {organizationJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      )}
      <SearchProperties
        filterOptions={filterOptions}
        heroHeading={homeContent!.heroHeading!}
        heroImageUrl={heroImageUrl}
        heroImageLqip={homeContent!.heroImage!.asset!.metadata?.lqip}
        heroLogoUrl={heroLogoUrl}
        heroLogoAlt={homeContent!.heroLogo!.alt}
      />
      <Suspense
        fallback={<FeaturedPropertiesFallback heading={homeContent?.featuredPropertiesHeading} />}
      >
        <FeaturedProperties heading={homeContent!.featuredPropertiesHeading!} />
      </Suspense>
      <Suspense fallback={<TextSectionsFallback />}>
        <HomeSections />
      </Suspense>
      <Suspense fallback={<MapSectionFallback />}>
        <MapSectionWrapper />
      </Suspense>
    </>
  );
}

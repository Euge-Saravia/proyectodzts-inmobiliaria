import type { Metadata } from "next";
import type { SeoFields, ContentDefaults } from "@/types/seo";

export function resolveMetadata(
  pageSeo: SeoFields | null | undefined,
  siteSeo: SeoFields | null | undefined,
  contentDefaults?: ContentDefaults | null,
): Metadata {
  const title =
    pageSeo?.metaTitle ||
    contentDefaults?.title ||
    siteSeo?.metaTitle ||
    undefined;

  const description =
    pageSeo?.metaDescription ||
    contentDefaults?.description ||
    siteSeo?.metaDescription ||
    undefined;

  const ogImageUrl =
    pageSeo?.ogImage?.asset?.url ||
    contentDefaults?.ogImageUrl ||
    siteSeo?.ogImage?.asset?.url ||
    undefined;

  const canonicalUrl = contentDefaults?.canonicalUrl || undefined;

  const metadata: Metadata = {};

  if (title) metadata.title = title;
  if (description) metadata.description = description;

  if (title || description || ogImageUrl) {
    metadata.openGraph = {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {}),
    };
  }

  if (pageSeo?.noIndex) {
    metadata.robots = { index: false, follow: false };
  }

  if (canonicalUrl) {
    metadata.alternates = { canonical: canonicalUrl };
  }

  return metadata;
}

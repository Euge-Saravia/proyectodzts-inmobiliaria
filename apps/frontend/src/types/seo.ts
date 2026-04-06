export interface SeoFields {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: { asset?: { url?: string | null } | null } | null;
  noIndex?: boolean | null;
}

export interface ContentDefaults {
  title?: string | null;
  description?: string | null;
  ogImageUrl?: string | null;
  canonicalUrl?: string | null;
}

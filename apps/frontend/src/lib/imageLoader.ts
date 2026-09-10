interface ImageLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

const SANITY_CDN_HOST = "cdn.sanity.io";

export default function sanityImageLoader({
  src,
  width,
  quality,
}: ImageLoaderParams): string {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }

  if (url.hostname !== SANITY_CDN_HOST) {
    return src;
  }

  const params = url.searchParams;
  const originalWidth = params.has("w") ? Number(params.get("w")) : null;
  const originalHeight = params.has("h") ? Number(params.get("h")) : null;

  const targetWidth =
    originalWidth && Number.isFinite(originalWidth)
      ? Math.min(width, originalWidth)
      : width;

  params.set("w", String(targetWidth));

  if (originalWidth && originalHeight) {
    const scaledHeight = Math.round(
      (originalHeight * targetWidth) / originalWidth,
    );
    params.set("h", String(scaledHeight));
  }

  if (!params.has("q") && quality) {
    params.set("q", String(quality));
  }

  if (!params.has("auto")) {
    params.set("auto", "format");
  }

  return url.toString();
}

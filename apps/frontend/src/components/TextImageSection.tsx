import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import type { SanityImageSource } from "@sanity/image-url";
import type { HOME_SECTIONS_QUERY_RESULT } from "@/sanity/types";
import CircularCarousel from "./CircularCarousel";
import "./TextImageSection.css";

type Section = NonNullable<HOME_SECTIONS_QUERY_RESULT>[number];

interface TextImageSectionProps extends Section {
  index: number;
}

export default function TextImageSection({
  _key,
  anchorId,
  content,
  images,
  imagePosition,
  backgroundColor,
  index,
}: TextImageSectionProps) {
  if (!content) return null;
  const validImages = images?.filter((img) => img.asset?.url) ?? [];
  const primaryImage = validImages[0];
  const primaryAsset = primaryImage?.asset ?? null;
  const imageUrl = primaryAsset?.url
    ? primaryAsset.url
    : primaryAsset
      ? urlFor(primaryAsset as SanityImageSource)
          .width(600)
          .height(600)
          .quality(80)
          .auto("format")
          .url()
      : null;
  const bg = backgroundColor ?? "white";
  const reverseRow = imagePosition === "right";
  const hasCarousel = validImages.length > 1;
  const sectionId = anchorId || undefined;
  const carouselId = _key
    ? `section-carousel-${_key}`
    : `section-carousel-${index}`;

  return (
    <div className={`section-bg-${bg}`} id={sectionId}>
      <div className="container py-5">
        <div
          className={`row align-items-center flex-column flex-md-row${reverseRow ? " flex-md-row-reverse" : ""}`}
        >
          <div className="col-12 col-md-6 d-flex flex-column align-items-center mb-5 mb-md-0">
            <div
              className={`section-circle-image rounded-circle${hasCarousel ? "" : " section-circle-image--single"}`}
            >
              {validImages.length > 1 ? (
                <CircularCarousel images={validImages} id={carouselId} />
              ) : validImages.length === 1 && imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={primaryImage?.alt || "Imagen de sección"}
                  fill
                  sizes="300px"
                  className="object-fit-cover"
                  loading="lazy"
                  {...(primaryImage?.asset?.metadata?.lqip
                    ? {
                        placeholder: "blur" as const,
                        blurDataURL: primaryImage.asset.metadata.lqip,
                      }
                    : {})}
                />
              ) : null}
            </div>
          </div>
          <div className="col-12 col-md-6 text-center text-md-start">
            <PortableText value={content} />
          </div>
        </div>
      </div>
    </div>
  );
}

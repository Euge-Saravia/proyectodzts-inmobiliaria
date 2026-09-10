import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import type { SanityImageSource } from "@sanity/image-url";
import type { HOME_SECTIONS_QUERY_RESULT } from "@/sanity/types";
import SectionCarousel from "./SectionCarousel";
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
  const imageUrl = primaryAsset
    ? urlFor(primaryAsset as SanityImageSource)
        .width(1200)
        .quality(80)
        .auto("format")
        .url()
    : null;
  const bg = backgroundColor ?? "white";
  const reverseRow = imagePosition === "right";
  const hasImages = validImages.length > 0;
  const hasCarousel = validImages.length > 1;
  const sectionId = anchorId || undefined;
  const carouselId = _key
    ? `section-carousel-${_key}`
    : `section-carousel-${index}`;

  return (
    <section className={`section-block section-bg-${bg}`} id={sectionId}>
      <div className="container py-5">
        <div
          className={`row g-4 align-items-center${reverseRow ? " flex-row-reverse" : ""}`}
        >
          {hasImages && (
            <div className="col-12 col-lg-6">
              {hasCarousel ? (
                <SectionCarousel images={validImages} id={carouselId} />
              ) : imageUrl ? (
                <div className="section-image-wrap">
                  <Image
                    src={imageUrl}
                    alt={primaryImage?.alt || "Imagen de sección"}
                    fill
                    sizes="(max-width: 991px) 100vw, 50vw"
                    className="object-fit-cover"
                    loading="lazy"
                    {...(primaryImage?.asset?.metadata?.lqip
                      ? {
                          placeholder: "blur" as const,
                          blurDataURL: primaryImage.asset.metadata.lqip,
                        }
                      : {})}
                  />
                </div>
              ) : null}
            </div>
          )}
          <div
            className={`col-12 ${hasImages ? "col-lg-6" : "col-lg-8 mx-auto"}`}
          >
            <div className="section-content">
              <PortableText value={content} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

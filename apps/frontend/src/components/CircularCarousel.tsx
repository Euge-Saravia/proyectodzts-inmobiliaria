"use client";

import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { SanityImageSource } from "@sanity/image-url";
import type { HOME_SECTIONS_QUERY_RESULT } from "@/sanity/types";

type SectionImage = NonNullable<
  NonNullable<HOME_SECTIONS_QUERY_RESULT>[number]["images"]
>[number];

interface CircularCarouselProps {
  images: SectionImage[];
  id: string;
}

export default function CircularCarousel({ images, id }: CircularCarouselProps) {
  return (
    <div
      id={id}
      className="carousel slide carousel-fade pointer-event"
      data-bs-ride="carousel"
      data-bs-interval="4000"
    >
      <div className="carousel-inner h-100">
        {images.map((image, index) => {
          const asset = image.asset ?? null;
          const url = asset?.url
            ? asset.url
            : asset
              ? urlFor(asset as SanityImageSource)
                  .width(600)
                  .height(600)
                  .quality(80)
                  .auto("format")
                  .url()
              : "https://placehold.co/600x600/png";

          return (
            <div
              key={index}
              className={`carousel-item h-100 ${index === 0 ? "active" : ""}`}
            >
              <Image
                src={url}
                alt={image.alt || `Imagen ${index + 1}`}
                fill
                sizes="300px"
                className="object-fit-cover"
                loading="lazy"
                {...(image.asset?.metadata?.lqip
                  ? {
                      placeholder: "blur" as const,
                      blurDataURL: image.asset.metadata.lqip,
                    }
                  : {})}
              />
            </div>
          );
        })}
      </div>
      <button
        className="carousel-control-prev section-carousel-control"
        type="button"
        data-bs-target={`#${id}`}
        data-bs-slide="prev"
        aria-label="Imagen anterior"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true" />
      </button>
      <button
        className="carousel-control-next section-carousel-control"
        type="button"
        data-bs-target={`#${id}`}
        data-bs-slide="next"
        aria-label="Imagen siguiente"
      >
        <span className="carousel-control-next-icon" aria-hidden="true" />
      </button>
      <div className="carousel-indicators section-carousel-indicators">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            data-bs-target={`#${id}`}
            data-bs-slide-to={index}
            className={index === 0 ? "active" : ""}
            aria-current={index === 0 ? "true" : undefined}
            aria-label={`Imagen ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import { urlFor } from "@/sanity/lib/image";
import type { SanityImageSource } from "@sanity/image-url";
import Image from "next/image";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import "./ImageCarousel.css";

interface CarouselImage {
  asset?: SanityImageSource | null;
  lqip?: string | null;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  title: string;
}

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
  const prefersReducedMotion = useReducedMotion();

  if (images.length === 0) {
    return (
      <div className="mb-4">
        <div className="carousel-image-container position-relative">
          <Image
            src="https://placehold.co/1200x500/png"
            alt={`${title} - Sin imagen`}
            fill
            sizes="100vw"
            className="object-fit-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      id="propertyCarousel"
      className="carousel slide mb-4"
      {...(!prefersReducedMotion ? { 'data-bs-ride': 'carousel' } : {})}
    >
      <div className="carousel-indicators">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            data-bs-target="#propertyCarousel"
            data-bs-slide-to={index}
            className={index === 0 ? 'active' : ''}
            aria-current={index === 0 ? 'true' : undefined}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
      <div className="carousel-inner">
        {images.map((image, index) => {
          const url = image.asset ? urlFor(image.asset).width(1200).height(500).quality(80).auto('format').url()
            : 'https://placehold.co/1200x500/png';

          return (
            <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
              <div className="carousel-image-container position-relative">
                <Image
                  src={url}
                  alt={`${title} - Imagen ${index + 1}`}
                  fill
                  sizes="100vw"
                  className="object-fit-cover"
                  priority={index === 0}
                  {...(image.lqip ? { placeholder: "blur" as const, blurDataURL: image.lqip } : {})}
                />
              </div>
            </div>
          )
        })}
      </div>
      {images.length > 1 && (
        <>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#propertyCarousel"
            data-bs-slide="prev"
            style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.4), transparent)' }}
          >
            <span className="carousel-control-prev-icon" aria-hidden="true" />
            <span className="visually-hidden">Anterior</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#propertyCarousel"
            data-bs-slide="next"
            style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.4), transparent)' }}
          >
            <span className="carousel-control-next-icon" aria-hidden="true" />
            <span className="visually-hidden">Siguiente</span>
          </button>
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { urlFor } from "@/sanity/lib/image";
import type { SanityImageSource } from "@sanity/image-url";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import "./ImageLightbox.css";

interface LightboxImage {
  asset?: SanityImageSource | null;
  lqip?: string | null;
}

interface ImageLightboxProps {
  show: boolean;
  onHide: () => void;
  images: LightboxImage[];
  title: string;
  initialIndex: number;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export default function ImageLightbox({
  show,
  onHide,
  images,
  title,
  initialIndex,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageLoaded, setImageLoaded] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const transformRef = useRef<ReactZoomPanPinchRef>(null);
  const touchStartX = useRef(0);
  const currentScale = useRef(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    setImageLoaded(false);
  }, [currentIndex]);

  const goTo = useCallback(
    (index: number) => {
      transformRef.current?.resetTransform(0);
      currentScale.current = 1;
      setCurrentIndex(index);
    },
    []
  );

  const goPrev = useCallback(() => {
    if (images.length <= 1) return;
    goTo(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, images.length, goTo]);

  const goNext = useCallback(() => {
    if (images.length <= 1) return;
    goTo(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, images.length, goTo]);

  // Scroll lock
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  // Focus management + keyboard + focus trap
  useEffect(() => {
    if (!show) return;

    requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onHide();
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
        return;
      }

      if (e.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusable =
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, onHide, goPrev, goNext]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (currentScale.current > 1) return;

      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goNext();
        } else {
          goPrev();
        }
      }
    },
    [goNext, goPrev]
  );

  if (!show) return null;

  const currentImage = images[currentIndex];
  const imageUrl = currentImage?.asset
    ? urlFor(currentImage.asset).width(1920).auto("format").quality(85).url()
    : null;

  return createPortal(
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1055 }}
        aria-hidden="true"
      />
      <div
        className="modal fade show"
        style={{ display: "block", zIndex: 1056 }}
        tabIndex={-1}
        role="dialog"
        aria-label={`Galería de imágenes: ${title}`}
        aria-modal="true"
        onClick={onHide}
      >
        <div
          ref={dialogRef}
          className="modal-dialog modal-fullscreen"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content bg-black border-0">
            <button
              ref={closeButtonRef}
              type="button"
              className="btn-close btn-close-white position-absolute lightbox-close"
              onClick={onHide}
              aria-label="Cerrar galería"
            />

            <div
              className="modal-body d-flex align-items-center justify-content-center p-0 position-relative"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {imageUrl && (
                <div className="lightbox-image-container d-flex align-items-center justify-content-center">
                  <TransformWrapper
                    ref={transformRef}
                    doubleClick={{ mode: "toggle" }}
                    panning={{ velocityDisabled: true }}
                    smooth={!prefersReducedMotion}
                    onTransformed={(_ref, state) => {
                      currentScale.current = state.scale;
                    }}
                  >
                    <TransformComponent
                      wrapperStyle={{ width: "100%", height: "100%" }}
                      contentStyle={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt={`${title} - Imagen ${currentIndex + 1}`}
                        style={{
                          objectFit: "contain",
                          maxWidth: "100%",
                          maxHeight: "100vh",
                          ...(currentImage.lqip && !imageLoaded
                            ? {
                                backgroundImage: `url(${currentImage.lqip})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : {}),
                        }}
                        onLoad={() => setImageLoaded(true)}
                      />
                    </TransformComponent>
                  </TransformWrapper>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    className="carousel-control-prev lightbox-nav"
                    type="button"
                    onClick={goPrev}
                    style={{
                      left: 0,
                      background:
                        "linear-gradient(to right, rgba(0,0,0,0.4), transparent)",
                    }}
                  >
                    <span
                      className="carousel-control-prev-icon"
                      aria-hidden="true"
                    />
                    <span className="visually-hidden">Anterior</span>
                  </button>
                  <button
                    className="carousel-control-next lightbox-nav"
                    type="button"
                    onClick={goNext}
                    style={{
                      right: 0,
                      background:
                        "linear-gradient(to left, rgba(0,0,0,0.4), transparent)",
                    }}
                  >
                    <span
                      className="carousel-control-next-icon"
                      aria-hidden="true"
                    />
                    <span className="visually-hidden">Siguiente</span>
                  </button>
                </>
              )}

              {images.length > 1 && (
                <div className="lightbox-counter" aria-live="polite">
                  {currentIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

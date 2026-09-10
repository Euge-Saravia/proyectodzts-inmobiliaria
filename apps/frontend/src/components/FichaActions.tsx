"use client";

import { useState } from "react";
import { trackEvent, ANALYTICS_EVENT } from "@/lib/analytics";

type FichaActionsProps = {
  propertySlug?: string;
};

export default function FichaActions({ propertySlug }: FichaActionsProps) {
  const [copied, setCopied] = useState(false);

  function handlePrint() {
    trackEvent(ANALYTICS_EVENT.fichaPrint, { property_slug: propertySlug });
    window.print();
  }

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({ title: document.title, url });
      trackEvent(ANALYTICS_EVENT.share, {
        method: "native",
        location: "ficha",
        property_slug: propertySlug,
      });
      return;
    }

    await navigator.clipboard.writeText(url);
    trackEvent(ANALYTICS_EVENT.share, {
      method: "clipboard",
      location: "ficha",
      property_slug: propertySlug,
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="ficha-actions d-flex gap-2 mb-4">
      <button
        type="button"
        className="btn btn-dark px-4 py-2 fw-bold"
        onClick={handlePrint}
      >
        <i className="bi bi-printer me-2" aria-hidden="true" />
        Imprimir Ficha
      </button>
      <div className="position-relative">
        <button
          type="button"
          className="btn btn-outline-dark px-4 py-2 fw-bold"
          onClick={handleShare}
        >
          <i className="bi bi-share me-2" aria-hidden="true" />
          Compartir
        </button>
        {copied && (
          <output className="position-absolute top-100 start-50 translate-middle-x mt-2 badge bg-success text-white px-3 py-2">
            <i className="bi bi-check-circle me-1" aria-hidden="true" />
            Link copiado
          </output>
        )}
      </div>
    </div>
  );
}

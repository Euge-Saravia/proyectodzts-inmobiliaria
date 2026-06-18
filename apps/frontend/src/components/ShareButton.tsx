"use client";

import { useState } from "react";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      await navigator.share({ title: document.title, url });
      return;
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="position-relative flex-fill">
      <button
        type="button"
        className="btn btn-info text-white py-2 fw-bold w-100"
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
  );
}

"use client";

export default function ScrollToTopButton() {
  const getScrollBehavior = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

  return (
    <button
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: getScrollBehavior() })}
      aria-label="Volver arriba"
    >
      <i className="bi bi-chevron-up"></i>
    </button>
  );
}

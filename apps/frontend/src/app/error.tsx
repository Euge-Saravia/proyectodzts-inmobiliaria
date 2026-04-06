"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-4 fw-bold text-danger mb-3">
        Algo salió mal
      </h1>
      <p className="fs-5 text-muted mb-4">
        Ocurrió un error inesperado. Podés intentar nuevamente.
      </p>
      <button onClick={reset} className="btn btn-primary px-4">
        Intentar de nuevo
      </button>
    </div>
  );
}

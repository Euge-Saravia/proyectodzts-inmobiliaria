import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-1 fw-bold text-primary mb-3">404</h1>
      <p className="fs-4 text-muted mb-4">
        La página que buscás no existe o fue movida.
      </p>
      <div className="d-flex gap-3 justify-content-center">
        <Link href="/" className="btn btn-primary px-4">
          Ir al inicio
        </Link>
        <Link href="/propiedades" className="btn btn-outline-primary px-4">
          Ver propiedades
        </Link>
      </div>
    </div>
  );
}

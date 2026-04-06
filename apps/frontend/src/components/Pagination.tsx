import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export default function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "pagina") {
        params.set(key, value);
      }
    });
    params.set("pagina", page.toString());
    return `/propiedades?${params.toString()}`;
  };

  const getVisiblePages = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    pages.push(1);

    if (showEllipsisStart) {
      pages.push("ellipsis");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (showEllipsisEnd && !pages.includes(totalPages - 1)) {
      pages.push("ellipsis");
    }

    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <nav aria-label="Paginación de propiedades" className="mt-5">
      <ul className="pagination justify-content-center flex-wrap gap-1">
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          {currentPage > 1 ? (
            <Link
              href={createPageUrl(currentPage - 1)}
              className="page-link"
              aria-label="Página anterior"
            >
              <span aria-hidden="true">&laquo;</span>
            </Link>
          ) : (
            <span className="page-link" aria-label="Página anterior">
              <span aria-hidden="true">&laquo;</span>
            </span>
          )}
        </li>

        {visiblePages.map((page, index) =>
          page === "ellipsis" ? (
            <li key={`ellipsis-${index}`} className="page-item disabled">
              <span className="page-link">...</span>
            </li>
          ) : (
            <li
              key={page}
              className={`page-item ${currentPage === page ? "active" : ""}`}
            >
              <Link
                href={createPageUrl(page)}
                className="page-link"
                aria-label={`Página ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </Link>
            </li>
          )
        )}

        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          {currentPage < totalPages ? (
            <Link
              href={createPageUrl(currentPage + 1)}
              className="page-link"
              aria-label="Página siguiente"
            >
              <span aria-hidden="true">&raquo;</span>
            </Link>
          ) : (
            <span className="page-link" aria-label="Página siguiente">
              <span aria-hidden="true">&raquo;</span>
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}

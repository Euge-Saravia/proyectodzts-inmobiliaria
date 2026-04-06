import Link from "next/link";
import "./Breadcrumb.css";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isHome?: boolean;
}

interface Props {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const canRenderJsonLd = baseUrl && items.every((item) => item.href);
  const breadcrumbJsonLd = canRenderJsonLd
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.label,
          item: new URL(item.href!, baseUrl).toString(),
        })),
      }
    : null;

  return (
    <nav aria-label="Breadcrumb">
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd),
          }}
        />
      )}
      <ol className="breadcrumb mb-3">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (isLast || !item.href) {
            return (
              <li
                key={index}
                className="breadcrumb-item active"
                aria-current="page"
              >
                {item.label}
              </li>
            );
          }

          return (
            <li key={index} className="breadcrumb-item">
              <Link href={item.href}>
                {item.isHome ? (
                  <>
                    <i className="bi bi-house-door-fill" aria-hidden="true"></i>
                    <span className="visually-hidden">{item.label}</span>
                  </>
                ) : (
                  item.label
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

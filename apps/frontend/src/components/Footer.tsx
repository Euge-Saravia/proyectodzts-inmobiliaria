import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/sanity/types";
import ScrollToTopButton from "./ScrollToTopButton";
import "./Footer.css";

type SiteSettings = NonNullable<SITE_SETTINGS_QUERY_RESULT>;

type FooterProps = {
  logo?: SiteSettings["logo"];
  siteName?: SiteSettings["siteName"];
  footerLinks?: SiteSettings["footerLinks"];
  certificationLogos?: SiteSettings["certificationLogos"];
  socialLinks?: SiteSettings["socialLinks"];
  phone?: SiteSettings["phone"];
  email?: SiteSettings["email"];
  address?: SiteSettings["address"];
};

const platformIcons: Record<string, string> = {
  facebook: "bi-facebook",
  instagram: "bi-instagram",
  twitter: "bi-twitter-x",
  linkedin: "bi-linkedin",
  youtube: "bi-youtube",
};

export default function Footer({
  logo,
  siteName,
  certificationLogos,
  socialLinks,
  phone,
  email,
  address,
}: FooterProps) {
  const logoUrl = logo?.asset ? urlFor(logo).width(300).url() : null;
  const logoAlt = logo?.alt || siteName || "";
  const socialLinksWithUrl = socialLinks?.filter(
    (link): link is NonNullable<typeof link> & { url: string } =>
      Boolean(link?.url),
  );

  return (
    <footer className="site-footer">
      <div className="container">
        {(phone || email || address) && (
          <div className="footer-contact">
            {address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-item"
              >
                <i className="bi bi-geo-alt"></i>
                {address}
              </a>
            )}
            {phone && (
              <a href={`tel:${phone}`} className="footer-contact-item">
                <i className="bi bi-telephone"></i>
                {phone}
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="footer-contact-item">
                <i className="bi bi-envelope"></i>
                {email}
              </a>
            )}
          </div>
        )}
        <div className="footer-content">
          {/* Left: Logo */}
          <div className="footer-logo">
            {logoUrl && (
              <Image
                src={logoUrl}
                alt={logoAlt}
                width={150}
                height={60}
                style={{ width: "auto", height: "auto" }}
              />
            )}
          </div>

          {/* Center: Back to top + Copyright */}
          <div className="footer-center">
            <ScrollToTopButton />
            {socialLinksWithUrl && socialLinksWithUrl.length > 0 && (
              <div className="footer-social">
                {socialLinksWithUrl.map((link) => (
                  <a
                    key={link._key}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform || ""}
                  >
                    <i className={`bi ${platformIcons[link.platform || ""] || ""}`}></i>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right: Certification logos */}
          <div className="footer-certifications">
            {certificationLogos?.map((cert) => {
              const certImageUrl = cert.image?.asset
                ? urlFor(cert.image).width(100).url()
                : null;

              if (!certImageUrl) return null;

              const imageElement = (
                <Image
                  src={certImageUrl}
                  alt={cert.alt || ""}
                  width={50}
                  height={50}
                  className="cert-image"
                  loading="lazy"
                />
              );

              return cert.url ? (
                <a
                  key={cert._key}
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={cert.title || cert.alt || ""}
                  className="cert-link"
                >
                  {imageElement}
                </a>
              ) : (
                <div key={cert._key} title={cert.title || cert.alt || ""} className="cert-placeholder">
                  {imageElement}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}

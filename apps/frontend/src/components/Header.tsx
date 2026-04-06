"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { urlFor } from "@/sanity/lib/image";

const ContactModal = dynamic(() => import("./ContactModal"), { ssr: false });
import type { SITE_SETTINGS_QUERY_RESULT } from "@/sanity/types";
import "./Header.css";

type SiteSettings = NonNullable<SITE_SETTINGS_QUERY_RESULT>;
type NavItem = NonNullable<SiteSettings["mainNavigation"]>[number];

type HeaderProps = {
  logo?: SiteSettings["logo"];
  siteName?: SiteSettings["siteName"];
  navigation?: SiteSettings["mainNavigation"];
};

export default function Header({ logo, siteName, navigation }: HeaderProps) {
  const [showContactModal, setShowContactModal] = useState(false);
  const navCollapseRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const collapseNav = () => {
    const navElement = navCollapseRef.current;
    if (navElement?.classList.contains("show")) {
      navElement.classList.remove("show");
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    collapseNav();
    setShowContactModal(true);
  };

  const handleNavClick = () => {
    collapseNav();
  };

  const getScrollBehavior = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

  const handleAnchorClick = (e: React.MouseEvent, targetId: string) => {
    e.preventDefault();
    collapseNav();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
      window.history.replaceState(null, "", `/#${targetId}`);
    }
  };

  const renderNavItem = (item: NavItem) => {
    if (item.linkType === "action") {
      return (
        <a
          href={`#${item.actionId || ""}`}
          className="nav-link"
          onClick={handleContactClick}
          role="button"
          aria-haspopup="dialog"
        >
          {item.label}
        </a>
      );
    }

    if (item.linkType === "external" && item.externalUrl) {
      return (
        <a
          href={item.externalUrl}
          className="nav-link"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleNavClick}
        >
          {item.label}
        </a>
      );
    }

    const internalPath = item.internalPath || "/";
    const anchorId = internalPath.startsWith("/#")
      ? internalPath.split("#")[1]
      : null;

    if (anchorId && pathname === "/") {
      return (
        <a
          href={internalPath}
          className="nav-link"
          onClick={(e) => handleAnchorClick(e, anchorId)}
        >
          {item.label}
        </a>
      );
    }

    return (
      <Link href={internalPath} className="nav-link" onClick={handleNavClick}>
        {item.label}
      </Link>
    );
  };

  const logoUrl = logo?.asset ? urlFor(logo).width(300).url() : null;
  const logoAlt = logo?.alt || siteName || "";

  return (
    <>
      <header className="sticky-header">
        <nav
          className="navbar navbar-expand-lg navbar-dark"
          aria-label="Main navigation"
        >
          <div className="container">
            <Link href="/" className="navbar-brand header-logo" aria-label={`${siteName || ""} - Home`}>
              {logoUrl && (
                <Image
                  src={logoUrl}
                  alt={logoAlt}
                  width={150}
                  height={60}
                />
              )}
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#mainNavigation"
              aria-controls="mainNavigation"
              aria-expanded="false"
              aria-label="Toggle navigation menu"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="mainNavigation" ref={navCollapseRef}>
              <ul className="navbar-nav header-nav ms-auto mb-2 mb-lg-0 gap-lg-3">
                {navigation?.map((item) => (
                  <li key={item._key} className="nav-item">
                    {renderNavItem(item)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <ContactModal
        show={showContactModal}
        onHide={() => setShowContactModal(false)}
      />
    </>
  );
}

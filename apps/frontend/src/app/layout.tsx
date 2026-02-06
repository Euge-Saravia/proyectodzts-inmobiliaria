import type { Metadata } from "next";
import { Suspense } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import BootstrapClient from "@/components/BootstrapClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { sanityFetch } from "@/sanity/lib/live";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries/siteSettings";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/variables.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: {
    default: "DZTS Inmobiliaria",
    template: "%s | DZTS Inmobiliaria",
  },
  description:
    "Encontrá propiedades en venta y alquiler con DZTS Inmobiliaria. Casas, departamentos, terrenos y más.",
};

async function getSiteSettings() {
  "use cache";
  cacheLife("hours");
  cacheTag("siteSettings");
  const { data } = await sanityFetch({ query: SITE_SETTINGS_QUERY });
  return data;
}

async function SiteShell({ children }: { children: React.ReactNode }) {
  const siteSettings = await getSiteSettings();

  return (
    <>
      <Header
        logo={siteSettings?.logo}
        siteName={siteSettings?.siteName}
        navigation={siteSettings?.mainNavigation}
      />
      <main id="main-content">{children}</main>
      <Footer
        logo={siteSettings?.logo}
        siteName={siteSettings?.siteName}
        footerLinks={siteSettings?.footerLinks}
        certificationLogos={siteSettings?.certificationLogos}
        socialLinks={siteSettings?.socialLinks}
        phone={siteSettings?.phone}
        email={siteSettings?.email}
        address={siteSettings?.address}
      />
      {siteSettings?.whatsappNumber && (
        <WhatsAppButton
          whatsappNumber={siteSettings.whatsappNumber}
          whatsappMessage={siteSettings.whatsappMessage}
        />
      )}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://cdn.sanity.io" />
      </head>
      <body className={inter.className}>
        <a href="#main-content" className="visually-hidden-focusable position-absolute top-0 start-0 p-2 bg-primary text-white z-3">
          Saltar al contenido principal
        </a>
        <Suspense>
          <SiteShell>{children}</SiteShell>
        </Suspense>
        <BootstrapClient />
        <Analytics />
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}

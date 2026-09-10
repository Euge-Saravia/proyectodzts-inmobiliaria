import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import BootstrapClient from "@/components/BootstrapClient";
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
        {children}
        <BootstrapClient />
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}

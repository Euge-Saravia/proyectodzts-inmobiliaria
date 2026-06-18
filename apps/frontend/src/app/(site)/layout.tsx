import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { sanityFetch } from "@/sanity/lib/live";
import { SITE_SETTINGS_QUERY } from "@/sanity/queries/siteSettings";

async function getSiteSettings() {
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
        creditLine={siteSettings?.creditLine}
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

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <SiteShell>{children}</SiteShell>
    </Suspense>
  );
}

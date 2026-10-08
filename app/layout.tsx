import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { MAIN_ID, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/content/site";
import { PREVIEW_IMAGE, ROBOTS, SITE_JSON_LD } from "@/lib/metadata";
import { DISCLAIMER_BOOT_SCRIPT } from "@/lib/disclaimer";
import { SITE_CONTENT_ID } from "@/lib/useModalFocus";
import { DisclaimerProvider } from "@/components/layout/DisclaimerProvider";
import { DisclaimerGate } from "@/components/layout/DisclaimerGate";
import { HeaderHeightScript, SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import styles from "./layout.module.scss";
import "./globals.scss";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  robots: ROBOTS,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: "en",
    url: "/",
    images: [PREVIEW_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [PREVIEW_IMAGE],
  },
};

export const viewport: Viewport = {
  themeColor: "#12131f",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The boot script may add data-zm-entered before hydration.
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: DISCLAIMER_BOOT_SCRIPT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD).replace(/</g, "\\u003c") }}
        />
      </head>
      <body>
        <DisclaimerProvider>
          <div className={styles["shell"]}>
            <div id={SITE_CONTENT_ID}>
              {/* First stop for keyboard users: straight past the header to the page's content. */}
              <a href={`#${MAIN_ID}`} className="skip-link">
                Skip to content
              </a>
              <SiteHeader />
              <HeaderHeightScript />
              {children}
              <SiteFooter />
            </div>
            <DisclaimerGate />
          </div>
        </DisclaimerProvider>
      </body>
    </html>
  );
}

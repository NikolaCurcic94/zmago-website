import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { DISCLAIMER, SITE_NAME } from "@/content/site";
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

const description = `Zmago the Dragon — a LEGO creation brought to life. ${DISCLAIMER}`;

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description,
    locale: "en",
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description,
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
      </head>
      <body>
        <DisclaimerProvider>
          <div className={styles.shell}>
            <div id={SITE_CONTENT_ID}>
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

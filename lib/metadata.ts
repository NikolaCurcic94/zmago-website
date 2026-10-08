import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/content/site";

/**
 * Social preview for every page (link cards in chats and feeds): a 1200×630 JPG, the standard 1.91:1 card,
 * light enough (~60 KB) for apps that drop heavy previews. Made from zmago-render-final-fix-preview-link_3.png —
 * the whole render scaled to the card's height, its backdrop carried out to the sides. Also offered to Google
 * as the site's image (SITE_JSON_LD); Google still picks the search-result thumbnail itself.
 */
export const PREVIEW_IMAGE = {
  url: "/images/og-preview.jpg",
  width: 1200,
  height: 630,
  alt: "Zmago the Dragon, a LEGO model, crouching face on with its jaw open, wings spread and tail curling up behind",
};

/** Search engines may show large image previews and full snippets. */
export const ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
};

/** Structured data for search engines: the site, its description and its representative image. */
export const SITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  image: {
    "@type": "ImageObject",
    url: new URL(PREVIEW_IMAGE.url, SITE_URL).href,
    width: PREVIEW_IMAGE.width,
    height: PREVIEW_IMAGE.height,
    caption: PREVIEW_IMAGE.alt,
  },
};

/**
 * A page's metadata: its title and description, its canonical address, and a matching social preview.
 * Next merges Open Graph and Twitter fields per object, not per key, so each page sets them in full.
 */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: `${title} — ${SITE_NAME}`,
      description,
      locale: "en",
      url: path,
      images: [PREVIEW_IMAGE],
    },
    twitter: { card: "summary_large_image", title: `${title} — ${SITE_NAME}`, description, images: [PREVIEW_IMAGE] },
  };
}

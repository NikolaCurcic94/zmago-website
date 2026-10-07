import type { Metadata } from "next";
import { SITE_NAME } from "@/content/site";

/**
 * Social preview for every page (link cards in chats and feeds): a 1200×630 JPG, the standard 1.91:1 card,
 * light enough (~60 KB) for apps that drop heavy previews. Made from zmago-render-final-fix-link-preview.png —
 * the whole render scaled to the card's height, its backdrop carried out to the sides.
 */
export const PREVIEW_IMAGE = {
  url: "/images/og-preview.jpg",
  width: 1200,
  height: 630,
  alt: "The head of Zmago the Dragon, a LEGO model, with its jaw open",
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

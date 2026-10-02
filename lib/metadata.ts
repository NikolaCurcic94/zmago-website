import type { Metadata } from "next";
import { images } from "@/content/images";
import { SITE_NAME } from "@/content/site";

/** Social preview for every page: the hero render (3:2). */
export const PREVIEW_IMAGE = {
  url: images.hero.src,
  width: images.hero.width,
  height: images.hero.height,
  alt: "Zmago the Dragon, LEGO model, front three-quarter view",
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

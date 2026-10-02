import type { MetadataRoute } from "next";
import { NAV_ITEMS, SITE_URL } from "@/content/site";

/** One entry per page in the main navigation. */
export default function sitemap(): MetadataRoute.Sitemap {
  return NAV_ITEMS.map(({ href }) => ({
    url: `${SITE_URL}${href === "/" ? "" : href}`,
    changeFrequency: "monthly",
    priority: href === "/" ? 1 : 0.8,
  }));
}

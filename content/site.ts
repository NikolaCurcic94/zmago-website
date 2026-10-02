export const SITE_NAME = "Zmago the Dragon";

/**
 * The site's public address, for absolute links (canonical URLs, social previews, the sitemap). Set
 * NEXT_PUBLIC_SITE_URL to the real domain when the site goes live; on Vercel the production address is
 * picked up on its own; locally it falls back to the dev server.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

/** Search-result and social-preview summary of the site (the disclaimer stays in the footer and the gate). */
export const SITE_DESCRIPTION =
  "Zmago the Dragon, a fan-made LEGO Ideas creation: the story of the build, a gallery of renders and a 3D model you can pose.";

/** id of each page's <main>, the target of the "Skip to content" link. */
export const MAIN_ID = "main";

export const DISCLAIMER =
  "A fan-made LEGO project, not sponsored, authorized, or endorsed by The LEGO Group. LEGO is a trademark of The LEGO Group.";

// Placeholder until the real LEGO Ideas project page is live.
export const IDEAS_URL = "https://ideas.lego.com/product-ideas/39d53f86-6136-4f7d-b263-efc39f4c1f16";

// Current supporter count on LEGO Ideas — update this number and the Journey bar marker moves with it.
export const numberOfSupports: number = 373;

export const NAV_ITEMS = [
  { href: "/", label: "Story" },
  { href: "/gallery", label: "Gallery" },
  { href: "/playground", label: "Playground" },
] as const;

export const BUILD_NOTES = [
  { label: "Total parts", value: "575" },
  { label: "Length", value: "42.6 cm" },
  { label: "Width", value: "27 cm" },
  { label: "Height", value: "13.6 cm" },
  { label: "Weight", value: "278.8 g" },
];

export const FEATURES = [
  {
    title: "Poseable head and jaw",
    body: "The head rotates on a swivel joint, while the lower jaw opens to reveal the red tongue.",
  },
  {
    title: "Articulated neck, body and tail",
    body: "The neck, body and tail are built from repeating vertebrae. The neck and body bend up and down, while the tail’s multiple segments allow it to move more freely and curve into an S-shape.",
  },
  {
    title: "Rotating wings",
    body: "The wings are attached with rotating joints, allowing them to swing around and move between different positions.",
  },
  {
    title: "Individually movable claws",
    body: "Each foot has four individually movable toes, built from gold clips and white nails. Each toe can be posed separately, allowing Zmago to grip and stand on its claws.",
  },
];

export const MILESTONES = [
  { value: 100, label: "First hundred" },
  { value: 1000, label: "Second window opens" },
  { value: 5000, label: "Halfway" },
  { value: 10000, label: "Review stage", highlight: true },
];

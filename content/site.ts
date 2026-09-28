export const SITE_NAME = "Zmago the Dragon";

export const DISCLAIMER =
  "A fan-made LEGO project, not sponsored, authorized, or endorsed by The LEGO Group. LEGO is a trademark of The LEGO Group.";

// Placeholder until the real LEGO Ideas project page is live.
export const IDEAS_URL = "https://ideas.lego.com/product-ideas/39d53f86-6136-4f7d-b263-efc39f4c1f16";

// Static placeholder count until the live number is available.
export const SUPPORTERS: number = 0;
export const SUPPORTER_GOAL: number = 10000;

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
  { value: "100", label: "First hundred" },
  { value: "1,000", label: "Second window opens" },
  { value: "5,000", label: "Halfway" },
  { value: "10,000", label: "Review stage", highlight: true },
];

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
  { label: "Pieces", value: "580" },
  { label: "Length", value: "20 cm" },
  { label: "Wingspan", value: "20 cm" },
];

export const FEATURES = [
  {
    title: "Poseable head and jaw",
    body: "The skull turns on a click hinge and the lower jaw opens far enough to show the red tongue.",
  },
  {
    title: "Articulated neck and tail",
    body: "Segmented joints along the spine hold a pose without sagging, from a low stalk to a raised S-curve.",
  },
  {
    title: "Folding wings",
    body: "Layered blue and gold panels fan open on a shared axle and tuck flat against the body.",
  },
  {
    title: "Four gripping claws",
    body: "Each foot is built from gold clips and white horns, so the weight sits on the toes rather than a plate.",
  },
];

export const MILESTONES = [
  { value: "100", label: "First hundred" },
  { value: "1,000", label: "Second window opens" },
  { value: "5,000", label: "Halfway" },
  { value: "10,000", label: "Review stage", highlight: true },
];

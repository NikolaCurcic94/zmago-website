import { images, type ImageAsset } from "./images";

export type Shot = {
  image: ImageAsset;
  /** Alt text used in the gallery grid. */
  alt: string;
  /** Caption shown in the full-screen viewer (also its alt text). */
  caption: string;
};

// Viewer order: z01 → z12.
export const SHOTS: Shot[] = [
  { image: images.z01, alt: "Zmago crouched with tail raised", caption: "Crouched, tail raised" },
  { image: images.z02, alt: "Zmago walking in profile", caption: "Walking, wings folded" },
  { image: images.z03, alt: "Zmago with wings spread", caption: "Wings open — three-quarter high angle" },
  { image: images.z04, alt: "Wings spread from above", caption: "Wings spread, from above" },
  { image: images.z05, alt: "Head in profile", caption: "Head in profile" },
  { image: images.z06, alt: "Zmago three-quarter view", caption: "Head low, ready to move" },
  { image: images.z07, alt: "Zmago seen from directly above", caption: "Plan view — wing panels laid flat" },
  { image: images.z08, alt: "Head close-up", caption: "Eyes and open jaw" },
  { image: images.z09, alt: "Neck and horns", caption: "Horns, whiskers, neck joint" },
  { image: images.z10, alt: "Zmago front three-quarter", caption: "Standing, front three-quarter" },
  { image: images.z11, alt: "Tail detail", caption: "Tail segments" },
  { image: images.z12, alt: "Zmago in full profile", caption: "Full profile, jaw open" },
];

export const FEATURED_SHOT = {
  index: 2,
  title: "Wings open",
  subtitle: "Full model, three-quarter high angle",
};

export type GridNote = {
  /** Highlighted run-in label. */
  lead?: string;
  text: string;
};

export type GalleryShot = {
  /** Index into SHOTS. */
  index: number;
  caption: string;
};

/** Empty frame holding a spot for a photo that isn't shot yet. Not opened in the viewer. */
export type GalleryPlaceholder = {
  placeholder: true;
  caption: string;
};

/**
 * The curated grid below the featured frame, row by row.
 * - "wide-pair": a wide frame beside two small ones, one shared note under the pair.
 * - "flanked": small, wide, small; each small frame can carry its own note.
 * - "grid": plain small frames.
 */
export type GalleryRow =
  | { layout: "wide-pair"; wide: GalleryShot; pair: [GalleryShot, GalleryShot]; note: GridNote }
  | {
      layout: "flanked";
      left: GalleryShot & { note?: GridNote };
      wide: GalleryShot;
      right: GalleryShot & { note?: GridNote };
    }
  | { layout: "grid"; shots: (GalleryShot | GalleryPlaceholder)[] };

// Placeholder copy until the real descriptions arrive.
const LOREM_LONG =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus, nulla gravida orci a odio.";

const LOREM_SHORT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse.";

export const GALLERY_ROWS: GalleryRow[] = [
  {
    layout: "wide-pair",
    wide: { index: 9, caption: "Standing, front three-quarter" },
    pair: [
      { index: 7, caption: "Eyes and open jaw" },
      { index: 4, caption: "Head in profile" },
    ],
    note: { lead: "Front poses", text: LOREM_LONG },
  },
  {
    layout: "flanked",
    left: { index: 1, caption: "Walking, wings folded", note: { text: LOREM_SHORT } },
    wide: { index: 6, caption: "Plan view — the wing panels laid out flat" },
    right: { index: 10, caption: "Tail segments", note: { text: LOREM_SHORT } },
  },
  {
    layout: "grid",
    shots: [
      { index: 8, caption: "Horns, whiskers, neck joint" },
      { index: 0, caption: "Crouched, tail raised" },
      { index: 3, caption: "Wings spread, from above" },
      { index: 5, caption: "Head low, ready to move" },
      { index: 11, caption: "Full profile, jaw open" },
      // Replace with real shots: add the image to SHOTS, then swap in { index, caption }.
      { placeholder: true, caption: "New photo" },
      { placeholder: true, caption: "New photo" },
      { placeholder: true, caption: "New photo" },
    ],
  },
];

import { images, type ImageAsset } from "./images";

export type Shot = {
  image: ImageAsset;
  /** Alt text used in the gallery grid. */
  alt: string;
  /** Caption shown in the full-screen viewer (also its alt text). */
  caption: string;
};

// Viewer order.
export const SHOTS: Shot[] = [
  { image: images.frontWings, alt: "Zmago facing forward, wings spread and tail raised", caption: "Standing, front three-quarter" },
  { image: images.headThreeQuarter, alt: "Close-up of Zmago's head with the jaw open", caption: "Eyes and open jaw" },
  { image: images.headProfile, alt: "Zmago's head in profile, jaw open", caption: "Head in profile" },
  { image: images.headFront, alt: "Zmago's head seen face on", caption: "Head, face on" },
  { image: images.aboveBack, alt: "Zmago seen from above and behind, wings spread", caption: "From above, behind the wings" },
  { image: images.tail, alt: "The segmented tail rising above the wings", caption: "Tail segments" },
  { image: images.headFromBehind, alt: "Head and neck seen from behind, horns and whiskers", caption: "Horns, whiskers, neck joint" },
  { image: images.aboveSide, alt: "Zmago seen from above, head to tail", caption: "From above, head to tail" },
  { image: images.frontThreeQuarter, alt: "Zmago standing, front three-quarter, tail curled up", caption: "Front three-quarter, tail raised" },
  { image: images.aboveFromTail, alt: "Zmago seen from above and behind, wings spread, tail towards the viewer", caption: "From above, wings spread" },
  { image: images.planView, alt: "Zmago seen from directly above, head on the left, tail on the right", caption: "Plan view, straight down" },
];

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
 * The curated grid, row by row, from the top of the page.
 * - "wide-pair": a wide frame beside two small ones, one shared note under the pair
 *   (`mirrored`: the pair on the left, the wide frame on the right).
 * - "flanked": small, wide, small; each small frame can carry its own note.
 * - "grid": plain small frames.
 */
export type GalleryRow =
  | { layout: "wide-pair"; mirrored?: boolean; wide: GalleryShot; pair: [GalleryShot, GalleryShot]; note: GridNote }
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
    wide: { index: 0, caption: "Standing, front three-quarter" },
    pair: [
      { index: 3, caption: "Head, face on" },
      { index: 1, caption: "Eyes and open jaw" },
    ],
    note: { lead: "Front poses", text: LOREM_LONG },
  },
  {
    layout: "wide-pair",
    mirrored: true,
    wide: { index: 8, caption: "Front three-quarter, tail raised" },
    pair: [
      { index: 2, caption: "Head in profile" },
      { index: 6, caption: "Horns, whiskers, neck joint" },
    ],
    note: { text: LOREM_LONG },
  },
  {
    layout: "flanked",
    left: { index: 9, caption: "From above, wings spread", note: { text: LOREM_SHORT } },
    wide: { index: 10, caption: "Plan view, straight down" },
    right: { index: 5, caption: "Tail segments", note: { text: LOREM_SHORT } },
  },
  {
    layout: "grid",
    shots: [
      { index: 4, caption: "From above, behind the wings" },
      { index: 7, caption: "From above, head to tail" },
      // Replace with real shots: add the image to SHOTS, then swap in { index, caption }.
      { placeholder: true, caption: "New photo" },
      { placeholder: true, caption: "New photo" },
      { placeholder: true, caption: "New photo" },
      { placeholder: true, caption: "New photo" },
      { placeholder: true, caption: "New photo" },
      { placeholder: true, caption: "New photo" },
    ],
  },
];

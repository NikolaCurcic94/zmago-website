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
  { image: images.crouchFaceOn, alt: "Zmago crouching, head facing the viewer, tail curling up behind", caption: "Crouching, face on" },
  { image: images.behindHeadRaised, alt: "Zmago from behind and above, head raised, tail trailing towards the viewer", caption: "From behind, head raised" },
  { image: images.frontTailS, alt: "Zmago from the front, wings spread, tail rising in an S-curve", caption: "Wings spread, tail in an S" },
  { image: images.sideHeadTurned, alt: "Zmago from the side, head turned to the viewer, mouth open", caption: "Side on, head turned" },
  { image: images.frontHeadLow, alt: "Zmago from the front, head low between the arched wings", caption: "Head low, wings arched" },
  { image: images.aboveAlongSpine, alt: "Zmago from above, looking down the spine from the head to the tail", caption: "From above, along the spine" },
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

/**
 * SHOTS indices in the order the gallery reads on desktop — left to right along each row, row after row
 * (placeholders skipped). The full-screen viewer steps through them in this order, and narrow screens stack
 * each row's frames in it too.
 */
export function galleryOrder(rows: readonly GalleryRow[]): number[] {
  return rows.flatMap((row) => {
    switch (row.layout) {
      case "wide-pair":
        return row.mirrored ? [row.pair[0].index, row.pair[1].index, row.wide.index] : [row.wide.index, row.pair[0].index, row.pair[1].index];
      case "flanked":
        return [row.left.index, row.wide.index, row.right.index];
      case "grid":
        return row.shots.flatMap((shot) => ("placeholder" in shot ? [] : [shot.index]));
    }
  });
}

// Placeholder copy until the real descriptions arrive.
const LOREM_LONG =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus, nulla gravida orci a odio.";

const LOREM_SHORT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse.";

export const GALLERY_ROWS: GalleryRow[] = [
  {
    layout: "wide-pair",
    wide: { index: 13, caption: "Wings spread, tail in an S" },
    pair: [
      { index: 3, caption: "Head, face on" },
      { index: 1, caption: "Eyes and open jaw" },
    ],
    note: { lead: "Front poses", text: LOREM_LONG },
  },
  {
    layout: "wide-pair",
    mirrored: true,
    wide: { index: 14, caption: "Side on, head turned" },
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
      { index: 11, caption: "Crouching, face on" },
      { index: 12, caption: "From behind, head raised" },
      { index: 0, caption: "Standing, front three-quarter" },
      { index: 8, caption: "Front three-quarter, tail raised" },
      { index: 15, caption: "Head low, wings arched" },
      { index: 16, caption: "From above, along the spine" },
      // To hold a spot for an image still to come: { placeholder: true, caption: "New photo" }.
    ],
  },
];

/** The viewer order: every image on the gallery page, as it reads on desktop. */
export const GALLERY_ORDER = galleryOrder(GALLERY_ROWS);

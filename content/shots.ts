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


export const GALLERY_ROWS: GalleryRow[] = [
  {
    layout: "wide-pair",
    wide: { index: 1, caption: "Eyes and open jaw" },
    pair: [
      { index: 3, caption: "Head, face on" },
      { index: 2, caption: "Head in profile" },
    ],
    note: {
      lead: "The head",
      text: "The head is built around small details that give Zmago his character — curved horns, long whiskers, sharp teeth and a red tongue inside the opening jaw. The face is shaped with layered contours around the cheeks and eyes, while the nostrils add another small detail to the front of the head. Together, these details give the head its own shape and expression.",
    },
  },
  {
    layout: "wide-pair",
    mirrored: true,
    wide: { index: 14, caption: "Side on, head turned" },
    pair: [
      { index: 11, caption: "Crouching, face on" },
      { index: 13, caption: "Wings spread, tail in an S" },
    ],
    note: {
      lead: "Front poses",
      text: "The front of Zmago can be lowered into a more crouched position by moving the wings upward and dropping the front corners of the body. The corners can be lowered to roughly a right angle against the wings, changing the way the front of the dragon sits. Combined with the movement of the head and neck, this creates a lower, more compact stance that can make Zmago look like he is sneaking or stalking forward.",
    },
  },
  {
    layout: "flanked",
    left: {
      index: 9,
      caption: "From above, wings spread",
      note: {
        text: "Zmago’s joints are built with different types of movement depending on where they are placed. The head, wings, hands and tail use curved joints that allow them to rotate and move freely in different directions. The neck, spine and toes are built to move mainly along a single vertical plane, keeping their movement controlled and predictable.",
      },
    },
    wide: { index: 10, caption: "Plan view, straight down" },
    right: {
      index: 5,
      caption: "Tail segments",
      note: {
        text: "The goal was to find the right balance between movement and stability. Zmago has enough articulation to create different poses, while each part remains strong enough to hold its position. The joints and their range of movement keep the body flexible without becoming too loose, allowing the build to move naturally while staying stable.",
      },
    },
  },
  {
    layout: "grid",
    shots: [
      { index: 4, caption: "From above, behind the wings" },
      { index: 7, caption: "From above, head to tail" },
      { index: 6, caption: "Horns, whiskers, neck joint" },
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

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
  { image: images.headThreeQuarter, alt: "Close-up of Zmago's head with the jaw open", caption: "Eyes and open jaw" },
  { image: images.headProfile, alt: "Zmago's head in profile, jaw open", caption: "Head in profile" },
  { image: images.headFront, alt: "Zmago's head seen from the front", caption: "Head, front view" },
  { image: images.aboveBack, alt: "Zmago seen from above, behind the right wing, head raised and tail stretched out", caption: "From above, behind the right wing" },
  { image: images.tail, alt: "The segmented tail rising above the wings", caption: "Tail segments" },
  { image: images.headFromBehind, alt: "Head and neck seen from behind, horns and whiskers", caption: "Horns, whiskers, neck joint" },
  { image: images.aboveSide, alt: "Zmago seen from above, behind the left wing", caption: "From above, behind the left wing" },
  { image: images.aboveFromTail, alt: "Zmago seen from above and behind, wings spread, tail towards the viewer", caption: "From above, wings spread" },
  { image: images.planView, alt: "Zmago seen from directly above, head turned to the right, tail curving off to the left", caption: "Top-down view" },
  { image: images.crouchFaceOn, alt: "Zmago crouching, three-quarter view from above, head facing the viewer, tail curling up behind", caption: "Crouching, Three-Quarter View from Above" },
  { image: images.armWingJoint, alt: "Close-up from the side of a front leg and the wing above it, the paw's claws spread below", caption: "Side view, arm and wing joint" },
  { image: images.frontTailS, alt: "Zmago from the front, wings spread, tail curled into an S", caption: "Wings spread, tail curled into an S" },
  { image: images.sideHeadTurned, alt: "Zmago crouching, three-quarter view at head level, head turned to the viewer, mouth open", caption: "Crouching, Three-Quarter View at Head Level" },
  { image: images.headBetweenLegs, alt: "Close-up of Zmago's head, low between the front legs and wings, jaw open", caption: "Front pose, close-up" },
  { image: images.aboveHeadLow, alt: "Zmago from above at three-quarter view, head low on the right, tail rising behind the wings", caption: "From above, head low, tail raised" },
  { image: images.standingFront, alt: "Zmago standing, front view, wings spread and tail raised", caption: "Standing, front view, wings spread" },
  { image: images.headLowFacing, alt: "Zmago from the front three-quarter, head low and facing the viewer, tail rising behind the wings", caption: "Head low, facing the viewer" },
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
    wide: { index: 0, caption: "Eyes and open jaw" },
    pair: [
      { index: 2, caption: "Head, front view" },
      { index: 1, caption: "Head in profile" },
    ],
    note: {
      lead: "The head",
      text: "The head is built around small details that give Zmago his character - curved horns, long whiskers, sharp teeth and a red tongue inside the opening jaw. The face is shaped with layered contours around the cheeks and eyes, while the nostrils add another small detail to the front of the head. Together, these details give the head its own shape and expression.",
    },
  },
  {
    layout: "wide-pair",
    mirrored: true,
    wide: { index: 12, caption: "Crouching, Three-Quarter View at Head Level" },
    pair: [
      { index: 9, caption: "Crouching, Three-Quarter View from Above" },
      { index: 11, caption: "Wings spread, tail curled into an S" },
    ],
    note: {
      lead: "Front poses",
      text: "The front of Zmago can be lowered into a more crouched position by moving the wings upward and dropping the front corners of the body. The corners can be lowered to roughly a right angle against the wings, changing the way the front of the dragon sits. Combined with the movement of the head and neck, this creates a lower, more compact stance that can make Zmago look like he is sneaking or stalking forward.",
    },
  },
  {
    layout: "flanked",
    left: {
      index: 7,
      caption: "From above, wings spread",
      note: {
        text: "Zmago’s joints are built with different types of movement depending on where they are placed. The head, wings, hands and tail use curved joints that allow them to rotate and move freely in different directions. The neck, spine and toes are built to move mainly along a single vertical plane, keeping their movement controlled and predictable.",
      },
    },
    wide: { index: 8, caption: "Top-down view" },
    right: {
      index: 4,
      caption: "Tail segments",
      note: {
        text: "The goal was to find the right balance between movement and stability. Zmago has enough articulation to create different poses, while each part remains strong enough to hold its position. The joints and their range of movement keep the body flexible without becoming too loose, allowing the build to move naturally while staying stable.",
      },
    },
  },
  {
    layout: "grid",
    shots: [
      { index: 3, caption: "From above, behind the right wing" },
      { index: 6, caption: "From above, behind the left wing" },
      { index: 5, caption: "Horns, whiskers, neck joint" },
      { index: 10, caption: "Side view, arm and wing joint" },
      { index: 13, caption: "Front pose, close-up" },
      { index: 14, caption: "From above, head low, tail raised" },
      { index: 15, caption: "Standing, front view, wings spread" },
      { index: 16, caption: "Head low, facing the viewer" },
      // To hold a spot for an image still to come: { placeholder: true, caption: "New photo" }.
    ],
  },
];

/** The viewer order: every image on the gallery page, as it reads on desktop. */
export const GALLERY_ORDER = galleryOrder(GALLERY_ROWS);

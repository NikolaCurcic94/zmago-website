export type ImageAsset = {
  src: string;
  width: number;
  height: number;
};

const asset = (name: string, width: number, height: number): ImageAsset => ({
  // Encoded, so file names with spaces or brackets (e.g. "… (1)") still load.
  src: `/images/${encodeURIComponent(name)}.png`,
  width,
  height,
});

export const images = {
  hero: asset("zmago-render-bricklink-fix-crown-2-head_3-front-noshadow_7", 3240, 2160),
  ideaMain: asset("zmago-render-bricklink-fix-crown-2-head", 3240, 2160),
  buildMain: asset("zmago-render-final-fix-back-7", 3240, 2160),
  buildDetail1: asset("zmago-render-bricklink-fix-crown-2-profile", 3240, 2160),
  buildDetail2: asset("zmago-render-bricklink-fix-crown-tail", 3240, 2160),
  detailsMain: asset("zmago-render-final-fix-back_3", 3240, 2160),
  supportMain: asset("zmago-render-bricklink-fix-crown-2-head_3-front-noshadow_6", 3240, 2160),
  // Gallery renders
  frontWings: asset("zmago-render-bricklink-fix-crown-2-head_3-front-noshadow_6", 3240, 2160),
  frontThreeQuarter: asset("zmago-render-bricklink-fix-crown-2-head_3-front-noshadow_7", 3240, 2160),
  headThreeQuarter: asset("zmago-render-bricklink-fix-crown-2-head", 3240, 2160),
  headProfile: asset("zmago-render-bricklink-fix-crown-2-profile", 3240, 2160),
  headFront: asset("zmago-render-bricklink-fix-crown-2-head_2", 3240, 2160),
  headFromBehind: asset("zmago-render-bricklink-fix-crown-from-the-back", 3240, 2160),
  tail: asset("zmago-render-bricklink-fix-crown-tail", 3240, 2160),
  aboveBack: asset("zmago-render-final-fix-back", 3240, 2160),
  aboveSide: asset("zmago-render-final-fix-back_3", 3240, 2160),
  aboveFromTail: asset("zmago-render-final-fix-back-7", 3240, 2160),
  planView: asset("zmago-render-final-fix-back_8 (1)", 3240, 2160),
  crouchFaceOn: asset("zmago-render-final-fix-side-3", 3240, 2160),
  behindHeadRaised: asset("zmago-render-final-fix-side-3_2", 3240, 2160),
  frontTailS: asset("zmago-render-final-fix-side-3_3", 3240, 2160),
  sideHeadTurned: asset("zmago-render-final-fix-side-3_4", 3240, 2160),
  frontHeadLow: asset("zmago-render-final-fix-side-3_5", 3240, 2160),
  aboveAlongSpine: asset("zmago-render-final-fix-side-3_6", 3240, 2160),
} satisfies Record<string, ImageAsset>;

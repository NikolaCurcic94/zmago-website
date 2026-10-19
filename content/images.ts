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
  hero: asset("zmago-front-pose-2", 3240, 2160),
  ideaMain: asset("zmago-head-side-transparent", 3240, 2160),
  buildMain: asset("zmago-back-pose", 3240, 2160),
  buildDetail1: asset("zmago-head-profile", 3240, 2160),
  buildDetail2: asset("zmago-arm-and-wing", 3240, 2160),
  detailsMain: asset("zmago-front-pose-6", 3240, 2160),
  supportMain: asset("zmago-final-pose-1", 3240, 2160),
  // Gallery renders
  headThreeQuarter: asset("zmago-head-side-transparent", 3240, 2160),
  headProfile: asset("zmago-head-profile", 3240, 2160),
  headFront: asset("zmago-head-front", 3240, 2160),
  headFromBehind: asset("zmago-head-from-behind", 3240, 2160),
  tail: asset("zmago-tail", 3240, 2160),
  aboveBack: asset("zmago-above-and-right", 3240, 2160),
  aboveSide: asset("zmago-above-and-left", 3240, 2160),
  aboveFromTail: asset("zmago-back-pose", 3240, 2160),
  planView: asset("zmago-look-from-above", 3240, 2160),
  crouchFaceOn: asset("zmago-front-pose-3", 3240, 2160),
  armWingJoint: asset("zmago-arm-and-wing", 3240, 2160),
  frontTailS: asset("zmago-front-pose-2", 3240, 2160),
  sideHeadTurned: asset("zmago-front-pose-4", 3240, 2160),
  headBetweenLegs: asset("zmago-front-pose-5", 3240, 2160),
  aboveHeadLow: asset("zmago-front-pose-6", 3240, 2160),
  standingFront: asset("zmago-final-pose-1", 3240, 2160),
  headLowFacing: asset("zmago-front-pose-7", 3240, 2160),
} satisfies Record<string, ImageAsset>;

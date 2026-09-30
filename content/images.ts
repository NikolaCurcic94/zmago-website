export type ImageAsset = {
  src: string;
  width: number;
  height: number;
};

const asset = (name: string, width: number, height: number): ImageAsset => ({
  src: `/images/${name}.png`,
  width,
  height,
});

export const images = {
  hero: asset("zmago-render-bricklink-fix-crown-2-head_3-front-noshadow_7", 3240, 2160),
  ideaMain: asset("zmago-render-bricklink-fix-crown-2-head", 3240, 2160),
  buildMain: asset("zmago-render-bricklink-fix-crown-back-right", 3240, 2160),
  buildDetail1: asset("zmago-render-bricklink-fix-crown-2-profile", 3240, 2160),
  buildDetail2: asset("zmago-render-bricklink-fix-crown-tail", 3240, 2160),
  detailsMain: asset("zmago-render-bricklink-fix-crown-back-left", 3240, 2160),
  supportMain: asset("zmago-render-bricklink-fix-crown-2-head_2", 3240, 2160),
  z01: asset("z01", 1400, 933),
  z02: asset("z02", 1400, 933),
  z03: asset("z03", 1400, 933),
  z04: asset("z04", 1400, 933),
  z05: asset("z05", 1400, 933),
  z06: asset("z06", 1400, 933),
  z07: asset("z07", 1400, 933),
  z08: asset("z08", 1400, 933),
  z09: asset("z09", 1400, 933),
  z10: asset("z10", 1400, 933),
  z11: asset("z11", 1400, 933),
  z12: asset("z12", 1400, 933),
} satisfies Record<string, ImageAsset>;

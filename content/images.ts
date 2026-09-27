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
  hero: asset("hero", 1800, 1200),
  ideaMain: asset("idea-main", 1500, 1000),
  buildMain: asset("build-main", 1600, 1067),
  buildDetail1: asset("build-detail-1", 1400, 933),
  buildDetail2: asset("build-detail-2", 1400, 933),
  detailsMain: asset("details-main", 1600, 1067),
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

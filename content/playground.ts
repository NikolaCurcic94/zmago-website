/** The Zmago model, served from /public. */
export const MODEL_URL = "/zmago-render.glb";

/**
 * Lower-jaw joint, found by analysing the GLB (no joint exists in the file itself).
 * The jaw hangs from a LEGO clip hinge at the back of the mouth: clip plates
 * 63868.002/.003 (on the jaw) grip the bars of 60478.001/.002 (on the neck).
 * Every part below belongs to the rigid lower-jaw block, tongue included.
 * Names are the glTF node names; a re-export can renumber them, so re-check then.
 */
export const JAW_PART_NAMES = [
  // hinge clips (jaw side)
  "63868.dat.002", "63868.dat.003",
  // jaw body, top and teeth
  "3023a.dat", "4871.dat.003", "3020.dat.009", "11203.dat.005", "3710.dat.006", "3710.dat.004",
  "3069b.dat.014", "11477.dat.018", "11477.dat.019", "32803.dat.015", "41769.dat.001", "41770.dat",
  "51739.dat.002", "54200.dat", "54200.dat.001", "54200.dat.002", "54200.dat.003",
  // tongue (sits on the jaw plates, so it opens with the jaw)
  "3068b.dat", "15068.dat.008",
] as const;

/**
 * Hinge axis: centre of the 60478.001/.002 handle bars, in the model's own (export) space; the axis runs
 * along X (the head's 5° lift in the current export tilts it by 0.085°, which is ignored).
 */
export const JAW_PIVOT: [number, number, number] = [1.5594, 2.2515, 8.6453];

/**
 * Upper jaw = the whole upper head (skull, eyes, upper teeth, whiskers, horns). It hangs
 * from the upper clip hinge: clip plates 63868 / 63868.001 (on the head) grip the bars of
 * 60478.003/.004 (on the neck). The 18395 horns are held by clips on the head, so they go too.
 */
export const UPPER_JAW_PART_NAMES = [
  // hinge clips (head side) and the plate the head is built on
  "63868.dat", "63868.dat.001", "3020.dat.008",
  // skull, snout and brow
  "99780.dat.002", "15571.dat", "15068.dat.006", "99206.dat", "3022.dat.013", "11477.dat.020", "11477.dat.021",
  "33909.dat", "3623.dat.005", "3710.dat.005", "3070b.dat.010", "41770.dat.001", "41769.dat", "3069b.dat.015",
  "3069b.dat.016", "15068.dat.007", "32828.dat", "32828.dat.001", "51739.dat.003",
  // upper teeth
  "15070.dat", "15070.dat.001", "15070.dat.002", "15070.dat.003", "15070.dat.004", "15070.dat.005",
  // eyes and the clips that hold eyes, whiskers and horns
  "98138p33.dat", "98138p33.dat.001", "4085c.dat", "4085c.dat.001",
  "4081b.dat.033", "4081b.dat.034", "4081b.dat.035", "4081b.dat.036", "4081b.dat.040", "4081b.dat.041",
  // whiskers and horns
  "bl_1578.dat", "bl_1578.dat.001", "18395.dat", "18395.dat.001", "18950.dat", "18950.dat.001",
] as const;

/** Upper hinge axis: centre of the 60478.003/.004 handle bars (export space); the axis runs along X. */
export const UPPER_JAW_PIVOT: [number, number, number] = [1.5591, 2.4942, 8.6487];

/** Lower jaw travel from closed (jaw = 0) to fully open (jaw = 1), in degrees. */
export const MAX_JAW_OPEN = 32;

/** Upper jaw travel over the same slider range, in degrees — a small lift, not a second mouth. */
export const MAX_UPPER_JAW_OPEN = 9;

/**
 * The export shows the mouth open: the two jaws together must close by this many degrees
 * (measured: the fangs meet the lower jaw) to reach jaw = 0.
 */
const JAW_CLOSING_FROM_EXPORT_DEG = 22;

/** Slider value at which the lower jaw sits as exported (22° of 32° + 9° ≈ 0.54). */
export const JAW_AS_EXPORTED = JAW_CLOSING_FROM_EXPORT_DEG / (MAX_JAW_OPEN + MAX_UPPER_JAW_OPEN);

/**
 * Upper jaw opening in the export, degrees from closed. The current export lifts the head mount and lower
 * jaw by 5° about the neck ball but leaves the upper head where it was, so relative to its hinge the upper
 * jaw is 5° more closed than before: 4.83° − 5° ≈ −0.17° (just shut).
 */
export const UPPER_JAW_AS_EXPORTED_DEG = JAW_AS_EXPORTED * MAX_UPPER_JAW_OPEN - 5;

/** Jaw slider value the page opens with: a third of the way, mouth slightly ajar. */
export const JAW_ON_LOAD = 0.33;

/**
 * Head joint: a LEGO ball-and-socket. The ball is the end of 14417.dat.007 (stays on the
 * neck); the socket is 3730.dat, which carries the block both jaw hinges hang from.
 * The whole head assembly = these mount parts + both jaw pivots (with everything on them).
 */
export const HEAD_MOUNT_PART_NAMES = [
  "3730.dat", "51739.dat", "51739.dat.001", "11203.dat.004",
  "60478.dat.001", "60478.dat.002", "60478.dat.003", "60478.dat.004",
  "85984.dat.004", "85984.dat.005",
] as const;

/** Centre of the ball of 14417.dat.007 (measured from its vertices), in the model's export space. */
export const HEAD_PIVOT: [number, number, number] = [1.554, 2.319, 8.016];

/**
 * Which way the side part of the Head path swings: -1 turns the head towards -X,
 * the side the home camera looks from, so the whole sweep is visible.
 */
export const HEAD_SWEEP_SIDE = -1;

/**
 * The Head slider runs -1 … 0 … 1 with the head neutral in the middle, round the ball joint.
 * Each point is [slider, direction φ°, swing θ°]: the head tilts by θ about an axis perpendicular to the
 * neck, in direction φ. With HEAD_SWEEP_SIDE = -1: φ 180 = left, 270 = nose down, 360 = right,
 * 450 ≡ 90 = nose up.
 *   0 → 1:  straight out to RIGHT (φ 370, 10° above horizontal, θ 24.3°), then round down to DOWN (θ 9.6°).
 *   0 → -1: straight out to LEFT (φ 170, θ 31.7°), then round up to UP (φ 90, θ 55.7°).
 * Each round part is a true elliptical arc (the side and end swings as conjugate semi-diameters), so the
 * nose sweeps a curve rather than cutting the corner. The slider is spread evenly over the head's actual
 * turn. Safe envelope: the head's surface against the neck and body by penetration depth (> 0.25 LDU,
 * both directions), mouth closed, on the current export (head lifted 5°), less 0.5°; the whole path stays
 * under it. Neutral appears twice (φ 170 and 370) so each half starts straight.
 * Recompute (with JAW_LIMIT_ALONG_HEAD) if the GLB is re-exported.
 */
export const HEAD_PATH: readonly (readonly [number, number, number])[] = [
  [-1.0000, 90.00, 55.70],
  [-0.9931, 90.70, 55.81],
  [-0.9863, 91.40, 55.90],
  [-0.9795, 92.09, 55.98],
  [-0.9727, 92.78, 56.03],
  [-0.9660, 93.47, 56.07],
  [-0.9593, 94.17, 56.09],
  [-0.9525, 94.86, 56.09],
  [-0.9458, 95.55, 56.07],
  [-0.9391, 96.24, 56.04],
  [-0.9323, 96.93, 55.98],
  [-0.9255, 97.63, 55.91],
  [-0.9187, 98.32, 55.81],
  [-0.9118, 99.02, 55.70],
  [-0.9049, 99.72, 55.58],
  [-0.8979, 100.43, 55.43],
  [-0.8909, 101.14, 55.26],
  [-0.8838, 101.85, 55.08],
  [-0.8766, 102.57, 54.88],
  [-0.8693, 103.30, 54.67],
  [-0.8620, 104.03, 54.43],
  [-0.8545, 104.76, 54.18],
  [-0.8470, 105.51, 53.91],
  [-0.8394, 106.26, 53.63],
  [-0.8316, 107.02, 53.33],
  [-0.8238, 107.79, 53.01],
  [-0.8158, 108.57, 52.68],
  [-0.8078, 109.36, 52.33],
  [-0.7996, 110.16, 51.97],
  [-0.7913, 110.97, 51.59],
  [-0.7828, 111.79, 51.20],
  [-0.7743, 112.62, 50.79],
  [-0.7656, 113.47, 50.38],
  [-0.7568, 114.34, 49.95],
  [-0.7479, 115.22, 49.50],
  [-0.7388, 116.11, 49.05],
  [-0.7297, 117.02, 48.58],
  [-0.7203, 117.95, 48.11],
  [-0.7109, 118.90, 47.62],
  [-0.7014, 119.87, 47.13],
  [-0.6917, 120.86, 46.62],
  [-0.6819, 121.87, 46.11],
  [-0.6719, 122.91, 45.59],
  [-0.6619, 123.96, 45.06],
  [-0.6517, 125.05, 44.53],
  [-0.6414, 126.16, 44.00],
  [-0.6310, 127.29, 43.45],
  [-0.6205, 128.46, 42.91],
  [-0.6099, 129.65, 42.37],
  [-0.5991, 130.88, 41.82],
  [-0.5883, 132.14, 41.27],
  [-0.5773, 133.43, 40.72],
  [-0.5663, 134.76, 40.18],
  [-0.5551, 136.13, 39.64],
  [-0.5438, 137.53, 39.10],
  [-0.5325, 138.97, 38.57],
  [-0.5210, 140.45, 38.04],
  [-0.5095, 141.98, 37.53],
  [-0.4979, 143.54, 37.02],
  [-0.4862, 145.15, 36.52],
  [-0.4744, 146.80, 36.04],
  [-0.4626, 148.50, 35.57],
  [-0.4506, 150.24, 35.11],
  [-0.4387, 152.02, 34.67],
  [-0.4266, 153.85, 34.25],
  [-0.4145, 155.73, 33.85],
  [-0.4023, 157.65, 33.47],
  [-0.3901, 159.61, 33.11],
  [-0.3778, 161.61, 32.77],
  [-0.3655, 163.66, 32.46],
  [-0.3532, 165.74, 32.18],
  [-0.3408, 167.85, 31.93],
  [-0.3284, 170.00, 31.70],
  [-0.3263, 170.00, 31.50],
  [-0.3211, 170.00, 31.00],
  [-0.3159, 170.00, 30.50],
  [-0.3108, 170.00, 30.00],
  [-0.3056, 170.00, 29.50],
  [-0.3004, 170.00, 29.00],
  [-0.2952, 170.00, 28.50],
  [-0.2900, 170.00, 28.00],
  [-0.2849, 170.00, 27.50],
  [-0.2797, 170.00, 27.00],
  [-0.2745, 170.00, 26.50],
  [-0.2693, 170.00, 26.00],
  [-0.2641, 170.00, 25.50],
  [-0.2590, 170.00, 25.00],
  [-0.2538, 170.00, 24.50],
  [-0.2486, 170.00, 24.00],
  [-0.2434, 170.00, 23.50],
  [-0.2383, 170.00, 23.00],
  [-0.2331, 170.00, 22.50],
  [-0.2279, 170.00, 22.00],
  [-0.2227, 170.00, 21.50],
  [-0.2175, 170.00, 21.00],
  [-0.2124, 170.00, 20.50],
  [-0.2072, 170.00, 20.00],
  [-0.2020, 170.00, 19.50],
  [-0.1968, 170.00, 19.00],
  [-0.1916, 170.00, 18.50],
  [-0.1865, 170.00, 18.00],
  [-0.1813, 170.00, 17.50],
  [-0.1761, 170.00, 17.00],
  [-0.1709, 170.00, 16.50],
  [-0.1657, 170.00, 16.00],
  [-0.1606, 170.00, 15.50],
  [-0.1554, 170.00, 15.00],
  [-0.1502, 170.00, 14.50],
  [-0.1450, 170.00, 14.00],
  [-0.1398, 170.00, 13.50],
  [-0.1347, 170.00, 13.00],
  [-0.1295, 170.00, 12.50],
  [-0.1243, 170.00, 12.00],
  [-0.1191, 170.00, 11.50],
  [-0.1139, 170.00, 11.00],
  [-0.1088, 170.00, 10.50],
  [-0.1036, 170.00, 10.00],
  [-0.0984, 170.00, 9.50],
  [-0.0932, 170.00, 9.00],
  [-0.0880, 170.00, 8.50],
  [-0.0829, 170.00, 8.00],
  [-0.0777, 170.00, 7.50],
  [-0.0725, 170.00, 7.00],
  [-0.0673, 170.00, 6.50],
  [-0.0622, 170.00, 6.00],
  [-0.0570, 170.00, 5.50],
  [-0.0518, 170.00, 5.00],
  [-0.0466, 170.00, 4.50],
  [-0.0414, 170.00, 4.00],
  [-0.0363, 170.00, 3.50],
  [-0.0311, 170.00, 3.00],
  [-0.0259, 170.00, 2.50],
  [-0.0207, 170.00, 2.00],
  [-0.0155, 170.00, 1.50],
  [-0.0104, 170.00, 1.00],
  [-0.0052, 170.00, 0.50],
  [0.0000, 170.00, 0.00],
  [0.0000, 370.00, 0.00],
  [0.0094, 370.00, 0.50],
  [0.0188, 370.00, 1.00],
  [0.0281, 370.00, 1.50],
  [0.0375, 370.00, 2.00],
  [0.0469, 370.00, 2.50],
  [0.0563, 370.00, 3.00],
  [0.0657, 370.00, 3.50],
  [0.0751, 370.00, 4.00],
  [0.0844, 370.00, 4.50],
  [0.0938, 370.00, 5.00],
  [0.1032, 370.00, 5.50],
  [0.1126, 370.00, 6.00],
  [0.1220, 370.00, 6.50],
  [0.1314, 370.00, 7.00],
  [0.1407, 370.00, 7.50],
  [0.1501, 370.00, 8.00],
  [0.1595, 370.00, 8.50],
  [0.1689, 370.00, 9.00],
  [0.1783, 370.00, 9.50],
  [0.1876, 370.00, 10.00],
  [0.1970, 370.00, 10.50],
  [0.2064, 370.00, 11.00],
  [0.2158, 370.00, 11.50],
  [0.2252, 370.00, 12.00],
  [0.2346, 370.00, 12.50],
  [0.2439, 370.00, 13.00],
  [0.2533, 370.00, 13.50],
  [0.2627, 370.00, 14.00],
  [0.2721, 370.00, 14.50],
  [0.2815, 370.00, 15.00],
  [0.2909, 370.00, 15.50],
  [0.3002, 370.00, 16.00],
  [0.3096, 370.00, 16.50],
  [0.3190, 370.00, 17.00],
  [0.3284, 370.00, 17.50],
  [0.3378, 370.00, 18.00],
  [0.3472, 370.00, 18.50],
  [0.3565, 370.00, 19.00],
  [0.3659, 370.00, 19.50],
  [0.3753, 370.00, 20.00],
  [0.3847, 370.00, 20.50],
  [0.3941, 370.00, 21.00],
  [0.4034, 370.00, 21.50],
  [0.4128, 370.00, 22.00],
  [0.4222, 370.00, 22.50],
  [0.4316, 370.00, 23.00],
  [0.4410, 370.00, 23.50],
  [0.4504, 370.00, 24.00],
  [0.4560, 370.00, 24.30],
  [0.4599, 369.51, 24.26],
  [0.4639, 369.02, 24.21],
  [0.4679, 368.53, 24.15],
  [0.4720, 368.04, 24.08],
  [0.4762, 367.54, 24.00],
  [0.4804, 367.04, 23.91],
  [0.4847, 366.54, 23.81],
  [0.4892, 366.03, 23.70],
  [0.4937, 365.51, 23.58],
  [0.4983, 364.99, 23.45],
  [0.5031, 364.47, 23.32],
  [0.5079, 363.94, 23.17],
  [0.5129, 363.40, 23.02],
  [0.5180, 362.85, 22.85],
  [0.5233, 362.30, 22.68],
  [0.5286, 361.74, 22.50],
  [0.5341, 361.16, 22.31],
  [0.5397, 360.58, 22.11],
  [0.5455, 359.99, 21.90],
  [0.5513, 359.38, 21.69],
  [0.5573, 358.77, 21.47],
  [0.5635, 358.14, 21.24],
  [0.5698, 357.49, 21.00],
  [0.5762, 356.84, 20.76],
  [0.5827, 356.16, 20.50],
  [0.5894, 355.47, 20.25],
  [0.5962, 354.76, 19.98],
  [0.6032, 354.03, 19.71],
  [0.6102, 353.28, 19.43],
  [0.6174, 352.51, 19.15],
  [0.6247, 351.71, 18.86],
  [0.6322, 350.89, 18.57],
  [0.6398, 350.05, 18.27],
  [0.6475, 349.17, 17.96],
  [0.6553, 348.27, 17.66],
  [0.6632, 347.33, 17.34],
  [0.6712, 346.36, 17.03],
  [0.6794, 345.35, 16.71],
  [0.6877, 344.30, 16.39],
  [0.6960, 343.21, 16.07],
  [0.7045, 342.07, 15.74],
  [0.7131, 340.89, 15.42],
  [0.7217, 339.66, 15.09],
  [0.7305, 338.37, 14.77],
  [0.7394, 337.02, 14.44],
  [0.7483, 335.61, 14.12],
  [0.7573, 334.14, 13.80],
  [0.7664, 332.59, 13.48],
  [0.7756, 330.97, 13.16],
  [0.7849, 329.28, 12.85],
  [0.7942, 327.50, 12.55],
  [0.8036, 325.63, 12.25],
  [0.8131, 323.67, 11.96],
  [0.8226, 321.62, 11.68],
  [0.8322, 319.46, 11.41],
  [0.8419, 317.21, 11.15],
  [0.8515, 314.84, 10.91],
  [0.8613, 312.38, 10.68],
  [0.8710, 309.81, 10.46],
  [0.8808, 307.13, 10.26],
  [0.8907, 304.35, 10.08],
  [0.9006, 301.48, 9.92],
  [0.9105, 298.52, 9.78],
  [0.9204, 295.48, 9.66],
  [0.9303, 292.37, 9.57],
  [0.9403, 289.21, 9.50],
  [0.9502, 286.00, 9.45],
  [0.9602, 282.78, 9.43],
  [0.9701, 279.55, 9.43],
  [0.9801, 276.33, 9.46],
  [0.9901, 273.14, 9.52],
  [1.0000, 270.00, 9.60],
];

/**
 * Largest safe Jaw value along the Head path: [head slider, max jaw]. Both jaws open together
 * (as the Jaw slider always moves them). The jaw never moves on its own: the Head slider stops, either
 * way from neutral, before the first sample where the current jaw exceeds this (headRangeForJaw), and
 * the Jaw slider stops at this value for the current head (maxJawAtHead).
 * Measured offline by penetration depth (the same test as HEAD_PATH's envelope, head tested at θ + 0.5°):
 * the jaws' surface against the neck and body, Jaw scanned up and refined to 0.01, on the current export,
 * less 0.02 (≈0.6° of lower jaw); 1 = the jaw can open fully there. Nothing is checked at runtime.
 */
export const JAW_LIMIT_ALONG_HEAD: readonly (readonly [number, number])[] = [
  [-1.0000, 1.00], [-0.9931, 1.00], [-0.9863, 1.00],
  [-0.9795, 1.00], [-0.9727, 1.00], [-0.9660, 1.00],
  [-0.9593, 1.00], [-0.9525, 1.00], [-0.9458, 1.00],
  [-0.9391, 1.00], [-0.9323, 1.00], [-0.9255, 1.00],
  [-0.9187, 1.00], [-0.9118, 1.00], [-0.9049, 1.00],
  [-0.8979, 1.00], [-0.8909, 1.00], [-0.8838, 1.00],
  [-0.8766, 1.00], [-0.8693, 1.00], [-0.8620, 1.00],
  [-0.8545, 1.00], [-0.8470, 1.00], [-0.8394, 1.00],
  [-0.8316, 1.00], [-0.8238, 1.00], [-0.8158, 1.00],
  [-0.8078, 1.00], [-0.7996, 1.00], [-0.7913, 1.00],
  [-0.7828, 1.00], [-0.7743, 1.00], [-0.7656, 1.00],
  [-0.7568, 1.00], [-0.7479, 1.00], [-0.7388, 1.00],
  [-0.7297, 1.00], [-0.7203, 1.00], [-0.7109, 1.00],
  [-0.7014, 1.00], [-0.6917, 1.00], [-0.6819, 1.00],
  [-0.6719, 1.00], [-0.6619, 1.00], [-0.6517, 1.00],
  [-0.6414, 1.00], [-0.6310, 1.00], [-0.6205, 1.00],
  [-0.6099, 1.00], [-0.5991, 1.00], [-0.5883, 1.00],
  [-0.5773, 1.00], [-0.5663, 1.00], [-0.5551, 1.00],
  [-0.5438, 1.00], [-0.5325, 1.00], [-0.5210, 1.00],
  [-0.5095, 1.00], [-0.4979, 1.00], [-0.4862, 1.00],
  [-0.4744, 1.00], [-0.4626, 1.00], [-0.4506, 1.00],
  [-0.4387, 1.00], [-0.4266, 1.00], [-0.4145, 1.00],
  [-0.4023, 1.00], [-0.3901, 1.00], [-0.3778, 1.00],
  [-0.3655, 1.00], [-0.3532, 1.00], [-0.3408, 1.00],
  [-0.3284, 1.00], [-0.3263, 1.00], [-0.3211, 1.00],
  [-0.3159, 1.00], [-0.3108, 1.00], [-0.3056, 1.00],
  [-0.3004, 1.00], [-0.2952, 1.00], [-0.2900, 1.00],
  [-0.2849, 1.00], [-0.2797, 1.00], [-0.2745, 1.00],
  [-0.2693, 1.00], [-0.2641, 1.00], [-0.2590, 1.00],
  [-0.2538, 1.00], [-0.2486, 1.00], [-0.2434, 1.00],
  [-0.2383, 1.00], [-0.2331, 1.00], [-0.2279, 1.00],
  [-0.2227, 1.00], [-0.2175, 1.00], [-0.2124, 1.00],
  [-0.2072, 1.00], [-0.2020, 1.00], [-0.1968, 1.00],
  [-0.1916, 1.00], [-0.1865, 1.00], [-0.1813, 1.00],
  [-0.1761, 1.00], [-0.1709, 1.00], [-0.1657, 1.00],
  [-0.1606, 1.00], [-0.1554, 1.00], [-0.1502, 1.00],
  [-0.1450, 1.00], [-0.1398, 1.00], [-0.1347, 1.00],
  [-0.1295, 1.00], [-0.1243, 1.00], [-0.1191, 1.00],
  [-0.1139, 1.00], [-0.1088, 1.00], [-0.1036, 1.00],
  [-0.0984, 1.00], [-0.0932, 1.00], [-0.0880, 1.00],
  [-0.0829, 1.00], [-0.0777, 1.00], [-0.0725, 1.00],
  [-0.0673, 1.00], [-0.0622, 1.00], [-0.0570, 1.00],
  [-0.0518, 1.00], [-0.0466, 1.00], [-0.0414, 1.00],
  [-0.0363, 1.00], [-0.0311, 1.00], [-0.0259, 1.00],
  [-0.0207, 1.00], [-0.0155, 1.00], [-0.0104, 1.00],
  [-0.0052, 1.00], [0.0000, 1.00], [0.0094, 1.00],
  [0.0188, 1.00], [0.0281, 1.00], [0.0375, 1.00],
  [0.0469, 1.00], [0.0563, 1.00], [0.0657, 1.00],
  [0.0751, 1.00], [0.0844, 1.00], [0.0938, 1.00],
  [0.1032, 1.00], [0.1126, 1.00], [0.1220, 1.00],
  [0.1314, 1.00], [0.1407, 1.00], [0.1501, 1.00],
  [0.1595, 1.00], [0.1689, 1.00], [0.1783, 1.00],
  [0.1876, 1.00], [0.1970, 1.00], [0.2064, 1.00],
  [0.2158, 1.00], [0.2252, 1.00], [0.2346, 1.00],
  [0.2439, 1.00], [0.2533, 1.00], [0.2627, 1.00],
  [0.2721, 1.00], [0.2815, 1.00], [0.2909, 1.00],
  [0.3002, 1.00], [0.3096, 1.00], [0.3190, 1.00],
  [0.3284, 1.00], [0.3378, 1.00], [0.3472, 1.00],
  [0.3565, 1.00], [0.3659, 1.00], [0.3753, 1.00],
  [0.3847, 1.00], [0.3941, 1.00], [0.4034, 1.00],
  [0.4128, 1.00], [0.4222, 1.00], [0.4316, 1.00],
  [0.4410, 1.00], [0.4504, 1.00], [0.4560, 1.00],
  [0.4599, 1.00], [0.4639, 1.00], [0.4679, 1.00],
  [0.4720, 1.00], [0.4762, 1.00], [0.4804, 1.00],
  [0.4847, 1.00], [0.4892, 1.00], [0.4937, 1.00],
  [0.4983, 1.00], [0.5031, 1.00], [0.5079, 1.00],
  [0.5129, 1.00], [0.5180, 1.00], [0.5233, 1.00],
  [0.5286, 1.00], [0.5341, 1.00], [0.5397, 1.00],
  [0.5455, 1.00], [0.5513, 1.00], [0.5573, 1.00],
  [0.5635, 1.00], [0.5698, 1.00], [0.5762, 1.00],
  [0.5827, 1.00], [0.5894, 1.00], [0.5962, 1.00],
  [0.6032, 1.00], [0.6102, 1.00], [0.6174, 1.00],
  [0.6247, 1.00], [0.6322, 1.00], [0.6398, 1.00],
  [0.6475, 1.00], [0.6553, 1.00], [0.6632, 1.00],
  [0.6712, 1.00], [0.6794, 1.00], [0.6877, 1.00],
  [0.6960, 1.00], [0.7045, 1.00], [0.7131, 1.00],
  [0.7217, 1.00], [0.7305, 1.00], [0.7394, 1.00],
  [0.7483, 1.00], [0.7573, 1.00], [0.7664, 1.00],
  [0.7756, 1.00], [0.7849, 1.00], [0.7942, 1.00],
  [0.8036, 1.00], [0.8131, 1.00], [0.8226, 1.00],
  [0.8322, 1.00], [0.8419, 1.00], [0.8515, 1.00],
  [0.8613, 1.00], [0.8710, 1.00], [0.8808, 1.00],
  [0.8907, 1.00], [0.9006, 1.00], [0.9105, 1.00],
  [0.9204, 1.00], [0.9303, 1.00], [0.9403, 1.00],
  [0.9502, 1.00], [0.9602, 1.00], [0.9701, 1.00],
  [0.9801, 1.00], [0.9901, 1.00], [1.0000, 1.00],
];

/** Largest safe Jaw value with the head at this Head slider value (the lower of the two samples around it). */
export function maxJawAtHead(head: number): number {
  const table = JAW_LIMIT_ALONG_HEAD;
  const s = Math.min(1, Math.max(-1, head));
  let i = 1;
  while (i < table.length - 1 && table[i][0] < s) i++;
  const [s0, j0] = table[i - 1];
  return s <= s0 ? j0 : Math.min(j0, table[i][1]);
}

/** Head slider range the head can travel from neutral, either way, with the jaw at this value without touching the neck. */
export function headRangeForJaw(jaw: number): { min: number; max: number } {
  const table = JAW_LIMIT_ALONG_HEAD;
  const zero = table.findIndex((row) => row[0] >= 0);
  let max = 0;
  for (let i = zero; i < table.length && table[i][1] >= jaw; i++) max = table[i][0];
  let min = 0;
  for (let i = zero - 1; i >= 0 && table[i][1] >= jaw; i--) min = table[i][0];
  return { min, max };
}

/**
 * Lower neck joint: trunk → 1st neck vertebra. Two ball plates on the vertebra (22890.016/.017)
 * sit in two sockets on the trunk's shoulder block (14418.016/.017); two balls on one line act as
 * a hinge, so the joint bends about the line through their centres (fitted from their vertices:
 * r 0.0791 ± 0.0001). Everything above it — both neck vertebrae and the whole head rig — moves.
 */
export const NECK_LOWER_PART_NAMES = [
  // 1st neck vertebra (sits on the trunk)
  "22890.dat.016", "22890.dat.017", "14418.dat.018", "14418.dat.019", "53451.dat.028", "53451.dat.029", "15068.dat.005",
  "3023b.dat.012", "3022.dat.012", "32803.dat.014", "4081b.dat.030", "4081b.dat.031", "4081b.dat.032",
  // 2nd neck vertebra (carries the head's ball, 14417.dat.007)
  "22890.dat.018", "22890.dat.019", "14417.dat.007", "53451.dat.030", "53451.dat.031", "15068.dat.009", "3023b.dat.015",
  "3023b.dat.016", "3022.dat.014", "32803.dat.017", "4081b.dat.037", "4081b.dat.038", "4081b.dat.039",
] as const;

/** Midpoint of the two ball centres, in the model's export space. */
export const NECK_LOWER_PIVOT: [number, number, number] = [1.5003, 1.7113, 6.9721];

/** Hinge axis through both balls (export space); a positive angle bends the neck down. */
export const NECK_LOWER_AXIS: [number, number, number] = [0.9976, 0.0217, -0.0651];

/**
 * Neck slider 1 = this many degrees down. Computed offline from the real geometry (neck + head,
 * Jaw 0 and 1, against every other part): the underside of the 1st vertebra (32803.dat.014)
 * meets the trunk's top plates (3022.dat.006, 26601.dat) at 50.5°; less a 0.5° margin.
 */
export const NECK_LOWER_MAX_DEG = 50;

/**
 * Neck bent UP (the other half of the Neck slider), head neutral: both vertebrae and the whole head turn
 * back about the same hinge until a spike on the neck (53451.dat.029) meets a clip on the back
 * (4081b.dat.007) at 44.7° — by penetration depth (> 0.25 LDU, both directions), jaw shut and fully open,
 * on the full-detail and the compressed geometry; less 0.5°.
 */
export const NECK_LOWER_UP_MAX_DEG = 44.2;

/**
 * The four paws. Each palm plate (14704) is pressed onto the ball at the bottom of its leg plate
 * (22890); the ball centre (fitted from its vertices, r 0.0791 ± 0.0001) is the wrist pivot. The
 * paw curls its toes down about the axis across the paw (perpendicular to where the toes point).
 * Left and right are the dragon's own (its left is +X in export space).
 */
export const PAWS = [
  {
    label: "Front left",
    pivot: [4.2216, 0.432, 6.6088],
    axis: [0.9862, 0, -0.1658],
    parts: ["14704.dat.010", "26047.dat.002", "85984.dat.002", "92692.dat.002", "76116.dat.008", "76116.dat.009", "76116.dat.010", "76116.dat.011", "53451.dat.020", "53451.dat.021", "53451.dat.022", "53451.dat.023"],
  },
  {
    label: "Front right",
    pivot: [-1.2594, 0.5248, 6.7319],
    axis: [0.9937, 0, 0.1122],
    parts: ["14704.dat.011", "26047.dat.003", "85984.dat.003", "92692.dat.003", "76116.dat.012", "76116.dat.013", "76116.dat.014", "76116.dat.015", "53451.dat.024", "53451.dat.025", "53451.dat.026", "53451.dat.027"],
  },
  {
    label: "Rear left",
    pivot: [2.4762, 0.452, 4.1056],
    axis: [0.9842, 0, -0.1773],
    parts: ["14704.dat.008", "26047.dat", "85984.dat", "92692.dat", "76116.dat", "76116.dat.001", "76116.dat.002", "76116.dat.003", "53451.dat.012", "53451.dat.013", "53451.dat.014", "53451.dat.015"],
  },
  {
    label: "Rear right",
    pivot: [0.537, 0.4531, 4.0466],
    axis: [0.9643, 0, 0.2649],
    parts: ["14704.dat.009", "26047.dat.001", "85984.dat.001", "92692.dat.001", "76116.dat.004", "76116.dat.005", "76116.dat.006", "76116.dat.007", "53451.dat.016", "53451.dat.017", "53451.dat.018", "53451.dat.019"],
  },
] as const satisfies readonly { label: string; pivot: readonly number[]; axis: readonly number[]; parts: readonly string[] }[];

/**
 * Paw slider 1 = toes curled down by this much. Chosen for a natural grip (palm upright, claws to
 * the floor); the geometry allows more — the palm socket reaches its leg plate at 107.8° (front
 * right, the tightest) to 131.9° (rear) — so every paw keeps well over the 0.5° margin.
 */
export const PAW_MAX_DEG = 90;

/**
 * Fingers, per paw (order of PAWS). Each finger (76116) turns with its claw (53451) about its own clip
 * hole — the hinge axis is the hole's axis (a coordinate axis in the part's LDraw frame), its centre the
 * fitted hole circle (r 3.98 LDU, on the r 4 bar) — curling down. maxDeg = the safe curl: the three main
 * fingers move together at one angle, the thumb at its own. Limits are precomputed by penetration depth
 * (>0.25 LDU into another part), all fingers moving together with the paw curled 0°–90°: the main fingers
 * are stopped by each other (they fan out on the frame's arc), the thumb by its own bar (26047); every
 * angle sits at least 0.5° below the first contact.
 */
export const PAW_FINGERS: readonly (readonly { parts: readonly string[]; pivot: readonly number[]; axis: readonly number[]; maxDeg: number }[])[] = [
  // Front left
  [
    { parts: ["76116.dat.008", "53451.dat.020"], pivot: [4.3084, 0.1875, 7.1533], axis: [0.9791, -0.0862, -0.1841], maxDeg: 125.1 },
    { parts: ["76116.dat.009", "53451.dat.021"], pivot: [4.477, 0.1827, 7.0886], axis: [0.8563, 0.0336, -0.5153], maxDeg: 125.1 },
    { parts: ["76116.dat.010", "53451.dat.022"], pivot: [4.1237, 0.2129, 7.1575], axis: [0.9657, -0.1941, 0.1728], maxDeg: 125.1 },
    { parts: ["76116.dat.011", "53451.dat.023"], pivot: [3.9423, 0.255, 6.8326], axis: [0.3169, -0.3209, 0.8925], maxDeg: 126 }, // thumb
  ],
  // Front right
  [
    { parts: ["76116.dat.013", "53451.dat.025"], pivot: [-1.4955, 0.2792, 7.2234], axis: [0.8839, -0.0767, 0.4614], maxDeg: 125 },
    { parts: ["76116.dat.014", "53451.dat.026"], pivot: [-1.1377, 0.2937, 7.2709], axis: [0.9607, 0.1564, -0.2292], maxDeg: 125 },
    { parts: ["76116.dat.015", "53451.dat.027"], pivot: [-1.3232, 0.276, 7.2777], axis: [0.9913, 0.0429, 0.1248], maxDeg: 125 },
    { parts: ["76116.dat.012", "53451.dat.024"], pivot: [-0.9751, 0.3327, 6.9368], axis: [0.2754, 0.3206, -0.9063], maxDeg: 127.6 }, // thumb
  ],
  // Rear left
  [
    { parts: ["76116.dat", "53451.dat.013"], pivot: [2.4209, 0.3321, 4.6917], axis: [0.98, -0.0403, 0.1948], maxDeg: 89.4 },
    { parts: ["76116.dat.002", "53451.dat.014"], pivot: [2.5723, 0.3293, 4.6883], axis: [0.9843, -0.0023, -0.1764], maxDeg: 89.4 },
    { parts: ["76116.dat.003", "53451.dat.015"], pivot: [2.7327, 0.3316, 4.6344], axis: [0.8516, 0.036, -0.523], maxDeg: 89.4 },
    { parts: ["76116.dat.001", "53451.dat.012"], pivot: [2.2219, 0.2884, 4.3754], axis: [0.4002, -0.1019, 0.9107], maxDeg: 160.7 }, // thumb
  ],
  // Rear right
  [
    { parts: ["76116.dat.005", "53451.dat.016"], pivot: [0.5401, 0.3333, 4.6354], axis: [0.9935, 0.0387, -0.1075], maxDeg: 89.4 },
    { parts: ["76116.dat.006", "53451.dat.017"], pivot: [0.3896, 0.3307, 4.6186], axis: [0.9649, 0.0008, 0.2625], maxDeg: 89.4 },
    { parts: ["76116.dat.007", "53451.dat.018"], pivot: [0.2347, 0.3332, 4.5508], axis: [0.8021, -0.0372, 0.596], maxDeg: 89.4 },
    { parts: ["76116.dat.004", "53451.dat.019"], pivot: [0.7662, 0.2891, 4.3379], axis: [0.4792, 0.1009, -0.8719], maxDeg: 160.7 }, // thumb
  ],
];

/**
 * Tail: nine ball joints (Ball Joint-8, r 7.92 LDU) from the body's 15456 ball down to the tip —
 * joint 0 turns the whole tail, joint k (1–8) turns segment k and everything after it. Each segment
 * is one 14704 socket plate with its jumper, curved slope, 1×1 plate and 14417 ball plate; the tip
 * group rides on the last one. The Tail slider sways it sideways: every joint turns about its
 * segment's plate normal (axis) — to the dragon's left by up to `left`°, to its right by up to
 * `right`° — so the tail bends in one continuous curve. The per-joint maxima are precomputed:
 * each joint to its own first contact (socket rim on the ball's stem, plate on plate), less 0.5°,
 * then all joints together checked against the body and the other segments by penetration depth
 * (> 0.25 LDU) on both the full-detail and the compressed geometry, lowered where they met
 * (left: the tip against 5091 on the body; right: plate on plate at joints 5 and 7) — then kept at
 * 90% of that range. In all, the tail turns by up to ~108° to the left and ~99° to the right.
 */
export const TAIL_JOINTS: readonly { parts: readonly string[]; pivot: readonly number[]; axis: readonly number[]; left: number; right: number }[] = [
  {
    parts: ["14704.dat.012", "3794b.dat.008", "11477.dat.022", "3024.dat.029", "14417.dat.008"],
    pivot: [1.4999, 1.2066, 3.9371],
    axis: [-0.0436, 0.9667, 0.2523],
    left: 12.42,
    right: 21.69,
  },
  {
    parts: ["14704.dat.007", "3794b.dat.007", "11477.dat.007", "3024.dat.003", "14417.dat.006"],
    pivot: [1.5439, 1.3861, 3.5735],
    axis: [-0.0436, 0.9667, 0.2522],
    left: 20.61,
    right: 19.8,
  },
  {
    parts: ["14704.dat.006", "3794b.dat.006", "11477.dat.006", "3024.dat.008", "14417.dat.005"],
    pivot: [1.5881, 1.5656, 3.2098],
    axis: [-0.0436, 0.9667, 0.2522],
    left: 0,
    right: 0,
  },
  {
    parts: ["14704.dat.005", "3794b.dat.005", "11477.dat.005", "3024.dat.009", "14417.dat.004"],
    pivot: [1.269, 1.6914, 2.9894],
    axis: [-0.0436, 0.9667, 0.2522],
    left: 18.18,
    right: 19.8,
  },
  {
    parts: ["14704.dat.004", "3794b.dat.004", "11477.dat.004", "3024.dat.002", "14417.dat.003"],
    pivot: [0.9494, 1.817, 2.7693],
    axis: [-0.0436, 0.9667, 0.2522],
    left: 0,
    right: 0.45,
  },
  {
    parts: ["14704.dat", "3794b.dat", "11477.dat.003", "3024.dat.004", "14417.dat"],
    pivot: [0.9296, 1.9944, 2.4028],
    axis: [-0.0436, 0.9667, 0.2522],
    left: 0,
    right: 0,
  },
  {
    parts: ["14704.dat.001", "3794b.dat.001", "11477.dat.002", "3024.dat.005", "14417.dat.001"],
    pivot: [1.2221, 2.152, 2.1663],
    axis: [-0.0436, 0.9667, 0.2522],
    left: 13.23,
    right: 24.03,
  },
  {
    parts: ["14704.dat.002", "3794b.dat.002", "11477.dat.001", "3024.dat.006", "14417.dat.002"],
    pivot: [1.5741, 2.2903, 2.0137],
    axis: [-0.0436, 0.9667, 0.2522],
    left: 21.96,
    right: 1.35,
  },
  {
    parts: ["14704.dat.003", "3794b.dat.003", "11477.dat", "3024.dat.007", "2555.dat", "2555.dat.001", "3623.dat", "4596.dat", "48729b.dat", "53451.dat.008", "53451.dat.009", "60478.dat", "85861.dat", "85861.dat.001", "98141.dat", "98141.dat.001"],
    pivot: [1.7576, 2.4647, 1.694],
    axis: [-0.0436, 0.9667, 0.2522],
    left: 21.96,
    right: 11.79,
  },
];

/**
 * Wings: each wing hangs from the body on a Ball Joint-8 at the shoulder (22890 ball on the body, 14418
 * socket under the wing's 3933/3934 root) — and the front leg hangs from that wing root on its own ball,
 * so the shoulder carries wing and front leg together (the paw rig rides under the wing pivot).
 * Wings vertical turns both wings about the body's front–back axis (Z) through their shoulder ball,
 * Wings horizontal about the vertical axis (Y); `down` and `forward` are the directions in export space
 * that a positive angle turns the wing. Mirrored: one slider value moves both wings the same way.
 */
export const WINGS = [
  {
    label: "Left",
    pivot: [1.9994, 1.4952, 6.5935],
    down: [0, 0, -1],
    forward: [0, -1, 0],
    pawIndex: 0,
    parts: [
      "14418.dat.012", "32803.dat.001", "3710.dat.001", "3024.dat.013", "3021.dat", "32803.dat", "3933.dat",
      "3710.dat", "3024.dat.014", "32803.dat.003", "4081b.dat.012", "3024.dat.010", "4081b.dat.015",
      "3024.dat.012", "5091.dat.005", "88646.dat.001", "3070b.dat.002", "5091.dat.004", "3070b.dat.005",
      "5091.dat.010", "11477.dat.008", "63864.dat.003", "65429.dat.001", "63864.dat.004", "3024.dat.015",
      "3623.dat.001", "50305.dat", "35463.dat", "30374.dat", "4081b.dat.013", "4081b.dat.014",
      "15209.dat.003", "5091.dat.003", "3023b.dat.002", "3020.dat", "3023b.dat", "88646.dat",
      "32803.dat.002", "3623.dat.002", "35463.dat.001", "3022.dat.009", "15209.dat.001", "63864.dat.008",
      "50305.dat.001", "32803.dat.005", "5091.dat", "5091.dat.002", "5091.dat.008", "63864.dat.002",
      "63864.dat.001", "5091.dat.009", "5091.dat.011", "5091.dat.012", "15209.dat.004", "65429.dat",
      "3023b.dat.004", "4081b.dat.019", "3020.dat.002", "4081b.dat.016", "11477.dat.012", "15209.dat.007",
      "3023b.dat.005", "88646.dat.003", "14418.dat.013", "32803.dat.006", "35463.dat.002", "3024.dat.017",
      "4081b.dat.018", "3020.dat.001", "3666.dat.001", "63864.dat", "15209.dat.008", "63864.dat.007",
      "32803.dat.004", "5091.dat.014", "5091.dat.015", "5091.dat.018", "63864.dat.009", "5091.dat.016",
      "5091.dat.017", "5091.dat.019", "15209.dat.009", "65429.dat.002", "30374.dat.001", "5091.dat.001",
      "3024.dat.016", "11477.dat.009", "15209.dat.002", "43723b.dat.001", "63864.dat.006", "3020.dat.003",
      "22890.dat.012", "3023b.dat.003", "3024.dat.011", "4081b.dat.017", "5091.dat.020", "5091.dat.007",
      "54384.dat", "3069b.dat.008", "85861.dat.002", "3022.dat.008", "3666.dat", "99780.dat",
      "2431.dat.002", "5091.dat.006", "35649.dat", "50304.dat", "54383.dat", "48205.dat", "3070b.dat.003",
      "22890.dat.013", "3023b.dat.001", "3934.dat", "3069b.dat.009", "4162.dat", "5092.dat.006",
      "11477.dat.010", "63864.dat.005", "88646.dat.002", "5092.dat.004", "15209.dat.006", "5092.dat.007",
      "3069b.dat.010", "11477.dat.011", "5092.dat.005", "5092.dat.002", "5092.dat.003", "5092.dat",
      "3070b.dat.004", "5092.dat.001", "15209.dat", "5091.dat.013", "43723b.dat", "15209.dat.005",
      "3024.dat.018", "87747.dat.002", "4081b.dat.020",
    ],
  },
  {
    label: "Right",
    pivot: [1.0006, 1.4952, 6.5935],
    down: [0, 0, 1],
    forward: [0, 1, 0],
    pawIndex: 1,
    parts: [
      "14418.dat.015", "32803.dat.011", "32803.dat.013", "3024.dat.026", "3710.dat.002", "3934.dat.001",
      "3710.dat.003", "3021.dat.001", "3024.dat.027", "3024.dat.025", "4081b.dat.026", "3024.dat.019",
      "32803.dat.008", "4081b.dat.022", "88646.dat.005", "5092.dat.026", "3070b.dat.007", "3070b.dat.009",
      "63864.dat.012", "5092.dat.017", "11477.dat.015", "5092.dat.024", "65426.dat", "3024.dat.023",
      "3623.dat.004", "63864.dat.010", "50304.dat.001", "35463.dat.005", "4081b.dat.028", "30374.dat.003",
      "4081b.dat.025", "15209.dat.015", "5092.dat.008", "3020.dat.005", "3023b.dat.010", "88646.dat.006",
      "3023b.dat.011", "32803.dat.010", "3024.dat.024", "3623.dat.003", "35463.dat.004", "3022.dat.010",
      "63864.dat.011", "15209.dat.011", "63864.dat.014", "50304.dat.002", "32803.dat.007", "5092.dat.009",
      "5092.dat.015", "5092.dat.014", "5092.dat.011", "5092.dat.012", "15209.dat.010", "5092.dat.013",
      "63864.dat.013", "65426.dat.001", "3020.dat.004", "3023b.dat.006", "4081b.dat.027", "4081b.dat.023",
      "11477.dat.013", "15209.dat.014", "3020.dat.006", "3023b.dat.009", "3024.dat.022", "14418.dat.014",
      "88646.dat.004", "32803.dat.012", "30374.dat.002", "35463.dat.003", "63864.dat.018", "3024.dat.021",
      "4081b.dat.021", "3666.dat.002", "63864.dat.017", "15209.dat.013", "63864.dat.015", "32803.dat.009",
      "5092.dat.016", "5092.dat.023", "5092.dat.020", "5092.dat.019", "5092.dat.021", "15209.dat.012",
      "5092.dat.022", "63864.dat.016", "65426.dat.002", "5092.dat.010", "4081b.dat.024", "3024.dat.020",
      "11477.dat.014", "3020.dat.007", "22890.dat.014", "15209.dat.016", "43722b.dat", "3069b.dat.013",
      "54383.dat.001", "5092.dat.025", "85861.dat.003", "3023b.dat.007", "5092.dat.018", "3022.dat.011",
      "3666.dat.003", "99780.dat.001", "5092.dat.028", "2431.dat.003", "35649.dat.001", "50305.dat.002",
      "48208.dat", "54384.dat.001", "3070b.dat.008", "22890.dat.015", "3023b.dat.008", "3933.dat.001",
      "88646.dat.007", "4162.dat.001", "3069b.dat.012", "63864.dat.019", "15209.dat.019", "5091.dat.028",
      "5091.dat.027", "11477.dat.017", "5091.dat.021", "3069b.dat.011", "5091.dat.025", "5091.dat.024",
      "15209.dat.017", "11477.dat.016", "5091.dat.022", "5091.dat.023", "3070b.dat.006", "5091.dat.026",
      "15209.dat.018", "5092.dat.027", "43722b.dat.001", "3024.dat.028", "87747.dat.003", "4081b.dat.029",
    ],
  },
] as const satisfies readonly { label: string; pivot: readonly number[]; down: readonly number[]; forward: readonly number[]; pawIndex: number; parts: readonly string[] }[];

/**
 * Shoulder range, the same for both wings (the smaller side), everything else neutral. Up, forward and
 * back: to the first contact by penetration depth (> 0.25 LDU), less 0.5° — up: the wing edge meets a
 * clip on the body (41.1°; kept at 90% of that range, 36.5°); forward: the socket rim meets the ball's stem (25.2°); back: the wing meets
 * the tail (26°). Down ignores the floor (there is none on the stage): the wing, with its whole front
 * leg, drops until the wing meets the rear paw's claws (61.7°), less 0.5°.
 */
export const WING_RANGE_DEG = { down: 61.2, up: 36.5, forward: 24.7, back: 25.5 };

/** With the wings swung fully back, their upward range shrinks by this share (linearly with the back swing). */
export const WING_UP_CUT_WHEN_BACK = 0.25;

/**
 * How far the wings may swing while raised or lowered: [Wings vertical, max back, max forward], the last two
 * as shares of the Wings horizontal range (1 = the full WING_RANGE_DEG). A wing that is up or down sweeps
 * into the body, the rear legs, the tail or its own ball joint much sooner. The two sliders stop each other
 * at these limits (wingsHorizontalRange / wingsVerticalRange) — nothing moves on its own. Measured offline
 * for both wings on the full-detail and the compressed geometry (the lowest of the four), by penetration
 * depth, with the up range already cut for the back swing; less 0.03 (≈0.75°), then re-checked on a finer
 * surface sampling (each row, half its range and every midpoint between rows) and lowered where that found
 * contact. Every 0.05 of Wings vertical.
 */
export const WING_H_ENVELOPE: readonly (readonly [number, number, number])[] = [
  [-1.00, 0.00, 0.82], [-0.95, 0.10, 0.92], [-0.90, 0.19, 0.96],
  [-0.85, 0.28, 1.00], [-0.80, 0.31, 1.00], [-0.75, 0.34, 1.00],
  [-0.70, 0.37, 1.00], [-0.65, 0.37, 1.00], [-0.60, 0.35, 1.00],
  [-0.55, 0.37, 1.00], [-0.50, 0.39, 1.00], [-0.45, 0.37, 1.00],
  [-0.40, 0.39, 1.00], [-0.35, 0.44, 1.00], [-0.30, 0.58, 1.00],
  [-0.25, 0.58, 1.00], [-0.20, 0.57, 1.00], [-0.15, 0.57, 1.00],
  [-0.10, 1.00, 1.00], [-0.05, 0.96, 1.00], [0.00, 1.00, 1.00],
  [0.05, 0.98, 0.75], [0.10, 0.98, 0.70], [0.15, 0.89, 0.65],
  [0.20, 0.69, 0.60], [0.25, 0.66, 0.56], [0.30, 0.63, 0.52],
  [0.35, 0.61, 0.47], [0.40, 0.57, 0.43], [0.45, 0.55, 0.40],
  [0.50, 0.53, 0.37], [0.55, 0.50, 0.35], [0.60, 0.48, 0.33],
  [0.65, 0.46, 0.31], [0.70, 0.45, 0.31], [0.75, 0.44, 0.30],
  [0.80, 0.45, 0.29], [0.85, 0.44, 0.30], [0.90, 0.44, 0.30],
  [0.95, 0.45, 0.23], [1.00, 0.45, 0.17],
];

/** Allowed Wings horizontal range at this Wings vertical value: the tighter of the two rows around it. */
export function wingsHorizontalRange(vertical: number): { back: number; forward: number } {
  const table = WING_H_ENVELOPE;
  const v = Math.min(1, Math.max(-1, vertical));
  let i = 1;
  while (i < table.length - 1 && table[i][0] < v) i++;
  const [v1, b1, f1] = table[i];
  if (v === v1) return { back: b1, forward: f1 };
  const [v0, b0, f0] = table[i - 1];
  if (v <= v0) return { back: b0, forward: f0 };
  return { back: Math.min(b0, b1), forward: Math.min(f0, f1) };
}

/** Wings vertical range the wings can reach from neutral while swung to this Wings horizontal value. */
export function wingsVerticalRange(horizontal: number): { min: number; max: number } {
  const table = WING_H_ENVELOPE;
  const fits = (row: readonly [number, number, number]) => (horizontal < 0 ? -horizontal <= row[1] : horizontal <= row[2]);
  const zero = table.findIndex((row) => row[0] === 0);
  let max = 0;
  for (let i = zero + 1; i < table.length && fits(table[i]); i++) max = table[i][0];
  let min = 0;
  for (let i = zero - 1; i >= 0 && fits(table[i]); i--) min = table[i][0];
  return { min, max };
}

/**
 * Model state shared by the playground controls and whatever renders the model.
 * Today the 2D placeholder reads it; later the React Three Fiber scene will
 * bind the same values to the camera and the rig's head, arm and wing nodes.
 */
export type ModelState = {
  /** Unbounded orbit step; drag / arrow keys move it by ±1. */
  orbit: number;
  /** 70–180, 112 is the neutral framing. */
  zoom: number;
  /** -1 = left then up … 0 = neutral … 1 = right then down (HEAD_PATH). */
  head: number;
  /** Lower neck joint: -1 = bent down by NECK_LOWER_MAX_DEG … 0 = neutral … 1 = up by NECK_LOWER_UP_MAX_DEG. */
  neck: number;
  /** Paw curl per paw (order of PAWS): 0 = neutral … 1 = curled by PAW_MAX_DEG. */
  paws: readonly [number, number, number, number];
  /** Finger curl per paw (order of PAWS): 0 = neutral … 1 = each finger at its maxDeg. */
  fingers: readonly [number, number, number, number];
  /** -100–100 */
  armL: number;
  /** -100–100 */
  armR: number;
  /** Wings vertical: -1 = down by WING_RANGE_DEG.down … 0 = as built … 1 = up by WING_RANGE_DEG.up. */
  wings: number;
  /** Wings horizontal: -1 = back … 0 = as built … 1 = forward (WING_RANGE_DEG). */
  wingsH: number;
  /** 0 = mouth closed … 1 = open by MAX_JAW_OPEN. */
  jaw: number;
  /** Tail sway: -1 = fully to the dragon's left … 0 = as built … 1 = fully to its right. */
  tail: number;
};

export type Joint = "head" | "neck" | "jaw" | "tail" | "armL" | "armR" | "wings" | "wingsH";

export const DEFAULT_ZOOM = 112;

export const DEFAULT_MODEL_STATE: ModelState = {
  orbit: 3,
  zoom: DEFAULT_ZOOM,
  head: 0,
  armL: 0,
  armR: 0,
  wings: 0,
  wingsH: 0,
  jaw: 0,
  neck: 0,
  paws: [0, 0, 0, 0],
  fingers: [0, 0, 0, 0],
  tail: 0,
};

// Poses don't set the jaw or the head yet (their old head values were on a different
// scale); applying one leaves both where they are.
export const POSES: ({ name: string } & Omit<ModelState, "zoom" | "jaw" | "head" | "neck" | "paws" | "fingers" | "tail" | "wingsH">)[] = [
  { name: "Perched", orbit: 3, armL: 0, armR: 0, wings: 10 },
  { name: "Wings", orbit: 5, armL: 30, armR: 30, wings: 100 },
  { name: "Roar", orbit: 2, armL: -20, armR: 20, wings: 40 },
  { name: "Flight", orbit: 6, armL: 60, armR: 60, wings: 90 },
];

export const JOINT_SLIDERS: { key: Joint; label: string; min: number; max: number; step?: number }[] = [
  { key: "jaw", label: "Jaw", min: 0, max: 1, step: 0.01 },
  { key: "head", label: "Head", min: -1, max: 1, step: 0.005 },
  { key: "neck", label: "Neck", min: -1, max: 1, step: 0.005 },
  { key: "wings", label: "Wings vertical", min: -1, max: 1, step: 0.01 },
  { key: "wingsH", label: "Wings horizontal", min: -1, max: 1, step: 0.01 },
  { key: "tail", label: "Tail", min: -1, max: 1, step: 0.01 },
];

export const ZOOM_RANGE = { min: 70, max: 180 };

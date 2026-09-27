// Minimal typings for the parts of n8ao (https://github.com/N8python/n8ao) this project uses.
declare module "n8ao" {
  import type { Camera, Color, Scene } from "three";
  import { Pass } from "three/examples/jsm/postprocessing/Pass.js";

  export type N8AOQualityMode = "Performance" | "Low" | "Medium" | "High" | "Ultra";

  export class N8AOPass extends Pass {
    constructor(scene: Scene, camera: Camera, width?: number, height?: number);
    configuration: {
      aoRadius: number;
      distanceFalloff: number;
      intensity: number;
      color: Color;
      halfRes: boolean;
      gammaCorrection: boolean;
      screenSpaceRadius: boolean;
      aoSamples: number;
      denoiseSamples: number;
      denoiseRadius: number;
    };
    setQualityMode(mode: N8AOQualityMode): void;
    setSize(width: number, height: number): void;
    dispose(): void;
  }
}

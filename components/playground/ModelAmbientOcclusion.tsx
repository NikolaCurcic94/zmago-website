"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { N8AOPass } from "n8ao";
import { useEffect, useLayoutEffect, useRef } from "react";
import { Box3, Color, Vector3 } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";

/** AO reach as a share of the model's bounding-box diagonal. */
const AO_RADIUS_FRACTION = 0.015;

/**
 * Soft contact shadows where LEGO parts meet (screen-space ambient occlusion, N8AO).
 *
 * Takes over the canvas render: N8AO draws the scene once itself (replacing R3F's
 * default render, not adding a second one), then works on that image at half
 * resolution. SMAA replaces the hardware antialiasing AO can't use, and OutputPass
 * applies the renderer's existing tone mapping, exposure and sRGB output, so
 * colours and materials stay as they were. With frameloop="demand" all of this
 * only runs while the camera moves; a still view costs nothing.
 *
 * Mount it inside the model's Suspense: it is built after commit, when the model
 * is in the scene, so the AO radius can be sized from the model's own bounds.
 */
export function ModelAmbientOcclusion() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const composerRef = useRef<EffectComposer | null>(null);

  useLayoutEffect(() => {
    const ao = new N8AOPass(scene, camera);
    ao.setQualityMode("Low"); // 16 AO samples, 4 denoise samples: stable, mobile-friendly
    ao.configuration.halfRes = true;
    // Scale-aware: a small share of the model's diagonal reaches into seams and under
    // overlapping plates without haloing whole wings.
    const diagonal = new Box3().setFromObject(scene).getSize(new Vector3()).length();
    ao.configuration.aoRadius = (diagonal || 1) * AO_RADIUS_FRACTION;
    ao.configuration.distanceFalloff = 1;
    ao.configuration.intensity = 2.5; // visible seams, still soft rather than dirty
    ao.configuration.color = new Color("#0f1019"); // the stage's own deep ink, not pure black
    ao.configuration.gammaCorrection = false; // OutputPass does colour space once, at the end

    const composer = new EffectComposer(gl);
    composer.addPass(ao);
    composer.addPass(new SMAAPass());
    composer.addPass(new OutputPass());
    composerRef.current = composer;
    invalidate();

    return () => {
      composerRef.current = null;
      for (const pass of composer.passes) pass.dispose();
      composer.dispose();
    };
  }, [gl, scene, camera, invalidate]);

  useEffect(() => {
    const composer = composerRef.current;
    if (!composer) return;
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
    invalidate();
  }, [gl, size.width, size.height, invalidate]);

  // Priority 1: R3F skips its own render and lets the composer draw the frame.
  useFrame(() => {
    if (composerRef.current) composerRef.current.render();
    else gl.render(scene, camera);
  }, 1);

  return null;
}

"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { Color, LinearSRGBColorSpace, Mesh, MeshStandardMaterial, Vector3, type Material, type Object3D } from "three";
import {
  applyExportPoseFixes,
  rigFingers,
  rigHead,
  rigJaws,
  rigNeck,
  rigPaws,
  rigTail,
  rigWings,
} from "./jawRig";

/**
 * Blender's default cube, left at the root of the export. It is hidden from the
 * view only; the GLB itself is untouched. Remove it in Blender to drop this.
 */
const EXPORT_LEFTOVERS = ["Cube"];

/**
 * LEGO ABS plastic, applied in the viewer only (the GLB and Blender stay as they are).
 * The export carries no roughness (the idr_tools node doesn't survive glTF), so three.js
 * falls back to fully matte 1.0. Metalness stays 0 (Pearl Gold aside, see toGold); MeshStandardMaterial's fixed
 * dielectric F0 of 0.04 (IOR 1.5) already matches ABS (IOR ~1.54), so no physical
 * material, specular/IOR override or clearcoat is needed — clearcoat reads as wet.
 */
function plasticRoughness(materialName: string): number {
  // Textured slope tops are grainy on real bricks: keep them a little more matte.
  if (/slope/i.test(materialName)) return 0.42;
  return 0.3;
}

/**
 * Pearl Gold, a little metallic: warmer and brighter than the export's flat ochre (linear 0.60 / 0.33 / 0.02),
 * partly metal so the studio environment's highlights run across it, but mostly still its own colour, so it
 * never drops to bronze where nothing bright is reflected. The same standard material: no extra cost to draw.
 * Textured slopes stay a little rougher, as on the real bricks.
 */
const GOLD = new Color().setRGB(0.82, 0.5, 0.08, LinearSRGBColorSpace);
const GOLD_METALNESS = 0.3;
const GOLD_ENV_INTENSITY = 1.6;
const GOLD_ROUGHNESS = 0.28;
const GOLD_SLOPE_ROUGHNESS = 0.38;

function toGold(material: MeshStandardMaterial): void {
  material.color.copy(GOLD);
  material.metalness = GOLD_METALNESS;
  material.envMapIntensity = GOLD_ENV_INTENSITY;
  material.roughness = /slope/i.test(material.name) ? GOLD_SLOPE_ROUGHNESS : GOLD_ROUGHNESS;
}

/**
 * The rigged Zmago: a clone of the loaded GLB scene (geometry shared) with its own plastic copies of the
 * materials — so the cached GLB stays pristine — and every joint pivot built on it. Dispose `materials`
 * when the model is dropped.
 */
export function buildZmago(scene: Object3D) {
  const clone = scene.clone();
  for (const name of EXPORT_LEFTOVERS) clone.getObjectByName(name)?.removeFromParent();

  const copies = new Map<Material, Material>();
  const toPlastic = (source: Material): Material => {
    let copy = copies.get(source);
    if (!copy) {
      copy = source.clone();
      // Only fill in what the export left at glTF defaults; authored values win.
      if (copy instanceof MeshStandardMaterial && copy.metalness === 0 && copy.roughness === 1 && !copy.roughnessMap) {
        if (/pearl gold/i.test(copy.name)) toGold(copy);
        else copy.roughness = plasticRoughness(copy.name);
      }
      copies.set(source, copy);
    }
    return copy;
  };
  clone.traverse((object) => {
    if (object instanceof Mesh) {
      object.material = Array.isArray(object.material) ? object.material.map(toPlastic) : toPlastic(object.material);
    }
  });
  // Neck, head and jaws back in the pose their limits were measured on (see EXPORT_POSE_FIXES).
  applyExportPoseFixes(clone);
  // Mouth pivots: jnt_jaw (lower jaw) and jnt_upper_jaw (upper head), each on its own hinge,
  // then jnt_head on the neck ball joint, carrying both.
  const jaws = rigJaws(clone);
  const head = rigHead(clone, jaws);
  // jnt_neck_lower on the trunk → neck hinge, carrying both vertebrae and jnt_head.
  const neck = rigNeck(clone, head);
  // One jnt_paw_<n> per paw, on its wrist ball.
  const paws = rigPaws(clone);
  // One pivot per finger, on its clip, under its paw.
  const fingers = rigFingers(clone, paws);
  // jnt_tail_1 … jnt_tail_9, one per tail ball joint, each nested under the previous.
  const tail = rigTail(clone);
  // jnt_wing_left / jnt_wing_right on the shoulder balls, each carrying its front leg's paw pivot.
  const wings = rigWings(clone, paws);
  return { model: clone, materials: [...copies.values()], jaws, head, neck, paws, fingers, tail, wings };
}

export type ZmagoRig = ReturnType<typeof buildZmago>;

/** The Playground camera's home direction (head-side three-quarter, slightly above); the lighting is set up for it. */
export const ZMAGO_HOME_DIRECTION = new Vector3(-0.9, 0.5, 1).normalize();

/**
 * How far to turn the lighting about the vertical axis so a camera looking from `direction` sees the model lit
 * as the Playground's home view does. Lights and reflected environment turn together — it matters for the gold,
 * whose highlights depend on where the bright softboxes sit relative to the camera.
 */
export function lightingTurnFor(direction: Vector3): number {
  return Math.atan2(direction.x, direction.z) - Math.atan2(ZMAGO_HOME_DIRECTION.x, ZMAGO_HOME_DIRECTION.z);
}

/** Studio lighting for the model: brick colours stay true, undersides never drop to black. */
export function ZmagoLighting({ turn = 0 }: { turn?: number }) {
  return (
    <>
      {/* Sky/ground fill: the ground tone is a lifted cool grey so undersides never drop to black. */}
      <hemisphereLight args={["#e4e7f5", "#7a7f94", 0.45]} />
      <ambientLight intensity={0.15} />
      <group rotation-y={turn}>
        {/* Key from above the camera's home side, a rim from behind. */}
        <directionalLight position={[-6, 9, 7]} intensity={1.8} />
        {/* Neutral rim: glossy plastic mirrors its colour, and the brick colours must stay true. */}
        <directionalLight position={[6, 3, -6]} intensity={0.7} color="#e9e9ed" />
        {/* Soft bounce from below-front: keeps shape and shading on the belly and wing undersides. */}
        <directionalLight position={[2, -7, 4]} intensity={0.45} color="#cfd3e5" />
      </group>
      {/* Procedural studio environment: soft fill and highlights, no HDR download. */}
      <Environment resolution={256} environmentRotation={[0, turn, 0]}>
        {/* Narrow soft box above the camera side: the clean highlight the glossy plastic picks up. */}
        <Lightformer form="rect" intensity={1.4} position={[-3, 6, 4]} scale={[6, 1.2, 1]} />
        {/* Floor bounce card facing up, so the underside picks up reflections too. */}
        <Lightformer form="rect" intensity={0.6} position={[0, -6, 0]} rotation-x={-Math.PI / 2} scale={[12, 12, 1]} />
        <Lightformer form="rect" intensity={0.9} position={[0, 5, 5]} scale={[10, 5, 1]} />
        <Lightformer form="rect" intensity={1} position={[-5, 2, -2]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="rect" intensity={0.2} color="#968ae0" position={[5, 1, -3]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} />
      </Environment>
    </>
  );
}

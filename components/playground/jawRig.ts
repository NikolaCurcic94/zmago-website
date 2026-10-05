import { Group, MathUtils, Matrix4, PropertyBinding, Quaternion, Vector3, type Object3D } from "three";
import {
  EXPORT_POSE_FIXES,
  HEAD_MOUNT_PART_NAMES,
  HEAD_PATH,
  HEAD_PIVOT,
  HEAD_SWEEP_SIDE,
  headPathValue,
  JAW_AS_EXPORTED,
  JAW_MIN,
  JAW_PART_NAMES,
  JAW_PIVOT,
  MAX_JAW_OPEN,
  MAX_UPPER_JAW_OPEN,
  NECK_LOWER_AXIS,
  NECK_LOWER_MAX_DEG,
  NECK_LOWER_UP_MAX_DEG,
  NECK_LOWER_PART_NAMES,
  NECK_LOWER_PIVOT,
  PAW_FINGERS,
  PAW_MAX_DEG,
  PAWS,
  TAIL_DROOP_DEG,
  TAIL_JOINTS,
  WING_RANGE_DEG,
  WING_UP_CUT_WHEN_BACK,
  WINGS,
  UPPER_JAW_PART_NAMES,
  UPPER_JAW_AS_EXPORTED_DEG,
  UPPER_JAW_PIVOT,
} from "@/content/playground";

/**
 * Builds a pivot Group on a hinge and moves the given parts under it.
 * `attach()` keeps each part exactly where it was, so the geometry is untouched;
 * only the pivot turns. Call on the model
 * (a fresh clone) before it is added to the scene, while it still sits in its
 * own export space.
 *
 * Returns null — and leaves the model as it was — if any part is missing
 * (e.g. the GLB was re-exported and the names changed).
 */
function rigPivot(
  model: Object3D,
  name: string,
  partNames: readonly string[],
  pivotAt: readonly [number, number, number],
): Group | null {
  model.updateMatrixWorld(true);

  // GLTFLoader sanitises node names (the dots go), so look parts up the same way.
  const parts = partNames.map((part) => model.getObjectByName(PropertyBinding.sanitizeNodeName(part)));
  const partsRoot = parts[0]?.parent;
  if (!partsRoot || parts.some((part) => !part || part.parent !== partsRoot)) return null;

  const pivot = new Group();
  pivot.name = name;
  partsRoot.add(pivot);
  pivot.position.copy(partsRoot.worldToLocal(new Vector3(...pivotAt)));
  pivot.updateMatrixWorld(true);
  for (const part of parts) pivot.attach(part!);
  return pivot;
}

/**
 * Puts the parts listed in EXPORT_POSE_FIXES back into the pose every limit was measured on (one rigid
 * export-space transform per group). Call first, on the untouched clone, before any rig* function.
 */
export function applyExportPoseFixes(model: Object3D): void {
  model.updateMatrixWorld(true);
  const fix = new Matrix4();
  const local = new Matrix4();
  for (const { parts, quaternion, translation } of EXPORT_POSE_FIXES) {
    fix.compose(new Vector3(...translation), new Quaternion(...quaternion), new Vector3(1, 1, 1));
    for (const name of parts) {
      const part = model.getObjectByName(PropertyBinding.sanitizeNodeName(name));
      if (!part?.parent) continue;
      local.multiplyMatrices(fix, part.matrixWorld).premultiply(part.parent.matrixWorld.clone().invert());
      local.decompose(part.position, part.quaternion, part.scale);
    }
  }
  model.updateMatrixWorld(true);
}

/**
 * The two mouth pivots. Both hang from the neck on their own LEGO clip hinges,
 * so they are siblings; rigHead then puts both under `jnt_head`.
 */
export function rigJaws(model: Object3D): { lower: Group | null; upper: Group | null } {
  return {
    lower: rigPivot(model, "jnt_jaw", JAW_PART_NAMES, JAW_PIVOT),
    upper: rigPivot(model, "jnt_upper_jaw", UPPER_JAW_PART_NAMES, UPPER_JAW_PIVOT),
  };
}

// Both angles are relative to the export pose (the lower jaw sits there at jaw = JAW_AS_EXPORTED, the upper
// at UPPER_JAW_AS_EXPORTED_DEG from closed) and proportional to the same jaw value, so one slider drives both.

/** Lower jaw about +X: positive lowers it. jaw 0 → closed, 1 → MAX_JAW_OPEN from closed. */
export function lowerJawAngle(jaw: number): number {
  return MathUtils.degToRad((MathUtils.clamp(jaw, JAW_MIN, 1) - JAW_AS_EXPORTED) * MAX_JAW_OPEN);
}

/** Upper jaw about +X: negative lifts it. jaw 0 → closed, 1 → MAX_UPPER_JAW_OPEN from closed. */
export function upperJawAngle(jaw: number): number {
  return MathUtils.degToRad(-(MathUtils.clamp(jaw, JAW_MIN, 1) * MAX_UPPER_JAW_OPEN - UPPER_JAW_AS_EXPORTED_DEG));
}

export type HeadRig = {
  pivot: Group;
  /** Turns an export-space direction into the pivot's parent space (fixed at rig time). */
  toParent: Quaternion;
};

/**
 * Builds `jnt_head` on the ball joint and moves the head assembly under it: the socket
 * block that carries both jaw hinges, plus the jaw pivots themselves (with all their parts):
 *
 *   jnt_head
 *   ├── jnt_jaw
 *   └── jnt_upper_jaw
 *
 * Call after rigJaws, on the same untouched clone, before any rotation is applied.
 */
export function rigHead(model: Object3D, jaws: { lower: Group | null; upper: Group | null }): HeadRig | null {
  if (!jaws.lower || !jaws.upper) return null;
  const pivot = rigPivot(model, "jnt_head", HEAD_MOUNT_PART_NAMES, HEAD_PIVOT);
  if (!pivot) return null;
  pivot.attach(jaws.lower);
  pivot.attach(jaws.upper);
  const toParent = pivot.parent!.getWorldQuaternion(new Quaternion()).invert();
  return { pivot, toParent };
}

const swingAxis = new Vector3();

/**
 * Head orientation for a slider value -1…1: maps it onto the side parts of HEAD_PATH (headPathValue), looks it up (linear
 * between points), then tilts by θ about the axis perpendicular to the neck in
 * direction φ. A handful of float ops per call.
 */
export function headQuaternion(head: number, rig: HeadRig, target: Quaternion): Quaternion {
  const s = headPathValue(head);
  let i = 1;
  while (i < HEAD_PATH.length - 1 && HEAD_PATH[i][0] < s) i++;
  const [s0, phi0, th0] = HEAD_PATH[i - 1];
  const [s1, phi1, th1] = HEAD_PATH[i];
  const t = s1 > s0 ? MathUtils.clamp((s - s0) / (s1 - s0), 0, 1) : 0;
  const phi = MathUtils.degToRad(MathUtils.lerp(phi0, phi1, t));
  const theta = MathUtils.degToRad(MathUtils.lerp(th0, th1, t));
  // Axis in export space (X = across the head, Y = up; the neck points along +Z), then into pivot space.
  swingAxis.set(-Math.sin(phi), HEAD_SWEEP_SIDE * Math.cos(phi), 0).normalize().applyQuaternion(rig.toParent);
  return target.setFromAxisAngle(swingAxis, theta);
}

export type NeckRig = {
  pivot: Group;
  /** Hinge axis in the pivot's parent space (fixed at rig time). */
  axis: Vector3;
};

/**
 * Builds `jnt_neck_lower` on the trunk → 1st vertebra hinge and moves both neck vertebrae and
 * the head rig under it, so Head and Jaw keep working relative to the bent neck:
 *
 *   jnt_neck_lower
 *   └── jnt_head
 *       ├── jnt_jaw
 *       └── jnt_upper_jaw
 *
 * Call after rigHead, on the same untouched clone, before any rotation is applied.
 */
export function rigNeck(model: Object3D, head: HeadRig | null): NeckRig | null {
  if (!head) return null;
  const pivot = rigPivot(model, "jnt_neck_lower", NECK_LOWER_PART_NAMES, NECK_LOWER_PIVOT);
  if (!pivot) return null;
  pivot.attach(head.pivot);
  const toParent = pivot.parent!.getWorldQuaternion(new Quaternion()).invert();
  const axis = new Vector3(...NECK_LOWER_AXIS).normalize().applyQuaternion(toParent);
  return { pivot, axis };
}

/** Neck orientation for a slider value -1 (down, NECK_LOWER_MAX_DEG) … 0 … 1 (up, NECK_LOWER_UP_MAX_DEG): one rotation about the hinge. */
export function neckQuaternion(neck: number, rig: NeckRig, target: Quaternion): Quaternion {
  const v = MathUtils.clamp(neck, -1, 1);
  return target.setFromAxisAngle(rig.axis, MathUtils.degToRad(v < 0 ? -v * NECK_LOWER_MAX_DEG : -v * NECK_LOWER_UP_MAX_DEG));
}

export type PawRig = { pivot: Group; axis: Vector3 };

/** One `jnt_paw_<n>` per paw on its wrist ball (null where a paw's parts are missing). */
export function rigPaws(model: Object3D): (PawRig | null)[] {
  return PAWS.map((paw, i) => {
    const pivot = rigPivot(model, `jnt_paw_${i + 1}`, paw.parts, paw.pivot as unknown as [number, number, number]);
    if (!pivot) return null;
    const toParent = pivot.parent!.getWorldQuaternion(new Quaternion()).invert();
    const axis = new Vector3(paw.axis[0], paw.axis[1], paw.axis[2]).normalize().applyQuaternion(toParent);
    return { pivot, axis };
  });
}

/** Paw orientation for a slider value 0–1: one rotation about the wrist, 0 → PAW_MAX_DEG (toes down). */
export function pawQuaternion(value: number, rig: PawRig, target: Quaternion): Quaternion {
  return target.setFromAxisAngle(rig.axis, MathUtils.degToRad(MathUtils.clamp(value, 0, 1) * PAW_MAX_DEG));
}

export type FingerRig = { pivot: Group; axis: Vector3; maxDeg: number };

/**
 * One `jnt_paw_<n>_finger_<m>` per finger, on its clip's bar, under its paw's pivot — so curling
 * the paw carries the fingers. Call after rigPaws, on the same clone, before any rotation.
 */
export function rigFingers(model: Object3D, paws: (PawRig | null)[]): FingerRig[][] {
  return PAW_FINGERS.map((fingers, p) => {
    if (!paws[p]) return [];
    return fingers.flatMap((finger, i) => {
      const pivot = rigPivot(model, `jnt_paw_${p + 1}_finger_${i + 1}`, finger.parts, finger.pivot as unknown as [number, number, number]);
      if (!pivot) return [];
      const toParent = pivot.parent!.getWorldQuaternion(new Quaternion()).invert();
      const axis = new Vector3(finger.axis[0], finger.axis[1], finger.axis[2]).normalize().applyQuaternion(toParent);
      return [{ pivot, axis, maxDeg: finger.maxDeg }];
    });
  });
}

/** Finger orientation for a slider value 0–1: one rotation about its clip, 0 → its maxDeg (curled down). */
export function fingerQuaternion(value: number, rig: FingerRig, target: Quaternion): Quaternion {
  return target.setFromAxisAngle(rig.axis, MathUtils.degToRad(MathUtils.clamp(value, 0, 1) * rig.maxDeg));
}

/**
 * `droop`: on the first joint only, the fixed tilt that lowers the whole tail (TAIL_DROOP_DEG), in its parent's space.
 */
export type TailJointRig = { pivot: Group; axis: Vector3; left: number; right: number; droop: Quaternion | null };

/**
 * One `jnt_tail_<n>` per tail ball joint, each nested under the one before it
 * (jnt_tail_1 → … → jnt_tail_9), so turning a joint carries the rest of the tail.
 * Empty if any tail part is missing.
 */
export function rigTail(model: Object3D): TailJointRig[] {
  const pivots: Group[] = [];
  for (const [i, joint] of TAIL_JOINTS.entries()) {
    const pivot = rigPivot(model, `jnt_tail_${i + 1}`, joint.parts, joint.pivot as unknown as [number, number, number]);
    if (!pivot) return [];
    pivots.push(pivot);
  }
  for (let i = 1; i < pivots.length; i++) pivots[i - 1].attach(pivots[i]);
  // The droop turns the tail down at the body ball about a horizontal line across it: perpendicular to where the
  // tail runs (body ball → last joint, seen from above), so the tail lowers straight down without swinging aside.
  const first = new Vector3(...TAIL_JOINTS[0].pivot);
  const last = new Vector3(...TAIL_JOINTS[TAIL_JOINTS.length - 1].pivot);
  const across = new Vector3().crossVectors(last.sub(first).setY(0).normalize(), new Vector3(0, 1, 0)).normalize();
  return pivots.map((pivot, i) => {
    const { axis, left, right } = TAIL_JOINTS[i];
    const toParent = pivot.parent!.getWorldQuaternion(new Quaternion()).invert();
    const axisInParent = new Vector3(axis[0], axis[1], axis[2]).normalize().applyQuaternion(toParent);
    const droop =
      i === 0 ? new Quaternion().setFromAxisAngle(across.clone().applyQuaternion(toParent), -MathUtils.degToRad(TAIL_DROOP_DEG)) : null;
    return { pivot, axis: axisInParent, left, right, droop };
  });
}

/**
 * One tail joint for a slider value -1 (left) … 0 … 1 (right): that joint's share of the sway.
 * The first joint also carries the droop, applied after the sway: the tail sways in the lowered plane.
 */
export function tailJointQuaternion(value: number, rig: TailJointRig, target: Quaternion): Quaternion {
  const v = MathUtils.clamp(value, -1, 1);
  target.setFromAxisAngle(rig.axis, MathUtils.degToRad(v < 0 ? v * rig.left : v * rig.right));
  return rig.droop ? target.premultiply(rig.droop) : target;
}

export type WingRig = { pivot: Group; down: Vector3; forward: Vector3 };

/**
 * One `jnt_wing_<side>` per wing on its shoulder ball, carrying the wing and its front leg — the
 * paw's pivot (and so its fingers) moves under it. Call after rigPaws / rigFingers, on the same clone.
 */
export function rigWings(model: Object3D, paws: (PawRig | null)[]): (WingRig | null)[] {
  return WINGS.map((wing) => {
    const pivot = rigPivot(model, `jnt_wing_${wing.label.toLowerCase()}`, wing.parts, wing.pivot as unknown as [number, number, number]);
    if (!pivot) return null;
    const paw = paws[wing.pawIndex];
    if (paw) pivot.attach(paw.pivot);
    const toParent = pivot.parent!.getWorldQuaternion(new Quaternion()).invert();
    const axis = (v: readonly number[]) => new Vector3(v[0], v[1], v[2]).normalize().applyQuaternion(toParent);
    return { pivot, down: axis(wing.down), forward: axis(wing.forward) };
  });
}

const wingVertical = new Quaternion();

/**
 * Shoulder orientation for Wings vertical (-1 down … 1 up) and Wings horizontal (-1 back … 1 forward):
 * the vertical turn first, then the horizontal one about the body's vertical axis. The further back
 * the wings swing, the less they may rise (down to 1 − WING_UP_CUT_WHEN_BACK of the up range).
 */
export function wingQuaternion(vertical: number, horizontal: number, rig: WingRig, target: Quaternion): Quaternion {
  const v = MathUtils.clamp(vertical, -1, 1), h = MathUtils.clamp(horizontal, -1, 1);
  const up = WING_RANGE_DEG.up * (1 - WING_UP_CUT_WHEN_BACK * Math.max(0, -h));
  const downDeg = v < 0 ? -v * WING_RANGE_DEG.down : -v * up;
  const forwardDeg = h > 0 ? h * WING_RANGE_DEG.forward : h * WING_RANGE_DEG.back;
  wingVertical.setFromAxisAngle(rig.down, MathUtils.degToRad(downDeg));
  return target.setFromAxisAngle(rig.forward, MathUtils.degToRad(forwardDeg)).multiply(wingVertical);
}

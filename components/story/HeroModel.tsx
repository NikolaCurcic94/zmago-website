"use client";

/**
 * Source of the hero's animation video (public/videos/hero-loop-*): the live Zmago in the hero render's view,
 * drawn for a given moment of one seamless loop. It is not shown on the site — the hero plays the recorded
 * video (HeroVideo) — and is rendered frame by frame offline only, whenever the model or the motion changes.
 */

import { Canvas, useThree } from "@react-three/fiber";
import { Bounds, Center, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo } from "react";
import { MathUtils, NeutralToneMapping, PerspectiveCamera, Quaternion, Vector3 } from "three";
import { JAW_AS_EXPORTED, JAW_MIN, MODEL_URL, WINGS, headRangeForJaw, maxJawAtHead } from "@/content/playground";
import {
  headQuaternion,
  lowerJawAngle,
  neckQuaternion,
  tailJointQuaternion,
  upperJawAngle,
} from "@/components/playground/jawRig";
import { ModelAmbientOcclusion } from "@/components/playground/ModelAmbientOcclusion";
import { buildZmago, lightingTurnFor, ZmagoLighting, type ZmagoRig } from "@/components/playground/zmagoModel";

/** Camera direction: the hero render's front three-quarter, head on the viewer's left, a little above. */
const VIEW_DIRECTION = new Vector3(0.35, 0.45, 1).normalize();
const LIGHTING_TURN = lightingTurnFor(VIEW_DIRECTION);
/** A calm lens: the head and front paws stay in proportion and clear of the title. */
const FOV = 30;
/**
 * Framing, matched to the hero render it cross-fades from: the fit (Bounds margin; the bounds include the
 * long tail, so the fit is tighter than 1), then the picture nudged right and up by these shares of the canvas.
 */
const FIT_MARGIN = 0.62;
const SHIFT_RIGHT = 0.05;
const SHIFT_UP = 0.07;

/**
 * One loop of the idle motion, seconds. Every movement below repeats a whole number of times in it, so the
 * video's last frame runs straight into its first.
 */
export const HERO_LOOP_SECONDS = 19.5;

/**
 * Idle motion. The dragon stands: all four paws stay planted. Above them it breathes — the shoulders roll
 * and the neck lifts on each breath — the tail sways, the jaw opens now and then, and the head looks around.
 * Joint values are in Playground slider units and stay inside the same limits; the shoulder roll was checked
 * for contact up to 5°.
 */
const BREATH_PERIOD = HERO_LOOP_SECONDS / 3;
const NECK_BREATH = 0.05;
/**
 * Shoulders, degrees each way. Each front leg hangs from its wing's shoulder, so the shoulder turns about the
 * line through the shoulder ball and the wrist: the wrist lies on that line and so stays put, and the paw is
 * turned back by the same angle, so it does not move at all. The wings and the upper leg roll with the breath.
 */
const SHOULDER_ROLL_DEG = 2.8;
/**
 * Toes, degrees: each finger lifts a little off the floor and settles back, out of step with the others.
 * Fingers only ever lift (their curl goes down, into the floor), so the claws never sink below where they
 * stand; checked for contact up to 8°.
 */
const FINGER_LIFT_DEG = 5;
const FINGER_PERIOD = HERO_LOOP_SECONDS / 4;
/**
 * Tail: a slow wave running from the body to the tip, like a snake's — each joint follows the one before it
 * TAIL_WAVE_LAG (radians of the cycle) later, so the tail bends in a travelling S rather than swinging as one
 * piece. Checked for contact with the body, the wings and its own segments over the whole cycle, up to 0.35 / 0.7.
 */
const TAIL_SWAY = 0.24;
const TAIL_PERIOD = HERO_LOOP_SECONDS / 2;
const TAIL_WAVE_LAG = 0.55;
/**
 * The hero model rests in the pose of the hero render it cross-fades from — the previous export (see
 * EXPORT_POSE_FIXES): the tail as it was then, so neither lowered (TAIL_DROOP_DEG is the Playground's) nor
 * re-posed. Degrees per tail joint that undo the re-pose (+ = to the dragon's right; see TAIL_JOINTS).
 * Checked for contact at rest and through the whole wave around it, up to 0.35.
 */
const TAIL_RENDER_POSE_DEG = [9.036, -9.12, 0, 0, 0, 0, 0, 9.35, 0];
/**
 * The mouth: open as in the render at the start of the loop (the jaw as exported, so the cross-fade from the
 * still render matches), held, then closing softly to JAW_REST; halfway through the loop it opens a little
 * again (to JAW_OPEN). Each opening is a plateau: held for its `hold`, eased in and out over `ramp` seconds.
 */
const JAW_REST = 0.2;
const JAW_OPENINGS = [
  { at: 0, peak: JAW_AS_EXPORTED, hold: 2.4, ramp: 1.6 },
  { at: HERO_LOOP_SECONDS / 2, peak: 0.45, hold: 0.5, ramp: 1.3 },
];
/** Looking around: two slow sways (one and two per loop), starting from the render's straight-ahead head. */
const HEAD_DRIFT = 0.3;
const HEAD_DRIFT_DETAIL = 0.08;

/** Shortest signed distance from `at` to `t` around the loop. */
function loopOffset(t: number, at: number): number {
  const d = (((t - at) % HERO_LOOP_SECONDS) + HERO_LOOP_SECONDS) % HERO_LOOP_SECONDS;
  return d > HERO_LOOP_SECONDS / 2 ? d - HERO_LOOP_SECONDS : d;
}

/** 1 within `hold` around `at`, easing (smoothstep) to 0 over `ramp` either side, 0 elsewhere. */
function plateau(t: number, at: number, hold: number, ramp: number): number {
  const d = Math.abs(loopOffset(t, at)) - hold / 2;
  if (d <= 0) return 1;
  if (d >= ramp) return 0;
  const x = 1 - d / ramp;
  return x * x * (3 - 2 * x);
}

type HeroModelProps = {
  /** Moment of the loop to draw, seconds (0 … HERO_LOOP_SECONDS). */
  time: number;
  /** Device pixel ratio of the drawing buffer (the recording renders larger than it plays, for clean edges). */
  dpr?: number;
  /** Called once the model is in and framed (first frame drawn). */
  onReady?: () => void;
};

/** The hero's Zmago at one moment of its idle loop. Draws only when `time` changes. */
export default function HeroModel({ time, dpr = 1, onReady }: HeroModelProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={dpr}
      camera={{ fov: FOV, near: 0.1, far: 1000, position: VIEW_DIRECTION.clone().multiplyScalar(10).toArray() }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        // As in the Playground: neutral tone mapping, slightly under 1 so near-white bricks keep their shading.
        gl.toneMapping = NeutralToneMapping;
        gl.toneMappingExposure = 0.85;
      }}
      aria-hidden="true"
    >
      {/* Lit as the Playground's home view is, turned to this camera (the gold's highlights follow). */}
      <ZmagoLighting turn={LIGHTING_TURN} />
      <Suspense fallback={null}>
        <Bounds fit clip margin={FIT_MARGIN}>
          <Center>
            <IdleDragon time={time} onReady={onReady} />
          </Center>
        </Bounds>
        <ModelAmbientOcclusion />
      </Suspense>
      <FramingShift />
    </Canvas>
  );
}

function IdleDragon({ time, onReady }: { time: number; onReady?: () => void }) {
  const { scene } = useGLTF(MODEL_URL);
  const invalidate = useThree((s) => s.invalidate);
  const rig = useMemo(() => {
    const built = buildZmago(scene);
    // The render's tail is not lowered: drop the Playground's droop on this (hero-only) rig.
    for (const joint of built.tail) joint.droop = null;
    return built;
  }, [scene]);
  // Each tail joint's turn into the render's pose, applied under the wave.
  const tailRenderPose = useMemo(
    () => rig.tail.map((joint, k) => new Quaternion().setFromAxisAngle(joint.axis, MathUtils.degToRad(TAIL_RENDER_POSE_DEG[k] ?? 0))),
    [rig],
  );
  useEffect(() => () => rig.materials.forEach((material) => material.dispose()), [rig]);
  const shoulders = useMemo(() => shoulderRolls(rig), [rig]);
  const q = useMemo(() => new Quaternion(), []);

  // Ready once the model has been framed and drawn (two frames after mount).
  useEffect(() => {
    if (!onReady) return;
    let second = 0;
    const first = requestAnimationFrame(() => (second = requestAnimationFrame(onReady)));
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [onReady]);

  // Pose for `time`, then one redraw.
  useEffect(() => {
    const t = time;
    const { jaws, head: headRig, neck, tail } = rig;
    const turn = (period: number) => (t / period) * Math.PI * 2;
    const breath = Math.sin(turn(BREATH_PERIOD));

    let jaw = JAW_REST;
    for (const { at, peak, hold, ramp } of JAW_OPENINGS) jaw += (peak - JAW_REST) * plateau(t, at, hold, ramp);

    // Head: looking around; same joint limits as the Playground sliders (the open jaw clears the neck).
    const drift = Math.sin(turn(HERO_LOOP_SECONDS)) * HEAD_DRIFT + Math.sin(turn(HERO_LOOP_SECONDS / 2)) * HEAD_DRIFT_DETAIL;
    const range = headRangeForJaw(jaw);
    const headValue = Math.min(range.max, Math.max(range.min, drift));
    jaw = Math.max(JAW_MIN, Math.min(jaw, maxJawAtHead(headValue)));

    jaws.lower?.rotation.set(lowerJawAngle(jaw), 0, 0);
    jaws.upper?.rotation.set(upperJawAngle(jaw), 0, 0);
    if (headRig) headRig.pivot.quaternion.copy(headQuaternion(headValue, headRig, q));
    if (neck) neck.pivot.quaternion.copy(neckQuaternion(breath * NECK_BREATH, neck, q));
    const tailPhase = turn(TAIL_PERIOD);
    tail.forEach((joint, k) =>
      joint.pivot.quaternion.copy(
        tailJointQuaternion(Math.sin(tailPhase - k * TAIL_WAVE_LAG) * TAIL_SWAY, joint, q).multiply(tailRenderPose[k]),
      ),
    );
    // Toes: a soft lift and settle per finger, each paw and each finger on its own phase.
    rig.fingers.forEach((pawFingers, p) =>
      pawFingers.forEach((finger, f) => {
        const wave = 0.5 - 0.5 * Math.cos(turn(FINGER_PERIOD) + p * 1.7 + f * 0.9);
        finger.pivot.quaternion.setFromAxisAngle(finger.axis, -MathUtils.degToRad(FINGER_LIFT_DEG * wave * wave));
      }),
    );
    // Shoulders roll with the breath (mirrored), the paws turned back by the same angle: they stay planted.
    for (const { wing, paw, axis, side } of shoulders) {
      wing.quaternion.setFromAxisAngle(axis, MathUtils.degToRad(breath * SHOULDER_ROLL_DEG * side));
      paw.quaternion.copy(wing.quaternion).invert();
    }
    invalidate();
  }, [time, rig, tailRenderPose, shoulders, q, invalidate]);

  return <primitive object={rig.model} />;
}

/**
 * Per front leg: the wing's shoulder pivot, its paw's pivot, and the shoulder–wrist line (in the shoulder
 * pivot's parent space) the shoulder rolls about. Turning about a line through the wrist leaves the wrist
 * where it is; the paw, a child of the shoulder, then only needs the inverse turn to stay exactly in place.
 * `side` mirrors the roll, so both shoulders breathe the same way.
 */
function shoulderRolls(rig: ZmagoRig) {
  rig.model.updateMatrixWorld(true);
  return WINGS.flatMap((wing, i) => {
    const shoulder = rig.wings[i]?.pivot;
    const paw = rig.paws[wing.pawIndex]?.pivot;
    if (!shoulder || !paw || !shoulder.parent) return [];
    const toParent = shoulder.parent.getWorldQuaternion(new Quaternion()).invert();
    const axis = paw
      .getWorldPosition(new Vector3())
      .sub(shoulder.getWorldPosition(new Vector3()))
      .normalize()
      .applyQuaternion(toParent);
    return [{ wing: shoulder, paw, axis, side: i === 0 ? 1 : -1 }];
  });
}

/** Moves the picture (camera view offset) by SHIFT_RIGHT / SHIFT_UP; the fit itself is untouched. */
function FramingShift() {
  const camera = useThree((s) => s.camera);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    camera.setViewOffset(width, height, -width * SHIFT_RIGHT, height * SHIFT_UP, width, height);
    return () => camera.clearViewOffset();
  }, [camera, width, height]);
  return null;
}

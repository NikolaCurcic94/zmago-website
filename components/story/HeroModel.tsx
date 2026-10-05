"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bounds, Center, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
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
/** Redraws per second while the hero is on screen; idle motion is slow, so 30 is plenty. */
const FPS = 30;

/**
 * Idle motion. The dragon stands: all four paws stay planted. Above them it breathes — the shoulders roll
 * and the neck lifts on each breath — the tail sways, the jaw opens now and then, and the head turns towards
 * the cursor (or looks around on its own while the cursor is still). Joint values are in Playground slider
 * units and stay inside the same limits; the shoulder roll was checked for contact up to 5°.
 */
const BREATH_PERIOD = 6.5;
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
const FINGER_PERIOD = 4.6;
/**
 * Tail: a slow wave running from the body to the tip, like a snake's — each joint follows the one before it
 * TAIL_WAVE_LAG (radians of the cycle) later, so the tail bends in a travelling S rather than swinging as one
 * piece. Checked for contact with the body, the wings and its own segments over the whole cycle, up to 0.35 / 0.7.
 */
const TAIL_SWAY = 0.24;
const TAIL_PERIOD = 11;
const TAIL_WAVE_LAG = 0.55;
/**
 * The hero model rests in the pose of the hero render it cross-fades from — the previous export (see
 * EXPORT_POSE_FIXES): the tail as it was then, so neither lowered (TAIL_DROOP_DEG is the Playground's) nor
 * re-posed. Degrees per tail joint that undo the re-pose (+ = to the dragon's right; see TAIL_JOINTS).
 * Checked for contact at rest and through the whole wave around it, up to 0.35.
 */
const TAIL_RENDER_POSE_DEG = [9.036, -9.12, 0, 0, 0, 0, 0, 9.35, 0];
/**
 * The mouth: open as in the render when the model appears (the jaw as exported), held for JAW_HOLD seconds,
 * then closing softly over JAW_CLOSE seconds to JAW_REST. From then on it opens a little now and then (to
 * JAW_OPEN), the first time JAW_FIRST_OPEN seconds after it has closed.
 */
const JAW_RENDER = JAW_AS_EXPORTED;
const JAW_HOLD = 3.5;
const JAW_CLOSE = 1.6;
const JAW_FIRST_OPEN = 4;
const JAW_REST = 0.2;
const JAW_OPEN = 0.45;
const JAW_PERIOD = 9;
/** Share of each JAW_PERIOD the mouth spends opening and closing again. */
const JAW_OPEN_SHARE = 0.32;
const HEAD_FOLLOW = 0.7;
/** Looking around while the cursor is still: two slow, unrelated sways, so it never reads as a loop. */
const HEAD_DRIFT = 0.35;
const HEAD_DRIFT_DETAIL = 0.08;
/** The head keeps following the cursor this long after it last moved, then drifts on its own again. */
const FOLLOW_HOLD = 4;

type HeroModelProps = {
  /** The hero is on screen: animate. Off screen nothing is drawn at all. */
  active: boolean;
  /** Called once the model is in and framed (first frame drawn), so the hero can cross-fade to it. */
  onReady: () => void;
};

/** The hero's live Zmago: no controls, just a slow idle and a head that follows the cursor. */
export default function HeroModel({ active, onReady }: HeroModelProps) {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ fov: FOV, near: 0.1, far: 1000, position: VIEW_DIRECTION.clone().multiplyScalar(10).toArray() }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power", }}
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
            <IdleDragon onReady={onReady} />
          </Center>
        </Bounds>
        <ModelAmbientOcclusion />
      </Suspense>
      <Ticker active={active} />
      <FramingShift />
    </Canvas>
  );
}

/** Asks for a frame FPS times a second while active (frameloop="demand": nothing renders otherwise). */
function Ticker({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (!active) return;
    let id = 0;
    let last = 0;
    const tick = (now: number) => {
      if (now - last >= 1000 / FPS - 2) {
        last = now;
        invalidate();
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [active, invalidate]);
  return null;
}

function IdleDragon({ onReady }: { onReady: () => void }) {
  const { scene } = useGLTF(MODEL_URL);
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

  // Cursor across the window, -1 (left edge) … 1 (right edge), and when it last moved.
  const pointer = useRef({ x: 0, movedAt: -Infinity });
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.movedAt = performance.now() / 1000;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Ready once the model has been framed and drawn (two frames after mount).
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => (second = requestAnimationFrame(onReady)));
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [onReady]);

  const q = useMemo(() => new Quaternion(), []);
  const head = useRef(0);
  const lastTime = useRef<number | null>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const dt = lastTime.current === null ? 0 : Math.min(0.1, t - lastTime.current);
    lastTime.current = t;
    const { jaws, head: headRig, neck, tail } = rig;
    const breath = Math.sin((t / BREATH_PERIOD) * Math.PI * 2);

    // Jaw: open as in the render, closing softly (smoothstep) after the hold; then a soft opening at the start
    // of each JAW_PERIOD (eased in and out), shut to JAW_REST otherwise.
    const closing = Math.min(1, Math.max(0, (t - JAW_HOLD) / JAW_CLOSE));
    const settled = JAW_RENDER + (JAW_REST - JAW_RENDER) * closing * closing * (3 - 2 * closing);
    const idle = t - (JAW_HOLD + JAW_CLOSE + JAW_FIRST_OPEN);
    const phase = idle > 0 ? (idle % JAW_PERIOD) / JAW_PERIOD : 1;
    const bump = phase < JAW_OPEN_SHARE ? Math.sin((phase / JAW_OPEN_SHARE) * Math.PI) ** 2 : 0;
    let jaw = settled + (JAW_OPEN - JAW_REST) * bump;

    // Head: towards the cursor while it moves, otherwise looking around; eased, never snapping.
    const following = performance.now() / 1000 - pointer.current.movedAt < FOLLOW_HOLD;
    const target = following
      ? pointer.current.x * HEAD_FOLLOW
      : Math.sin(t * 0.17) * HEAD_DRIFT + Math.sin(t * 0.53 + 1.3) * HEAD_DRIFT_DETAIL;
    head.current += (target - head.current) * (1 - Math.exp(-dt * 1.5));
    // Same joint limits as the Playground sliders: the head stays where the open jaw clears the neck.
    const range = headRangeForJaw(jaw);
    const headValue = Math.min(range.max, Math.max(range.min, head.current));
    jaw = Math.max(JAW_MIN, Math.min(jaw, maxJawAtHead(headValue)));

    jaws.lower?.rotation.set(lowerJawAngle(jaw), 0, 0);
    jaws.upper?.rotation.set(upperJawAngle(jaw), 0, 0);
    if (headRig) headRig.pivot.quaternion.copy(headQuaternion(headValue, headRig, q));
    if (neck) neck.pivot.quaternion.copy(neckQuaternion(breath * NECK_BREATH, neck, q));
    const tailPhase = (t / TAIL_PERIOD) * Math.PI * 2;
    tail.forEach((joint, k) =>
      joint.pivot.quaternion.copy(
        tailJointQuaternion(Math.sin(tailPhase - k * TAIL_WAVE_LAG) * TAIL_SWAY, joint, q).multiply(tailRenderPose[k]),
      ),
    );
    // Toes: a soft lift and settle per finger, each paw and each finger on its own phase.
    rig.fingers.forEach((pawFingers, p) =>
      pawFingers.forEach((finger, f) => {
        const wave = 0.5 - 0.5 * Math.cos((t / FINGER_PERIOD) * Math.PI * 2 + p * 1.7 + f * 0.9);
        finger.pivot.quaternion.setFromAxisAngle(finger.axis, -MathUtils.degToRad(FINGER_LIFT_DEG * wave * wave));
      }),
    );
    // Shoulders roll with the breath (mirrored), the paws turned back by the same angle: they stay planted.
    for (const { wing, paw, axis, side } of shoulders) {
      wing.quaternion.setFromAxisAngle(axis, MathUtils.degToRad(breath * SHOULDER_ROLL_DEG * side));
      paw.quaternion.copy(wing.quaternion).invert();
    }
  });

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

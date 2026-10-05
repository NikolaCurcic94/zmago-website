"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Bounds, Center, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import { Component, Suspense, memo, useEffect, useMemo, useState, type ReactNode } from "react";
import { NeutralToneMapping, PerspectiveCamera, Quaternion, Vector3 } from "three";
import { MODEL_URL } from "@/content/playground";
import { createValueStore, type ValueStore } from "@/lib/valueStore";
import {
  fingerQuaternion,
  headQuaternion,
  lowerJawAngle,
  neckQuaternion,
  pawQuaternion,
  tailJointQuaternion,
  wingQuaternion,
  upperJawAngle,
} from "./jawRig";
import { ModelAmbientOcclusion } from "./ModelAmbientOcclusion";
import { buildZmago, ZmagoLighting } from "./zmagoModel";
import { ViewerStatus } from "./ViewerStatus";
import styles from "./ModelViewer.module.scss";

/** Direction the camera looks from on first load and after a reset (head-side three-quarter, slightly above). */
const HOME_DIRECTION = new Vector3(-0.9, 0.5, 1).normalize();

/** The part of OrbitControls this file uses. */
type OrbitControlsLike = { target: Vector3; update: () => void };

/**
 * Framing after load. The fit is tighter than the model's full bounds (they include the long tail and the
 * wings' reach, so a full fit leaves the dragon small), and the picture is nudged left and up by these
 * shares of the canvas: the head end is the visually heavy one and the paws hang low, so the bounds centre
 * sits right of and below where the eye puts the dragon's middle.
 */
const FIT_MARGIN = 0.8;
const SHIFT_LEFT = 0.06;
const SHIFT_UP = 0.085;

/** Arrow keys orbit by this much. */
const KEY_ORBIT_STEP = Math.PI / 12;

useGLTF.preload(MODEL_URL);

type ModelViewerProps = {
  /** Lower jaw, 0 = closed … 1 = fully open. */
  jaw: number;
  /** Head joint, -1 = fully left … 0 = neutral … 1 = fully right (headPathValue). */
  head: number;
  /** Lower neck joint, -1 = bent fully down … 0 = neutral … 1 = bent fully up. */
  neck: number;
  /** Paw curl per paw (order of PAWS), 0 = neutral … 1 = curled fully. */
  paws: readonly number[];
  /** Finger curl per paw (order of PAWS), 0 = neutral … 1 = curled fully. */
  fingers: readonly number[];
  /** Tail sway, -1 = left … 0 = as built … 1 = right. */
  tail: number;
  /** Wings vertical, -1 = down … 0 = as built … 1 = up. */
  wings: number;
  /** Wings horizontal, -1 = back … 0 = as built … 1 = forward. */
  wingsH: number;
  /** Pixels at the bottom of the canvas covered by UI (the control panel on larger screens). */
  bottomInset?: number;
};

/** Full 3D view of the Zmago GLB: orbit, zoom and pan, plus every rigged joint. */
export default function ModelViewer({ jaw, head, neck, paws, fingers, tail, wings, wingsH, bottomInset = 0 }: ModelViewerProps) {
  // Joint values reach the scene through stores, not as props: re-rendering
  // <Canvas> would re-measure it and make <Bounds observe> refit (zoom) the camera.
  const [jawStore] = useState(() => createValueStore(jaw));
  const [headStore] = useState(() => createValueStore(head));
  useEffect(() => jawStore.set(jaw), [jawStore, jaw]);
  const [neckStore] = useState(() => createValueStore(neck));
  useEffect(() => headStore.set(head), [headStore, head]);
  const [pawsStore] = useState(() => createValueStore(paws));
  const [fingersStore] = useState(() => createValueStore(fingers));
  useEffect(() => neckStore.set(neck), [neckStore, neck]);
  useEffect(() => pawsStore.set(paws), [pawsStore, paws]);
  useEffect(() => fingersStore.set(fingers), [fingersStore, fingers]);
  const [tailStore] = useState(() => createValueStore(tail));
  useEffect(() => tailStore.set(tail), [tailStore, tail]);
  // Both wing sliders drive one shoulder rotation, so they share a store.
  const [wingsStore] = useState(() => createValueStore<readonly [number, number]>([wings, wingsH]));
  useEffect(() => wingsStore.set([wings, wingsH]), [wingsStore, wings, wingsH]);
  const [insetStore] = useState(() => createValueStore(bottomInset));
  useEffect(() => insetStore.set(bottomInset), [insetStore, bottomInset]);

  return (
    <ViewerScene
      jawStore={jawStore}
      headStore={headStore}
      neckStore={neckStore}
      pawsStore={pawsStore}
      fingersStore={fingersStore}
      tailStore={tailStore}
      wingsStore={wingsStore}
      insetStore={insetStore}
    />
  );
}

/** Memoised: the canvas never re-renders; joint values arrive through the stores. */
const ViewerScene = memo(function ViewerScene({
  jawStore,
  headStore,
  neckStore,
  pawsStore,
  fingersStore,
  tailStore,
  wingsStore,
  insetStore,
}: {
  jawStore: ValueStore<number>;
  headStore: ValueStore<number>;
  neckStore: ValueStore<number>;
  pawsStore: ValueStore<readonly number[]>;
  fingersStore: ValueStore<readonly number[]>;
  tailStore: ValueStore<number>;
  wingsStore: ValueStore<readonly [number, number]>;
  insetStore: ValueStore<number>;
}) {
  return (
    <div className={styles["model-viewer"]}>
      <ModelErrorBoundary>
        <Canvas
          frameloop="demand"
          dpr={[1, 2]}
          camera={{ fov: 35, near: 0.1, far: 1000, position: HOME_DIRECTION.clone().multiplyScalar(10).toArray() }}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => {
            // Neutral keeps the brick colours (blue, pearl gold) truer than ACES.
            gl.toneMapping = NeutralToneMapping;
            // Slightly under 1 so near-white bricks keep their shading instead of glowing.
            gl.toneMappingExposure = 0.85;
          }}
        >
          <ZmagoLighting />
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={FIT_MARGIN}>
              <Center>
                <Dragon
                  jawStore={jawStore}
                  headStore={headStore}
                  neckStore={neckStore}
                  pawsStore={pawsStore}
                  fingersStore={fingersStore}
                  tailStore={tailStore}
                  wingsStore={wingsStore}
                />
              </Center>
            </Bounds>
            {/* Soft contact shadows at the joints between parts; mounts once the model is in. */}
            <ModelAmbientOcclusion />
          </Suspense>
          <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
          <KeyboardOrbit />
          <FramingOffset insetStore={insetStore} />
        </Canvas>
        <LoadingLabel />
      </ModelErrorBoundary>
    </div>
  );
});

function Dragon({
  jawStore,
  headStore,
  neckStore,
  pawsStore,
  fingersStore,
  tailStore,
  wingsStore,
}: {
  jawStore: ValueStore<number>;
  headStore: ValueStore<number>;
  neckStore: ValueStore<number>;
  pawsStore: ValueStore<readonly number[]>;
  fingersStore: ValueStore<readonly number[]>;
  tailStore: ValueStore<number>;
  wingsStore: ValueStore<readonly [number, number]>;
}) {
  const { scene } = useGLTF(MODEL_URL);
  const invalidate = useThree((s) => s.invalidate);
  // A rigged clone with its own plastic materials, so the cached GLB stays pristine.
  const { model, materials, jaws, head, neck, paws, fingers, tail, wings } = useMemo(() => buildZmago(scene), [scene]);

  useEffect(() => () => materials.forEach((material) => material.dispose()), [materials]);

  // One jaw value turns both pivots about their hinges. It depends on the Jaw slider only —
  // moving the head never moves the jaw (the sliders themselves keep the pair collision-free).
  // Written straight to the objects (no React render); with frameloop="demand" that is one
  // redraw per change.
  useEffect(() => {
    const { lower, upper } = jaws;
    const apply = () => {
      const jaw = jawStore.get();
      lower?.rotation.set(lowerJawAngle(jaw), 0, 0);
      upper?.rotation.set(upperJawAngle(jaw), 0, 0);
      invalidate();
    };
    apply();
    return jawStore.subscribe(apply);
  }, [jaws, jawStore, invalidate]);

  // The head value moves jnt_head along its path; the jaws ride along as its children.
  useEffect(() => {
    if (!head) return;
    const orientation = new Quaternion();
    const apply = () => {
      head.pivot.quaternion.copy(headQuaternion(headStore.get(), head, orientation));
      invalidate();
    };
    apply();
    return headStore.subscribe(apply);
  }, [head, headStore, invalidate]);

  // The neck value bends jnt_neck_lower; the head rig (and jaws) ride along as its children.
  useEffect(() => {
    if (!neck) return;
    const orientation = new Quaternion();
    const apply = () => {
      neck.pivot.quaternion.copy(neckQuaternion(neckStore.get(), neck, orientation));
      invalidate();
    };
    apply();
    return neckStore.subscribe(apply);
  }, [neck, neckStore, invalidate]);

  // Each paw curls about its own wrist.
  useEffect(() => {
    const orientation = new Quaternion();
    const apply = () => {
      const values = pawsStore.get();
      paws.forEach((paw, i) => paw?.pivot.quaternion.copy(pawQuaternion(values[i] ?? 0, paw, orientation)));
      invalidate();
    };
    apply();
    return pawsStore.subscribe(apply);
  }, [paws, pawsStore, invalidate]);

  // Each paw's fingers curl together about their own clips.
  useEffect(() => {
    const orientation = new Quaternion();
    const apply = () => {
      const values = fingersStore.get();
      fingers.forEach((pawFingers, p) =>
        pawFingers.forEach((finger) => finger.pivot.quaternion.copy(fingerQuaternion(values[p] ?? 0, finger, orientation))),
      );
      invalidate();
    };
    apply();
    return fingersStore.subscribe(apply);
  }, [fingers, fingersStore, invalidate]);

  // The tail sways as one curve: every joint turns by its own share of the slider. It never moves on its own:
  // the Tail and Wings horizontal sliders stop each other where they would collide (PlaygroundStage).
  useEffect(() => {
    const orientation = new Quaternion();
    const apply = () => {
      const value = tailStore.get();
      tail.forEach((joint) => joint.pivot.quaternion.copy(tailJointQuaternion(value, joint, orientation)));
      invalidate();
    };
    apply();
    return tailStore.subscribe(apply);
  }, [tail, tailStore, invalidate]);

  // Both wings turn at the shoulder by the same vertical / horizontal amounts (mirrored axes).
  useEffect(() => {
    const orientation = new Quaternion();
    const apply = () => {
      const [vertical, horizontal] = wingsStore.get();
      wings.forEach((wing) => wing?.pivot.quaternion.copy(wingQuaternion(vertical, horizontal, wing, orientation)));
      invalidate();
    };
    apply();
    return wingsStore.subscribe(apply);
  }, [wings, wingsStore, invalidate]);

  return <primitive object={model} />;
}

/**
 * Shifts the rendered picture (camera view offset) so the model sits in the middle of the part of the
 * canvas left free by the UI, nudged by SHIFT_LEFT / SHIFT_UP. Only the image moves: the orbit still turns
 * about the model's centre, and the fit is untouched.
 */
function FramingOffset({ insetStore }: { insetStore: ValueStore<number> }) {
  const camera = useThree((s) => s.camera);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const apply = () => {
      camera.setViewOffset(width, height, width * SHIFT_LEFT, insetStore.get() / 2 + height * SHIFT_UP, width, height);
      invalidate();
    };
    apply();
    const off = insetStore.subscribe(apply);
    return () => {
      off();
      camera.clearViewOffset();
    };
  }, [camera, width, height, insetStore, invalidate]);

  return null;
}

/** Makes the canvas focusable and lets ←/→ orbit around the model. */
function KeyboardOrbit() {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsLike | null;
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.setAttribute("tabindex", "0");
    canvas.setAttribute("role", "img");
    canvas.setAttribute(
      "aria-label",
      "3D model of Zmago. Drag to orbit, scroll to zoom, right-drag to pan; left and right arrow keys also orbit.",
    );

    const onKeyDown = (event: KeyboardEvent) => {
      if (!controls || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
      event.preventDefault();
      const angle = event.key === "ArrowLeft" ? -KEY_ORBIT_STEP : KEY_ORBIT_STEP;
      const offset = camera.position.clone().sub(controls.target).applyAxisAngle(camera.up, angle);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      invalidate();
    };
    canvas.addEventListener("keydown", onKeyDown);
    return () => canvas.removeEventListener("keydown", onKeyDown);
  }, [gl, camera, controls, invalidate]);

  return null;
}

/** Progress while the GLB streams in; unmounts itself once everything has loaded. */
function LoadingLabel() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return <ViewerStatus>Loading model {Math.round(progress)}%</ViewerStatus>;
}

class ModelErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return <ViewerStatus>The model could not be loaded</ViewerStatus>;
    return this.props.children;
  }
}

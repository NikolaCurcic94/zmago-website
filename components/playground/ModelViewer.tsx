"use client";

import { Canvas, useThree } from "@react-three/fiber";
import {
  Bounds,
  Center,
  Environment,
  Lightformer,
  OrbitControls,
  useBounds,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import { Component, Suspense, memo, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Mesh, MeshStandardMaterial, NeutralToneMapping, Quaternion, Vector3, type Material } from "three";
import { MODEL_URL } from "@/content/playground";
import { createValueStore, type ValueStore } from "@/lib/valueStore";
import {
  fingerQuaternion,
  headQuaternion,
  lowerJawAngle,
  neckQuaternion,
  pawQuaternion,
  rigHead,
  rigJaws,
  rigNeck,
  rigFingers,
  rigPaws,
  rigTail,
  rigWings,
  tailJointQuaternion,
  wingQuaternion,
  upperJawAngle,
} from "./jawRig";
import { ModelAmbientOcclusion } from "./ModelAmbientOcclusion";
import { ViewerStatus } from "./ViewerStatus";
import styles from "./ModelViewer.module.scss";

/** Direction the camera looks from on first load and after a reset (head-side three-quarter, slightly above). */
const HOME_DIRECTION = new Vector3(-0.9, 0.5, 1).normalize();
/**
 * Blender's default cube, left at the root of the export. It is hidden from the
 * view only; the GLB itself is untouched. Remove it in Blender to drop this.
 */
const EXPORT_LEFTOVERS = ["Cube"];
/**
 * LEGO ABS plastic, applied in the viewer only (the GLB and Blender stay as they are).
 * The export carries no roughness (the idr_tools node doesn't survive glTF), so three.js
 * falls back to fully matte 1.0. Metalness stays 0; MeshStandardMaterial's fixed
 * dielectric F0 of 0.04 (IOR 1.5) already matches ABS (IOR ~1.54), so no physical
 * material, specular/IOR override or clearcoat is needed — clearcoat reads as wet.
 */
function plasticRoughness(materialName: string): number {
  // Textured slope tops are grainy on real bricks: keep them a little more matte.
  if (/slope/i.test(materialName)) return 0.42;
  // Pearl Gold is a smooth pearlescent finish: a touch glossier, still not metal.
  if (/pearl gold/i.test(materialName)) return 0.28;
  return 0.3;
}

/** The part of OrbitControls this file uses. */
type OrbitControlsLike = { target: Vector3; update: () => void };

/** Arrow keys orbit by this much. */
const KEY_ORBIT_STEP = Math.PI / 12;

useGLTF.preload(MODEL_URL);

type ModelViewerProps = {
  /** Increment to send the camera back to its home framing. */
  resetSignal: number;
  /** Lower jaw, 0 = closed … 1 = fully open. */
  jaw: number;
  /** Head joint, -1 = left then up … 0 = neutral … 1 = right then down (HEAD_PATH). */
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
};

/** Full 3D view of the Zmago GLB: orbit, zoom and pan, plus the head and mouth joints. */
export default function ModelViewer({ resetSignal, jaw, head, neck, paws, fingers, tail, wings, wingsH }: ModelViewerProps) {
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

  return (
    <ViewerScene
      resetSignal={resetSignal}
      jawStore={jawStore}
      headStore={headStore}
      neckStore={neckStore}
      pawsStore={pawsStore}
      fingersStore={fingersStore}
      tailStore={tailStore}
      wingsStore={wingsStore}
    />
  );
}

/** Memoised: only a Reset (new resetSignal) re-renders the canvas. */
const ViewerScene = memo(function ViewerScene({
  resetSignal,
  jawStore,
  headStore,
  neckStore,
  pawsStore,
  fingersStore,
  tailStore,
  wingsStore,
}: {
  resetSignal: number;
  jawStore: ValueStore<number>;
  headStore: ValueStore<number>;
  neckStore: ValueStore<number>;
  pawsStore: ValueStore<readonly number[]>;
  fingersStore: ValueStore<readonly number[]>;
  tailStore: ValueStore<number>;
  wingsStore: ValueStore<readonly [number, number]>;
}) {
  return (
    <div className={styles.viewer}>
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
          <Lighting />
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.15}>
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
              <CameraReset signal={resetSignal} />
            </Bounds>
            {/* Soft contact shadows at the joints between parts; mounts once the model is in. */}
            <ModelAmbientOcclusion />
          </Suspense>
          <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
          <KeyboardOrbit />
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
  // Clone the scene (geometry shared) and give it its own plastic copies of the
  // materials, so the cached GLB stays pristine.
  const { model, materials, jaws, head, neck, paws, fingers, tail, wings } = useMemo(() => {
    const clone = scene.clone();
    for (const name of EXPORT_LEFTOVERS) clone.getObjectByName(name)?.removeFromParent();

    const copies = new Map<Material, Material>();
    const toPlastic = (source: Material): Material => {
      let copy = copies.get(source);
      if (!copy) {
        copy = source.clone();
        // Only fill in what the export left at glTF defaults; authored values win.
        if (copy instanceof MeshStandardMaterial && copy.metalness === 0 && copy.roughness === 1 && !copy.roughnessMap) {
          copy.roughness = plasticRoughness(copy.name);
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
  }, [scene]);

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

  // The tail sways as one curve: every joint turns by its own share of the slider.
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

function Lighting() {
  return (
    <>
      {/* Sky/ground fill: the ground tone is a lifted cool grey so undersides never drop to black. */}
      <hemisphereLight args={["#e4e7f5", "#7a7f94", 0.45]} />
      <ambientLight intensity={0.15} />
      {/* Key from above the camera's home side, a rim from behind. */}
      <directionalLight position={[-6, 9, 7]} intensity={1.8} />
      {/* Neutral rim: glossy plastic mirrors its colour, and the brick colours must stay true. */}
      <directionalLight position={[6, 3, -6]} intensity={0.7} color="#e9e9ed" />
      {/* Soft bounce from below-front: keeps shape and shading on the belly and wing undersides. */}
      <directionalLight position={[2, -7, 4]} intensity={0.45} color="#cfd3e5" />
      {/* Procedural studio environment: soft fill and highlights, no HDR download. */}
      <Environment resolution={256}>
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

/** Puts the camera back on its home direction and refits the model. */
function CameraReset({ signal }: { signal: number }) {
  const bounds = useBounds();
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsLike | null;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const target = controls?.target ?? new Vector3();
    const distance = camera.position.distanceTo(target);
    camera.position.copy(target).addScaledVector(HOME_DIRECTION, distance);
    bounds.refresh().clip().fit();
  }, [signal, bounds, camera, controls]);

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

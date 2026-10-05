"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_MODEL_STATE,
  JAW_ON_LOAD,
  headRangeForJaw,
  maxJawAtHead,
  tailRangeForWings,
  wingsHorizontalRange,
  wingsHorizontalRangeForTail,
  wingsVerticalRange,
  type Joint,
  type ModelState,
} from "@/content/playground";
import { ControlPanel, type ControlKey } from "./ControlPanel";
import { PlaygroundIntro } from "./PlaygroundIntro";
import { ViewerStatus } from "./ViewerStatus";
import styles from "./PlaygroundStage.module.scss";

// three.js needs the browser: load the viewer client-only, in its own chunk.
const ModelViewer = dynamic(() => import("./ModelViewer"), {
  ssr: false,
  loading: () => <ViewerStatus>Loading viewer</ViewerStatus>,
});

/** Controls wired to the 3D model (all of the panel's); any other would be shown but disabled. */
const LIVE_CONTROLS: ReadonlySet<ControlKey> = new Set<ControlKey>(["head", "neck", "jaw", "paws", "fingers", "tail", "wings", "wingsH"]);

type PerPaw = readonly [number, number, number, number];
const withPaw = (values: PerPaw, index: number, value: number): PerPaw => {
  const next = [...values] as [number, number, number, number];
  next[index] = value;
  return next;
};

/**
 * Owns the stage and the controls. The 3D viewer handles the camera (orbit,
 * zoom, pan) and the rigged joints; the joint values live here, and the sliders
 * that limit each other (head / jaw, wings vertical / horizontal, tail / wings horizontal) are
 * clamped here — nothing ever moves on its own.
 */
export function PlaygroundStage() {
  // Opens with the mouth slightly ajar (a third of the Jaw slider).
  const [model, setModel] = useState<ModelState>({ ...DEFAULT_MODEL_STATE, jaw: JAW_ON_LOAD });
  const [selectedPaw, setSelectedPaw] = useState(0);
  const [selectedFingers, setSelectedFingers] = useState(0);

  // On larger screens the control panel floats over the bottom of the stage: tell the viewer how much of
  // the canvas it covers, so the model is framed in the free part above it (phones stack the panel below).
  const stageRef = useRef<HTMLDivElement>(null);
  const panelSlotRef = useRef<HTMLDivElement>(null);
  const [panelInset, setPanelInset] = useState(0);
  useEffect(() => {
    const stage = stageRef.current;
    const panel = panelSlotRef.current?.firstElementChild;
    if (!stage || !panel) return;
    const measure = () => {
      const overlaps = getComputedStyle(panel).position === "absolute";
      setPanelInset(overlaps ? Math.max(0, stage.getBoundingClientRect().bottom - panel.getBoundingClientRect().top) : 0);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  // The jaw never moves on its own: the Head slider stops where the open jaw would meet the
  // neck, and the Jaw slider stops at what the head's current position leaves room for.
  const setJoint = (joint: Joint | "zoom", value: number) =>
    setModel((m) => {
      if (joint === "head") {
        const { min, max } = headRangeForJaw(m.jaw);
        return { ...m, head: Math.min(max, Math.max(min, value)) };
      }
      if (joint === "jaw") return { ...m, jaw: Math.min(value, maxJawAtHead(m.head)) };
      // Same for the wings: a raised or lowered wing has less room to swing, so each slider stops
      // where the other's position leaves no more room.
      if (joint === "wingsH") {
        // Swung back, the wings also pass the tail: they stop where the tail, as it is, would be in their way.
        const wings = wingsHorizontalRange(m.wings);
        const tail = wingsHorizontalRangeForTail(m.tail);
        const back = Math.min(wings.back, tail.back);
        const forward = Math.min(wings.forward, tail.forward);
        return { ...m, wingsH: Math.min(forward, Math.max(-back, value)) };
      }
      // The tail stops where the wings, as they are, leave it no more room — it never moves on its own.
      if (joint === "tail") {
        const { min, max } = tailRangeForWings(m.wingsH);
        return { ...m, tail: Math.min(max, Math.max(min, value)) };
      }
      if (joint === "wings") {
        const { min, max } = wingsVerticalRange(m.wingsH);
        return { ...m, wings: Math.min(max, Math.max(min, value)) };
      }
      return { ...m, [joint]: value };
    });

  return (
    <>
    {/* The page's label, in the content grid above the stage like the other pages' headers. */}
    <div className={styles["playground-stage__header"]}>
      <div className={styles["playground-stage__kicker"]}>Playground</div>
    </div>
    <div ref={stageRef} className={styles["playground-stage"]}>
      <div className={styles["playground-stage__floor-glow"]} aria-hidden="true" />

      <div className={styles["playground-stage__model-area"]}>
        <ModelViewer
          jaw={model.jaw}
          head={model.head}
          neck={model.neck}
          paws={model.paws}
          fingers={model.fingers}
          tail={model.tail}
          wings={model.wings}
          wingsH={model.wingsH}
          bottomInset={panelInset}
        />
      </div>

      <div ref={panelSlotRef} className={styles["playground-stage__panel-slot"]}>
        <ControlPanel
          model={model}
          onChange={setJoint}
          paw={{
            selected: selectedPaw,
            onSelect: setSelectedPaw,
            onChange: (value) => setModel((m) => ({ ...m, paws: withPaw(m.paws, selectedPaw, value) })),
          }}
          fingers={{
            selected: selectedFingers,
            onSelect: setSelectedFingers,
            onChange: (value) => setModel((m) => ({ ...m, fingers: withPaw(m.fingers, selectedFingers, value) })),
          }}
          isEnabled={(key) => LIVE_CONTROLS.has(key)}
        />
      </div>

      <PlaygroundIntro />
    </div>
    </>
  );
}

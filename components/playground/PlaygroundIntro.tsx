"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useModalFocus } from "@/lib/useModalFocus";
import { useDisclaimer } from "@/components/layout/DisclaimerProvider";
import styles from "./PlaygroundIntro.module.scss";

const SEEN_KEY = "zmago:playground-intro-seen";

// Shown once per visit, like the disclaimer: remembered for the browser session (falls back to this
// page's lifetime if storage is blocked).
let seenInMemory = false;
const readSeen = () => {
  if (seenInMemory) return true;
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
};
const noSubscribe = () => () => {};

/** Camera controls, side by side for mouse and touch. */
const CONTROLS = [
  { action: "Orbit", desktop: "Drag with the mouse, or use the ← → keys.", mobile: "Drag with one finger." },
  { action: "Zoom", desktop: "Scroll the wheel.", mobile: "Pinch with two fingers." },
  { action: "Pan", desktop: "Right-drag.", mobile: "Drag with two fingers." },
];

/** How to handle the model: shown the first time the playground opens in a visit (after the disclaimer). */
export function PlaygroundIntro() {
  const { entered } = useDisclaimer();
  // Server render and hydration assume "seen", so nothing flashes; the client then reads storage.
  const seenAtLoad = useSyncExternalStore(noSubscribe, readSeen, () => true);
  const [dismissed, setDismissed] = useState(false);
  const open = entered && !seenAtLoad && !dismissed;

  const dialogRef = useRef<HTMLDivElement>(null);
  const okRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    seenInMemory = true;
    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Storage blocked: seenInMemory covers this page's lifetime.
    }
    setDismissed(true);
  };

  useModalFocus(open, dialogRef, {
    initialFocus: okRef,
    onKeyDown: (event) => {
      if (event.key === "Escape") close();
    },
  });

  if (!open) return null;

  // Portalled to <body>: while open, the site content (where this component lives) is made inert.
  return createPortal(
    <div className={styles["playground-intro"]} onClick={(event) => event.target === event.currentTarget && close()}>
      <div
        ref={dialogRef}
        className={styles["playground-intro__dialog"]}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zm-intro-title"
        tabIndex={-1}
      >
        <div className={styles["playground-intro__kicker"]}>
          <span className={styles["playground-intro__kicker-line"]} aria-hidden="true" />
          <span className={styles["playground-intro__kicker-text"]}>Playground</span>
        </div>
        <h2 id="zm-intro-title" className={styles["playground-intro__title"]}>
          Handle the model
        </h2>
        <table className={styles["playground-intro__controls"]}>
          <thead>
            <tr>
              <td />
              <th scope="col">Desktop</th>
              <th scope="col">Mobile</th>
            </tr>
          </thead>
          <tbody>
            {CONTROLS.map(({ action, desktop, mobile }) => (
              <tr key={action}>
                <th scope="row">{action}</th>
                <td>{desktop}</td>
                <td>{mobile}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={styles["playground-intro__both"]}>
          <span className={styles["playground-intro__term"]}>Pose</span>
          <span>
            The sliders move Zmago&rsquo;s joints. The middle position is how the original build is put together. Use FL, FR, RL or RR to select a paw.
          </span>
        </p>
        <p className={styles["playground-intro__note"]}>
The joints have movement limits that match the real build. When two parts would collide, the joint stops them from passing through each other.        </p>
        <button ref={okRef} type="button" className={styles["playground-intro__ok"]} onClick={close}>
          Got it
        </button>
      </div>
    </div>,
    document.body,
  );
}

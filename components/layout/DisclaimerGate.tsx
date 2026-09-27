"use client";

import { useRef } from "react";
import { useModalFocus } from "@/lib/useModalFocus";
import { useDisclaimer } from "./DisclaimerProvider";
import styles from "./DisclaimerGate.module.scss";

export function DisclaimerGate() {
  const { gateOpen, enter } = useDisclaimer();
  const dialogRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<HTMLButtonElement>(null);

  useModalFocus(gateOpen, dialogRef, { initialFocus: enterRef });

  if (!gateOpen) return null;

  return (
    <div className={styles.overlay}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zm-gate-title"
        aria-describedby="zm-gate-body"
        tabIndex={-1}
      >
        <div className={styles.kicker}>
          <span className={styles.kickerLine} aria-hidden="true" />
          <span className={styles.kickerText}>Fan project</span>
        </div>
        <h2 id="zm-gate-title" className={styles.title}>
          Before you enter
        </h2>
        <div id="zm-gate-body">
          <p className={styles.lead}>
            This is a fan-made project and is not sponsored, authorized, or endorsed by The LEGO Group.
          </p>
          <p className={styles.body}>
            LEGO is a trademark of The LEGO Group. Zmago is an independent creation, presented here as a
            personal build log and portfolio piece.
          </p>
        </div>
        <div className={styles.actions}>
          <button ref={enterRef} type="button" className={styles.enter} onClick={enter}>
            Enter Zmago
            <span className={styles.arrow} aria-hidden="true">
              &#8594;
            </span>
          </button>
          <span className={styles.note}>You can read this notice again from the footer.</span>
        </div>
      </div>
    </div>
  );
}

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
    <div className={styles["disclaimer-gate"]}>
      <div
        ref={dialogRef}
        className={styles["disclaimer-gate__dialog"]}
        role="dialog"
        aria-modal="true"
        aria-labelledby="zm-gate-title"
        aria-describedby="zm-gate-body"
        tabIndex={-1}
      >
        <div className={styles["disclaimer-gate__kicker"]}>
          <span className={styles["disclaimer-gate__kicker-line"]} aria-hidden="true" />
          <span className={styles["disclaimer-gate__kicker-text"]}>Fan project</span>
        </div>
        <h2 id="zm-gate-title" className={styles["disclaimer-gate__title"]}>
          Before you enter
        </h2>
        <div id="zm-gate-body">
          <p className={styles["disclaimer-gate__lead"]}>
            This is a fan-made project and is not sponsored, authorized, or endorsed by The LEGO Group.
          </p>
          <p className={styles["disclaimer-gate__body"]}>
            LEGO is a trademark of The LEGO Group. Zmago is an independent creation, presented here as a
            personal build log and portfolio piece.
          </p>
        </div>
        <div className={styles["disclaimer-gate__actions"]}>
          <button ref={enterRef} type="button" className={styles["disclaimer-gate__enter"]} onClick={enter}>
            Enter Zmago
            <span className={styles["disclaimer-gate__arrow"]} aria-hidden="true">
              &#8594;
            </span>
          </button>
          <span className={styles["disclaimer-gate__note"]}>You can read this notice again from the footer.</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { SHOTS } from "@/content/shots";
import { useModalFocus } from "@/lib/useModalFocus";
import styles from "./Lightbox.module.scss";

type LightboxProps = {
  /** Index into SHOTS, or null when closed. */
  index: number | null;
  onChange: (index: number) => void;
  onClose: () => void;
};

export function Lightbox({ index, onChange, onClose }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null;
  const count = SHOTS.length;

  const step = (delta: number) => {
    if (index !== null) onChange((index + delta + count) % count);
  };

  useModalFocus(open, dialogRef, {
    initialFocus: closeRef,
    onKeyDown: (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    },
  });

  if (index === null) return null;

  const shot = SHOTS[index];
  const counter = `${String(index + 1).padStart(2, "0")} / ${count}`;

  return createPortal(
    <div
      ref={dialogRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Gallery viewer"
    >
      <div className={styles.topBar}>
        <span className={styles.counter}>{counter}</span>
        <button ref={closeRef} type="button" className={styles.close} onClick={onClose}>
          Close
        </button>
      </div>
      <div className={styles.stage}>
        <button type="button" className={styles.arrow} onClick={() => step(-1)} aria-label="Previous image">
          <span aria-hidden="true">&#8592;</span>
        </button>
        {/* Same frame the shot sits in on the page, sized to the image's own proportions. */}
        <div
          key={shot.image.src}
          className={styles.frame}
          style={{ "--frame-ratio": shot.image.width / shot.image.height } as CSSProperties}
        >
          <Image
            src={shot.image.src}
            width={shot.image.width}
            height={shot.image.height}
            alt={shot.caption}
            className={styles.image}
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>
        <button type="button" className={styles.arrow} onClick={() => step(1)} aria-label="Next image">
          <span aria-hidden="true">&#8594;</span>
        </button>
      </div>
      <div className={styles.caption} aria-live="polite">
        {shot.caption}
      </div>
    </div>,
    document.body,
  );
}

"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./FillText.module.scss";

/** Below this many lines of free space the text is hidden rather than squeezed in. */
const MIN_LINES = 2;

type FillTextProps = {
  /** Optional run-in label, styled as an accent kicker (e.g. "Front poses"). */
  lead?: string;
  /**
   * When the text fills the space its parent leaves free:
   * - "always": at every width.
   * - "desktop": from the desktop breakpoint up; below it the text flows at its natural height.
   */
  fill?: "always" | "desktop";
  children: React.ReactNode;
  className?: string;
  /** For placement by the parent, e.g. a grid area. */
  style?: CSSProperties;
};

/**
 * A descriptive paragraph that can fill whatever height its parent leaves free.
 * While filling it adds no height of its own, sits on the bottom edge of that space
 * and is clamped to the lines that fit — so the parent (a grid area or a flex column)
 * must get its height from something else.
 */
export function FillText({ lead, fill = "always", children, className, style }: FillTextProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const [lines, setLines] = useState(0);

  useEffect(() => {
    const box = boxRef.current;
    const text = textRef.current;
    if (!box || !text) return;

    const observer = new ResizeObserver(([entry]) => {
      const lineHeight = parseFloat(getComputedStyle(text).lineHeight);
      // Small tolerance so sub-pixel heights (199px / 22.1px) don't drop a whole line.
      setLines(lineHeight > 0 ? Math.floor(entry.contentRect.height / lineHeight + 0.02) : 0);
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const classes = [styles.box, fill === "desktop" ? styles.fillDesktop : styles.fillAlways, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={boxRef} className={classes} style={style} data-visible={lines >= MIN_LINES || undefined}>
      {/* The clamp only takes effect in fill mode, where the text is a -webkit-box. */}
      <p ref={textRef} className={styles.text} style={{ WebkitLineClamp: Math.max(lines, 1) }}>
        {lead && (
          <span className={styles.lead}>
            <span className={styles.leadLine} aria-hidden="true" />
            {lead}
          </span>
        )}
        {children}
      </p>
    </div>
  );
}

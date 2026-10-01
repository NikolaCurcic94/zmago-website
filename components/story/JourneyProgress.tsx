"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { MILESTONES } from "@/content/site";
import styles from "./JourneySection.module.scss";

// The bar is a straight 0 → goal scale: 0 (not shown) at the left end, the last milestone (10,000) at
// the right end, every other milestone and the marker in proportion — 100 at 1%, 1,000 at 10%, 366 at 3.66%.
const GOAL = MILESTONES[MILESTONES.length - 1].value;
const share = (value: number) => (Math.min(Math.max(value, 0), GOAL) / GOAL) * 100;
const percentOf = (value: number) => `${share(value)}%`;

/** How long the bar takes to fill and the count to run up, once the bar comes into view. */
const DURATION_MS = 1400;
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const format = (value: number) => (value ? Math.round(value).toLocaleString("en-US") : "—");

/**
 * The milestone bar and the supporter count. Rendered at the real values (that is what the server sends and
 * what shows without JS); on the client it starts empty and fills up — marker gliding, count running from 0 —
 * the first time it scrolls into view. Reduced motion skips straight to the end.
 */
export function JourneyProgress({ supports }: { supports: number }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const count = countRef.current;
    if (!track || !count || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const set = (value: number) => {
      track.style.setProperty("--progress", percentOf(value));
      count.textContent = format(value);
    };
    set(0);

    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION_MS);
          set(supports * easeOutCubic(t));
          if (t < 1) frame = requestAnimationFrame(step);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    observer.observe(track);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      set(supports);
    };
  }, [supports]);

  return (
    <>
      <div ref={trackRef} className={styles.track} style={{ "--progress": percentOf(supports) } as CSSProperties}>
        <div className={styles.bar} aria-hidden="true" />
        {/* No notch for the first milestone (100): at 1% it just reads as a stray mark at the start of the bar. */}
        {MILESTONES.slice(1).map(({ value }) => (
          <span key={value} className={styles.tick} style={{ left: percentOf(value) }} aria-hidden="true" />
        ))}
        <div className={styles.marker} aria-hidden="true" />
        <ol className={styles.milestones}>
          {MILESTONES.map(({ value, label, highlight }, i) => (
            <li
              key={value}
              className={highlight ? styles.milestoneHighlight : undefined}
              style={
                {
                  "--at": percentOf(value),
                  // Room up to the next milestone, so close labels (100 and 1,000) wrap instead of overlapping.
                  "--room": `calc(${percentOf(MILESTONES[i + 1]?.value ?? GOAL)} - ${percentOf(value)})`,
                } as CSSProperties
              }
            >
              <div className={styles.milestoneValue}>{value.toLocaleString("en-US")}</div>
              <div className={styles.milestoneLabel}>{label}</div>
            </li>
          ))}
        </ol>
      </div>
      <div className={styles.count}>
        {/* Screen readers get the real number at once, not the count-up. */}
        <span ref={countRef} className={styles.countValue} aria-hidden="true">
          {format(supports)}
        </span>
        <span className="sr-only">{format(supports)}</span>
        <span className={styles.countNote}>supporters so far</span>
      </div>
    </>
  );
}

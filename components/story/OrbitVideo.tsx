"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import styles from "./PlaygroundPreview.module.scss";

const VIDEO_SRC = "/videos/zmago-orbit.mp4";
const POSTER_SRC = "/videos/zmago-orbit-poster.jpg";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * The camera's loop around Zmago (a 12 s, 1.7 MB clip recorded from the Playground model). Nothing downloads
 * until the frame nears the viewport; it plays only while on screen, starts paused for reduced motion, and the
 * corner button pauses or resumes it (moving content longer than five seconds needs a way to stop it).
 */
export function OrbitVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
  // The visitor's own choice from the button; until then, reduced motion decides.
  const [pausedByVisitor, setPausedByVisitor] = useState<boolean | null>(null);
  const paused = pausedByVisitor ?? reducedMotion;
  const pausedRef = useRef(paused);
  const onScreenRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreenRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !pausedRef.current) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    pausedRef.current = paused;
    if (!video) return;
    if (paused) video.pause();
    else if (onScreenRef.current) video.play().catch(() => {});
  }, [paused]);

  return (
    <>
      <video
        ref={videoRef}
        className={styles["playground-preview__video"]}
        width={1440}
        height={960}
        poster={POSTER_SRC}
        preload="none"
        muted
        loop
        playsInline
        aria-label="Zmago turning slowly, seen from slightly above"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>
      <button
        type="button"
        className={styles["playground-preview__toggle"]}
        onClick={() => setPausedByVisitor(!paused)}
        aria-label={paused ? "Play the video" : "Pause the video"}
      >
        {paused ? (
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M5 3.5v9l7.5-4.5z" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M4.5 3.5h2.5v9H4.5zM9 3.5h2.5v9H9z" fill="currentColor" />
          </svg>
        )}
      </button>
    </>
  );
}

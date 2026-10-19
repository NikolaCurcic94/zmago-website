"use client";

import Image from "next/image";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { images } from "@/content/images";
import { IDEAS_URL } from "@/content/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { useDisclaimer } from "@/components/layout/DisclaimerProvider";
import { HeroParticles } from "./HeroParticles";
import { HeroVideo } from "./HeroVideo";
import styles from "./StoryHero.module.scss";

/** The render's approach animation (StoryHero.module.scss, zm-approach), plus a little slack. */
const APPROACH_MS = 2100;

/**
 * The animation (a video of the live model, see HeroVideo) is an enhancement on every screen: reduced motion,
 * Data Saver and browsers without WebGL keep the still render only.
 */
function wantsAnimation(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return false;
  try {
    const gl = document.createElement("canvas").getContext("webgl2") ?? document.createElement("canvas").getContext("webgl");
    // Hand the probe's context straight back: browsers allow only a few at a time.
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}

export function StoryHero() {
  // The dragon approaches once the visitor has passed the disclaimer gate.
  const { entered } = useDisclaimer();
  const sectionRef = useRef<HTMLElement>(null);
  // live: mount the video (loads in the background); ready: its first frame is drawn, cross-fade to it; visible: play it.
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const onReady = useCallback(() => setReady(true), []);
  const onFail = useCallback(() => setLive(false), []);

  // After the page has loaded and the render has finished its approach, in idle time: start the video.
  useEffect(() => {
    if (!entered || !wantsAnimation()) return;
    let timer = 0;
    let idle = 0;
    const start = () => {
      timer = window.setTimeout(() => {
        if ("requestIdleCallback" in window) idle = window.requestIdleCallback(() => setLive(true), { timeout: 3000 });
        else setLive(true);
      }, APPROACH_MS);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      window.clearTimeout(timer);
      if (idle) window.cancelIdleCallback(idle);
    };
  }, [entered]);

  // Off screen the video is paused.
  useEffect(() => {
    const section = sectionRef.current;
    if (!live || !section) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(section);
    return () => observer.disconnect();
  }, [live]);

  const showLive = entered && live;
  const dragonClass = [styles["story-hero__dragon"], showLive && styles["story-hero__dragon--settled"], showLive && ready && styles["story-hero__dragon--hidden"]]
    .filter(Boolean)
    .join(" ");

  return (
    <section ref={sectionRef} className={styles["story-hero"]}>
      <HeroParticles />
      {entered && (
        <Image
          src={images.hero.src}
          width={images.hero.width}
          height={images.hero.height}
          alt="Zmago the Dragon, LEGO model, three-quarter view"
          className={dragonClass}
          sizes="(max-width: 699px) 100vw, (max-width: 1023px) 70vw, (max-width: 1272px) 68vw, 865px"
          loading="eager"
          fetchPriority="high"
        />
      )}
      {showLive && (
        <div className={ready ? `${styles["story-hero__live"]} ${styles["story-hero__live--ready"]}` : styles["story-hero__live"]} aria-hidden="true">
          <LiveBoundary>
            <HeroVideo active={visible} onReady={onReady} onFail={onFail} />
          </LiveBoundary>
        </div>
      )}
      <div className={styles["story-hero__shade"]} aria-hidden="true" />
      {entered && <div className={styles["story-hero__glow"]} aria-hidden="true" />}
      <div className={styles["story-hero__content"]}>
        <div className={styles["story-hero__kicker"]}>
          <span className={styles["story-hero__kicker-line"]} aria-hidden="true" />
          <span className={styles["story-hero__kicker-text"]}>LEGO Ideas submission</span>
        </div>
        <h1 className={styles["story-hero__title"]}>
          Zmago
          <br />
          <span className={styles["story-hero__title-muted"]}>the Dragon</span>
        </h1>
        <p className={styles["story-hero__lead"]}>A LEGO creation brought to life.</p>
        <div className={styles["story-hero__actions"]}>
          <ButtonLink href={IDEAS_URL} external>
            Support on LEGO Ideas
          </ButtonLink>
          <ButtonLink href="/playground" variant="secondary">
            Handle the model
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

/** If the animation fails unexpectedly, drop it quietly: the still render stays. */
class LiveBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

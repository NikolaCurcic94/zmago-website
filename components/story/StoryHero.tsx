"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { images } from "@/content/images";
import { IDEAS_URL } from "@/content/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { useDisclaimer } from "@/components/layout/DisclaimerProvider";
import { HeroParticles } from "./HeroParticles";
import styles from "./StoryHero.module.scss";

// three.js, the rig and the GLB load only when the live model is wanted — never on the server, never for the first paint.
const HeroModel = dynamic(() => import("./HeroModel"), { ssr: false });

/** The render's approach animation (StoryHero.module.scss, zm-approach), plus a little slack. */
const APPROACH_MS = 2100;

/**
 * The live model is an enhancement for large screens with a mouse: phones, tablets, touch,
 * reduced motion and browsers without WebGL keep the still render only.
 */
function wantsLiveModel(): boolean {
  if (!window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)").matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
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
  // live: mount the 3D model (loads in the background); ready: it is drawn, cross-fade to it; visible: animate it.
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const onReady = useCallback(() => setReady(true), []);

  // After the page has loaded and the render has finished its approach, in idle time: start the live model.
  useEffect(() => {
    if (!entered || !wantsLiveModel()) return;
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

  // Off screen the model draws nothing at all.
  useEffect(() => {
    const section = sectionRef.current;
    if (!live || !section) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(section);
    return () => observer.disconnect();
  }, [live]);

  const showLive = entered && live;
  const dragonClass = [styles.dragon, showLive && styles.dragonSettled, showLive && ready && styles.dragonHidden]
    .filter(Boolean)
    .join(" ");

  return (
    <section ref={sectionRef} className={styles.hero}>
      <HeroParticles />
      {entered && (
        <Image
          src={images.hero.src}
          width={images.hero.width}
          height={images.hero.height}
          alt="Zmago the Dragon, LEGO model, three-quarter view"
          className={dragonClass}
          sizes="(max-width: 599px) 100vw, (max-width: 1023px) 70vw,(max-width: 1272px) 68vw, 865px"
          loading="eager"
          fetchPriority="high"
        />
      )}
      {showLive && (
        <div className={ready ? `${styles.live} ${styles.liveReady}` : styles.live} aria-hidden="true">
          <LiveModelBoundary>
            <HeroModel active={visible} onReady={onReady} />
          </LiveModelBoundary>
        </div>
      )}
      <div className={styles.shade} aria-hidden="true" />
      {entered && <div className={styles.glow} aria-hidden="true" />}
      <div className={styles.content}>
        <div className={styles.kicker}>
          <span className={styles.kickerLine} aria-hidden="true" />
          <span className={styles.kickerText}>LEGO Ideas submission</span>
        </div>
        <h1 className={styles.title}>
          Zmago
          <br />
          <span className={styles.titleMuted}>the Dragon</span>
        </h1>
        <p className={styles.lead}>A LEGO creation brought to life.</p>
        <div className={styles.actions}>
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

/** If the live model fails (no WebGL context, GLB error), drop it quietly: the still render stays. */
class LiveModelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

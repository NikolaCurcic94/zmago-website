"use client";

import Image from "next/image";
import { images } from "@/content/images";
import { IDEAS_URL } from "@/content/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { useDisclaimer } from "@/components/layout/DisclaimerProvider";
import { HeroParticles } from "./HeroParticles";
import styles from "./StoryHero.module.scss";

export function StoryHero() {
  // The dragon approaches once the visitor has passed the disclaimer gate.
  const { entered } = useDisclaimer();

  return (
    <section className={styles.hero}>
      <HeroParticles />
      {entered && (
        <Image
          src={images.hero.src}
          width={images.hero.width}
          height={images.hero.height}
          alt="Zmago the Dragon, LEGO model, three-quarter view"
          className={styles.dragon}
          sizes="(max-width: 1558px) 68vw, 1060px"
          loading="eager"
          fetchPriority="high"
        />
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

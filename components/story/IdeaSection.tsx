import Image from "next/image";
import { images } from "@/content/images";
import { SectionKicker } from "@/components/ui/SectionKicker";
import styles from "./IdeaSection.module.scss";

export function IdeaSection() {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <div>
          <SectionKicker number="01" label="The Idea" />
          <h2 className={styles.heading}>Built around natural movement.</h2>
          <p className={styles.body}>
            The idea behind Zmago was simple: to build a dragon that follows the logic of a real animal. The
            body is shaped around a repeating skeletal structure, with joints placed where movement naturally
            occurs. From the neck and spine to the tail and limbs, each part was designed to work together as
            one articulated body.
          </p>
        </div>
        <figure>
          <div className={styles.frame}>
            <Image
              src={images.ideaMain.src}
              width={images.ideaMain.width}
              height={images.ideaMain.height}
              alt="Close-up of Zmago's head"
              className={styles.image}
              sizes="(max-width: 767px) 100vw, 640px"
            />
          </div>
          <figcaption className={styles.caption}>
            The head &mdash; first assembly, still the anchor of the build
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

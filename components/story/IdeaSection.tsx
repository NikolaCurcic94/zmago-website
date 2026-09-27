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
          <h2 className={styles.heading}>It started as a head I could not stop rebuilding.</h2>
          <p className={styles.body}>
            Zmago began with one question: could a dragon built entirely from standard bricks still move
            like an animal? The jaw came first, then the eyes, and after that the rest of the body had to
            earn its place around them.
          </p>
          <p className={styles.bodyMuted}>
            Placeholder copy &mdash; send me the story in your own words and it goes in verbatim.
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

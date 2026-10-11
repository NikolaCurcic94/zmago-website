import Image from "next/image";
import { images, type ImageAsset } from "@/content/images";
import { BUILD_NOTES } from "@/content/site";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { reveal } from "@/components/ui/reveal";
import styles from "./BuildSection.module.scss";

function FramedImage({ image, alt, sizes }: { image: ImageAsset; alt: string; sizes: string }) {
  return (
    <div className={styles["build-section__frame"]}>
      <Image
        src={image.src}
        width={image.width}
        height={image.height}
        alt={alt}
        className={styles["build-section__image"]}
        sizes={sizes}
      />
    </div>
  );
}

export function BuildSection() {
  return (
    <section className={styles["build-section"]}>
      <SectionKicker number="02" label="The Build" />
      <h2 className={styles["build-section__heading"]}>Built one piece at a time.</h2>
      <div className={styles["build-section__layout"]}>
        <figure className={styles["build-section__main-column"]} {...reveal()}>
          <FramedImage
            image={images.buildMain}
            alt="Zmago seen from above and behind, the segmented spine running from the tail up to the head"
            sizes="(max-width: 860px) 100vw, 820px"
          />
          <figcaption className={styles["build-section__main-caption"]}>
Each spine segment is built around a double joint, with a curved slope and a gold claw attached to it. The double joint allows the segment to bend and extend while also providing extra stability. Repeating the same structure along the body creates a flexible spine that can hold different poses.          </figcaption>
        </figure>
        <div className={styles["build-section__side-column"]}>
          <div className={styles["build-section__details"]}>
            <figure className={styles["build-section__detail"]} {...reveal(120)}>
              <FramedImage
                image={images.buildDetail1}
                alt="Zmago's head in profile, the horns and whiskers clipped on"
                sizes="(max-width: 860px) 50vw, 230px"
              />
              <figcaption className={styles["build-section__detail-caption"]}>Head in profile</figcaption>
            </figure>
            <figure className={styles["build-section__detail"]} {...reveal(220)}>
              <FramedImage
                image={images.buildDetail2}
                alt="Close-up from the side of a front leg and the wing above it, the paw's claws spread below"
                sizes="(max-width: 860px) 50vw, 230px"
              />
              <figcaption className={styles["build-section__detail-caption"]}>Side view, arm and wing joint</figcaption>
            </figure>
          </div>
          <div className={styles["build-section__notes"]} {...reveal(320)}>
            <div className={styles["build-section__notes-title"]}>Build notes</div>
            <dl className={styles["build-section__notes-list"]}>
              {BUILD_NOTES.map(({ label, value }) => (
                <div key={label} className={styles["build-section__note-row"]}>
                  <dt className={styles["build-section__note-label"]}>{label}</dt>
                  <dd className={styles["build-section__note-value"]}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}

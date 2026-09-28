import Image from "next/image";
import { images, type ImageAsset } from "@/content/images";
import { BUILD_NOTES } from "@/content/site";
import { SectionKicker } from "@/components/ui/SectionKicker";
import styles from "./BuildSection.module.scss";

function FramedImage({ image, alt, sizes }: { image: ImageAsset; alt: string; sizes: string }) {
  return (
    <div className={styles.frame}>
      <Image
        src={image.src}
        width={image.width}
        height={image.height}
        alt={alt}
        className={styles.image}
        sizes={sizes}
      />
    </div>
  );
}

export function BuildSection() {
  return (
    <section className={styles.section}>
      <SectionKicker number="02" label="The Build" />
      <h2 className={styles.heading}>Built one piece at a time.</h2>
      <figure className={styles.layout}>
        <div className={styles.mainColumn}>
          <FramedImage image={images.buildMain} alt="Zmago in profile" sizes="(max-width: 860px) 100vw, 820px" />
          <figcaption className={styles.mainCaption}>
            Each spine segment uses two hinge plates, a curved slope, and a gold claw. Repeat the same structure down the body, and the spine becomes flexible enough to shape.
          </figcaption>
        </div>
        <div className={styles.sideColumn}>
          <div className={styles.details}>
            <figure className={styles.detail}>
              <FramedImage
                image={images.buildDetail1}
                alt="Head and neck seen from above"
                sizes="(max-width: 860px) 50vw, 230px"
              />
              <figcaption className={styles.detailCaption}>Horns and whiskers, held in place by friction pins.</figcaption>
            </figure>
            <figure className={styles.detail}>
              <FramedImage
                image={images.buildDetail2}
                alt="Segmented tail rising above the wings"
                sizes="(max-width: 860px) 50vw, 230px"
              />
              <figcaption className={styles.detailCaption}>
                The tail - the final piece to fall into place.
              </figcaption>
            </figure>
          </div>
          <div className={styles.notes}>
            <div className={styles.notesTitle}>Build notes</div>
            <dl className={styles.notesList}>
              {BUILD_NOTES.map(({ label, value }) => (
                <div key={label} className={styles.noteRow}>
                  <dt className={styles.noteLabel}>{label}</dt>
                  <dd className={styles.noteValue}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </figure>
    </section>
  );
}

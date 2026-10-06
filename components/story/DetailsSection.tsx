import Image from "next/image";
import { images } from "@/content/images";
import { FEATURES } from "@/content/site";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { reveal } from "@/components/ui/reveal";
import styles from "./DetailsSection.module.scss";

export function DetailsSection() {
  return (
    <section className={styles["details-section"]}>
      <div className={styles["details-section__inner"]}>
        <SectionKicker number="03" label="The Details" />
        <div className={styles["details-section__grid"]}>
          <div>
            <h2 className={styles["details-section__heading"]}>Every joint has a purpose.</h2>
            <ol className={styles["details-section__features"]}>
              {FEATURES.map(({ title, body }, i) => (
                <li key={title} className={styles["details-section__feature"]} {...reveal(i * 90)}>
                  <span className={styles["details-section__number"]}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <div className={styles["details-section__feature-title"]}>{title}</div>
                    <p className={styles["details-section__feature-body"]}>{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className={styles["details-section__media"]} {...reveal(150)}>
            <Image
              src={images.detailsMain.src}
              width={images.detailsMain.width}
              height={images.detailsMain.height}
              alt="Zmago from above, looking down the spine from the head to the tail, wings spread"
              className={styles["details-section__image"]}
              sizes="(max-width: 700px) 100vw, 640px"
            />
            <div className={styles["details-section__caption"]}>Wings at full span, seen from above</div>
          </div>
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import { images } from "@/content/images";
import { FEATURES } from "@/content/site";
import { SectionKicker } from "@/components/ui/SectionKicker";
import styles from "./DetailsSection.module.scss";

export function DetailsSection() {
  return (
    <section className={styles.band}>
      <div className={styles.inner}>
        <SectionKicker number="03" label="The Details" />
        <div className={styles.grid}>
          <div>
            <h2 className={styles.heading}>Every joint has a purpose.</h2>
            <ol className={styles.features}>
              {FEATURES.map(({ title, body }, i) => (
                <li key={title} className={styles.feature}>
                  <span className={styles.number}>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <div className={styles.featureTitle}>{title}</div>
                    <p className={styles.featureBody}>{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className={styles.media}>
            <Image
              src={images.detailsMain.src}
              width={images.detailsMain.width}
              height={images.detailsMain.height}
              alt="Zmago from above with wings spread"
              className={styles.image}
              sizes="(max-width: 700px) 100vw, 640px"
            />
            <div className={styles.caption}>Wings at full span, seen from above</div>
          </div>
        </div>
      </div>
    </section>
  );
}

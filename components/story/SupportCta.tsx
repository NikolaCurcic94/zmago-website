import Image from "next/image";
import { images } from "@/content/images";
import { IDEAS_URL } from "@/content/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionKicker } from "@/components/ui/SectionKicker";
import styles from "./SupportCta.module.scss";

export function SupportCta() {
  return (
    <section className={styles.section}>
      <div className={styles.panel}>
        <Image
          src={images.z03.src}
          width={images.z03.width}
          height={images.z03.height}
          alt="Zmago with wings spread"
          className={styles.image}
          sizes="(max-width: 1143px) 56vw, 640px"
        />
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.content}>
          <SectionKicker number="05" label="Support Zmago" />
          <h2 className={styles.heading}>If you like him, say so on LEGO Ideas.</h2>
          <p className={styles.body}>
            Supporting takes a free account and one click. No money, no newsletter &mdash; it only tells LEGO
            that someone wants to build this dragon.
          </p>
          <ButtonLink href={IDEAS_URL} external>
            Open the project
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

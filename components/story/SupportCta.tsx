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
          src={images.supportMain.src}
          width={images.supportMain.width}
          height={images.supportMain.height}
          alt="Zmago with wings spread"
          className={styles.image}
          sizes="(max-width: 599px) 100vw, (max-width: 1153px) 52vw, 600px"
        />
        <div className={styles.shade} aria-hidden="true" />
        <div className={styles.content}>
          <SectionKicker number="05" label="Support Zmago" />
          <h2 className={styles.heading}>Want to see Zmago become a LEGO set? Support him on LEGO Ideas!</h2>
          <p className={styles.body}>
            Supporting takes just a few quick steps to create a free LEGO Ideas account, then one click to support the project.
          </p>
          <ButtonLink href={IDEAS_URL} external>
            Open the project
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}

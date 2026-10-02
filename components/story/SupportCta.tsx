import Image from "next/image";
import { images } from "@/content/images";
import { IDEAS_URL } from "@/content/site";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { reveal } from "@/components/ui/reveal";
import styles from "./SupportCta.module.scss";

export function SupportCta() {
  return (
    <section className={styles["support-cta"]}>
      <div className={styles["support-cta__panel"]} {...reveal()}>
        <Image
          src={images.supportMain.src}
          width={images.supportMain.width}
          height={images.supportMain.height}
          alt="Zmago facing forward, wings spread and tail raised"
          className={styles["support-cta__image"]}
          sizes="(max-width: 599px) 100vw, (max-width: 1153px) 52vw, 600px"
        />
        <div className={styles["support-cta__shade"]} aria-hidden="true" />
        <div className={styles["support-cta__content"]}>
          <SectionKicker number="05" label="Support Zmago" />
          <h2 className={styles["support-cta__heading"]}>Want to see Zmago become a LEGO set? Support him on LEGO Ideas!</h2>
          <p className={styles["support-cta__body"]}>
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

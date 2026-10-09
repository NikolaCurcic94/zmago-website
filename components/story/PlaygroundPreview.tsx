import { ButtonLink } from "@/components/ui/ButtonLink";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { reveal } from "@/components/ui/reveal";
import { OrbitVideo } from "./OrbitVideo";
import styles from "./PlaygroundPreview.module.scss";

export function PlaygroundPreview() {
  return (
    <section className={styles["playground-preview"]}>
      <SectionKicker number="04" label="The Playground" />
      <div className={styles["playground-preview__grid"]}>
        <div {...reveal()}>
          <h2 className={styles["playground-preview__heading"]}>Meet Zmago in 3D.</h2>
          <p className={styles["playground-preview__body"]}>
            Rotate the model, zoom in to explore the details, and pose the joints yourself - from the head and jaw to the neck, wings, tail, and each paw with its individual claws.
          </p>
          <ButtonLink href="/playground">Open the Playground</ButtonLink>
        </div>
        <div className={styles["playground-preview__frame"]} {...reveal(140)}>
          <OrbitVideo />
        </div>
      </div>
    </section>
  );
}

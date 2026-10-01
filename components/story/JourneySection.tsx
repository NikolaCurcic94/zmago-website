import { numberOfSupports } from "@/content/site";
import { SectionKicker } from "@/components/ui/SectionKicker";
import { JourneyProgress } from "./JourneyProgress";
import styles from "./JourneySection.module.scss";

export function JourneySection({ supports = numberOfSupports }: { supports?: number }) {
  return (
    <section className={styles.section}>
      <SectionKicker number="04" label="The Journey" />
      <h2 className={styles.heading}>10,000 supporters. Then comes the LEGO review.</h2>
      <p className={styles.intro}>
        Once a LEGO Ideas project reaches 10,000 supporters, it goes into the official review process. The LEGO Group then evaluates the project and decides whether it could become an official LEGO set.
        <br/>
        <br/>
        Zmago is working its way toward that 10,000-supporter milestone.
      </p>
      <JourneyProgress supports={supports} />
    </section>
  );
}

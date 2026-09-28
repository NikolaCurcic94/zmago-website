import type { CSSProperties } from "react";
import { MILESTONES, SUPPORTER_GOAL, SUPPORTERS } from "@/content/site";
import { SectionKicker } from "@/components/ui/SectionKicker";
import styles from "./JourneySection.module.scss";

export function JourneySection() {
  const progress = `${Math.max(1.5, Math.min(100, (SUPPORTERS / SUPPORTER_GOAL) * 100)).toFixed(1)}%`;
  const supportersLabel = SUPPORTERS ? SUPPORTERS.toLocaleString("en-US") : "—";

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
      <div className={styles.track} style={{ "--progress": progress } as CSSProperties}>
        <div className={styles.bar} aria-hidden="true" />
        <div className={styles.marker} aria-hidden="true" />
        <ol className={styles.milestones}>
          {MILESTONES.map(({ value, label, highlight }) => (
            <li key={value} className={highlight ? styles.milestoneHighlight : undefined}>
              <div className={styles.milestoneValue}>{value}</div>
              <div className={styles.milestoneLabel}>{label}</div>
            </li>
          ))}
        </ol>
      </div>
      <div className={styles.count}>
        <span className={styles.countValue}>{supportersLabel}</span>
        <span className={styles.countNote}>
          supporters so far &mdash; placeholder count until you send the live number
        </span>
      </div>
    </section>
  );
}

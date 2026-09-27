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
      <h2 className={styles.heading}>Ten thousand supporters, then LEGO takes a look.</h2>
      <p className={styles.intro}>
        A LEGO Ideas project that reaches 10,000 supporters enters the official review stage, where the LEGO
        Group decides whether it becomes a set. Zmago is somewhere along that road.
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

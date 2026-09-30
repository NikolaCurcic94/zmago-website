import type { CSSProperties } from "react";
import { MILESTONES, numberOfSupports } from "@/content/site";
import { SectionKicker } from "@/components/ui/SectionKicker";
import styles from "./JourneySection.module.scss";

// The bar is a straight 0 → goal scale: 0 (not shown) at the left end, the last milestone (10,000) at
// the right end, every other milestone and the marker in proportion — 100 at 1%, 1,000 at 10%, 366 at 3.66%.
const GOAL = MILESTONES[MILESTONES.length - 1].value;
const percentOf = (value: number) => `${(Math.min(Math.max(value, 0), GOAL) / GOAL) * 100}%`;

export function JourneySection({ supports = numberOfSupports }: { supports?: number }) {
  const supportersLabel = supports ? supports.toLocaleString("en-US") : "—";

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
      <div className={styles.track} style={{ "--progress": percentOf(supports) } as CSSProperties}>
        <div className={styles.bar} aria-hidden="true" />
        {/* No notch for the first milestone (100): at 1% it just reads as a stray mark at the start of the bar. */}
        {MILESTONES.slice(1).map(({ value }) => (
          <span key={value} className={styles.tick} style={{ left: percentOf(value) }} aria-hidden="true" />
        ))}
        <div className={styles.marker} aria-hidden="true" />
        <ol className={styles.milestones}>
          {MILESTONES.map(({ value, label, highlight }, i) => (
            <li
              key={value}
              className={highlight ? styles.milestoneHighlight : undefined}
              style={
                {
                  "--at": percentOf(value),
                  // Room up to the next milestone, so close labels (100 and 1,000) wrap instead of overlapping.
                  "--room": `calc(${percentOf(MILESTONES[i + 1]?.value ?? GOAL)} - ${percentOf(value)})`,
                } as CSSProperties
              }
            >
              <div className={styles.milestoneValue}>{value.toLocaleString("en-US")}</div>
              <div className={styles.milestoneLabel}>{label}</div>
            </li>
          ))}
        </ol>
      </div>
      <div className={styles.count}>
        <span className={styles.countValue}>{supportersLabel}</span>
        <span className={styles.countNote}>
          supporters so far
        </span>
      </div>
    </section>
  );
}

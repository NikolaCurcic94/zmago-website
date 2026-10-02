import styles from "./SectionKicker.module.scss";

/** Numbered section label, e.g. "01 / The Idea". */
export function SectionKicker({ number, label }: { number: string; label: string }) {
  return (
    <div className={styles["section-kicker"]}>
      {number} &nbsp;/&nbsp; {label}
    </div>
  );
}

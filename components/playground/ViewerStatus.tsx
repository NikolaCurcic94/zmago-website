import type { ReactNode } from "react";
import styles from "./ViewerStatus.module.scss";

/** Centred status line on the playground stage (loading, errors). */
export function ViewerStatus({ children }: { children: ReactNode }) {
  return (
    <div className={styles["viewer-status"]} role="status">
      <span className={styles["viewer-status__line"]} aria-hidden="true" />
      {children}
    </div>
  );
}

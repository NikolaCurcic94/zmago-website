import Link from "next/link";
import { DISCLAIMER, NAV_ITEMS } from "@/content/site";
import { DisclaimerButton } from "./DisclaimerButton";
import styles from "./SiteFooter.module.scss";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div>
          <div className={styles.wordmark}>Zmago</div>
          <p className={styles.disclaimer}>{DISCLAIMER}</p>
        </div>
        <nav className={styles.links} aria-label="Footer">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link key={href} href={href} className={styles.link}>
              {label}
            </Link>
          ))}
          <DisclaimerButton className={styles.disclaimerButton} />
        </nav>
      </div>
    </footer>
  );
}

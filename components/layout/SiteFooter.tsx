import Link from "next/link";
import { DISCLAIMER, NAV_ITEMS } from "@/content/site";
import { DisclaimerButton } from "./DisclaimerButton";
import styles from "./SiteFooter.module.scss";

export function SiteFooter() {
  return (
    <footer className={styles["site-footer"]}>
      <div className={styles["site-footer__inner"]}>
        <div>
          <div className={styles["site-footer__wordmark"]}>Zmago</div>
          <p className={styles["site-footer__disclaimer"]}>{DISCLAIMER}</p>
        </div>
        <nav className={styles["site-footer__links"]} aria-label="Footer">
          {NAV_ITEMS.map(({ href, label }) => (
            <Link key={href} href={href} className={styles["site-footer__link"]}>
              {label}
            </Link>
          ))}
          <DisclaimerButton className={styles["site-footer__disclaimer-button"]} />
        </nav>
      </div>
    </footer>
  );
}

import Link from "next/link";
import styles from "./ButtonLink.module.scss";

type ButtonLinkProps = {
  href: string;
  variant?: "primary" | "secondary";
  /** Opens in a new tab and shows the ↗ arrow. */
  external?: boolean;
  children: React.ReactNode;
};

export function ButtonLink({ href, variant = "primary", external = false, children }: ButtonLinkProps) {
  const className = styles[`button-link--${variant}`];

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener" className={className}>
        {children}{" "}
        <span className={styles["button-link__arrow"]} aria-hidden="true">
          &#8599;
        </span>
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

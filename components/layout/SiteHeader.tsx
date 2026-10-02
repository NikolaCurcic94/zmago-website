"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { NAV_ITEMS } from "@/content/site";
import styles from "./SiteHeader.module.scss";

export function SiteHeader() {
  const pathname = usePathname();

  // The tab the visitor just clicked, so the highlight starts moving before the route commits.
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [committedPath, setCommittedPath] = useState(pathname);
  if (committedPath !== pathname) {
    setCommittedPath(pathname);
    setPendingHref(null);
  }
  const activeHref = pendingHref ?? pathname;

  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const activeHrefRef = useRef(activeHref);

  /**
   * Moves the shared highlight under the active tab, writing straight to the DOM (no React
   * re-render). Animated moves transition `transform` and `width` together, so the pill keeps its
   * shape (no scale distortion) and an interrupted move continues from wherever it is. Without
   * `animate` it jumps, which is what first paint, resizes and font swaps want.
   */
  const placeRef = useRef((animate: boolean) => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;

    const link = linkRefs.current.get(activeHrefRef.current);
    if (!link) {
      delete nav.dataset.ready;
      return;
    }

    const navBox = nav.getBoundingClientRect();
    const linkBox = link.getBoundingClientRect();
    const wasPlaced = "ready" in nav.dataset;
    const move = () => {
      indicator.style.width = `${linkBox.width}px`;
      indicator.style.transform = `translateX(${linkBox.left - navBox.left}px)`;
    };

    if (animate && wasPlaced) {
      move();
    } else {
      indicator.style.transition = "none";
      move();
      void indicator.offsetWidth; // commit without animating
      indicator.style.transition = "";
    }
    nav.dataset.ready = "";
  });

  // Slide on every change of the active tab (layout effect: measured before paint).
  useLayoutEffect(() => {
    activeHrefRef.current = activeHref;
    placeRef.current(true);
  }, [activeHref]);

  // Follow layout changes (viewport, wrapping header, web font swap) without animating.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const observer = new ResizeObserver(() => placeRef.current(false));
    observer.observe(nav);
    linkRefs.current.forEach((link) => observer.observe(link));
    return () => observer.disconnect();
  }, []);

  // Publish the real header height (it wraps to two rows on phones) as --zm-header-height,
  // so full-viewport sections below it (the playground stage) can size themselves exactly.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty("--zm-header-height", `${header.offsetHeight}px`);
    });
    observer.observe(header);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--zm-header-height");
    };
  }, []);

  const onTabClick = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    // Modified clicks open elsewhere; the current page keeps its tab.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (href !== pathname) setPendingHref(href);
  };

  return (
    <header ref={headerRef} className={styles["site-header"]}>
      <div className={styles["site-header__inner"]}>
        <Link href="/" className={styles["site-header__brand"]}>
          {/* Round seal on phones (keeps the header to one row), the wordmark from tablet up. */}
          <Image
            src="/images/logo/zmago-seal-light.svg"
            width={240}
            height={240}
            alt="Zmago"
            className={styles["site-header__seal"]}
            loading="eager"
          />
          <Image
            src="/images/logo/zmago-wordmark-on-dark.svg"
            width={784}
            height={204}
            alt="Zmago"
            className={styles["site-header__logo"]}
            loading="eager"
          />
        </Link>
        <nav ref={navRef} className={styles["site-header__nav"]} aria-label="Main">
          <span ref={indicatorRef} className={styles["site-header__indicator"]} aria-hidden="true" />
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              ref={(el) => {
                if (el) linkRefs.current.set(href, el);
                else linkRefs.current.delete(href);
              }}
              className={href === activeHref ? `${styles["site-header__tab"]} ${styles["site-header__tab--active"]}` : styles["site-header__tab"]}
              aria-current={href === pathname ? "page" : undefined}
              onClick={onTabClick(href)}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className={styles["site-header__glow-line"]} aria-hidden="true" />
    </header>
  );
}

/**
 * Runs while the HTML is parsed, right after the header: publishes its real height
 * before first paint, so layouts sized from --zm-header-height never shift (and a
 * reload's scroll restoration has nothing to correct). The ResizeObserver above
 * keeps it current afterwards.
 */
export function HeaderHeightScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){var h=document.querySelector("header");if(h)document.documentElement.style.setProperty("--zm-header-height",h.offsetHeight+"px")})()`,
      }}
    />
  );
}

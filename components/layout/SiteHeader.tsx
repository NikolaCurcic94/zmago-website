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
   * Moves the shared highlight under the active tab, writing straight to the DOM
   * (no React re-render). Animated moves use FLIP so only `transform` transitions,
   * which the compositor runs even while the next page renders on the main thread:
   * the new width is set at once, a transform puts the box back where it visually
   * is, then that transform eases out to the identity. Without `animate` it jumps,
   * which is what first paint, resizes and font swaps want.
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
    const x = linkBox.left - navBox.left;
    const width = linkBox.width;
    const target = `translateX(${x}px)`;
    const wasPlaced = "ready" in nav.dataset;

    if (animate && wasPlaced) {
      // Where the box is right now, even mid-slide, so interrupted moves don't jump.
      const current = new DOMMatrix(getComputedStyle(indicator).transform);
      const fromWidth = indicator.offsetWidth * current.a;
      indicator.style.transition = "none";
      indicator.style.width = `${width}px`;
      indicator.style.transform = `translateX(${current.e}px) scaleX(${fromWidth / width})`;
      void indicator.offsetWidth; // commit the start frame
      indicator.style.transition = "";
      indicator.style.transform = target;
    } else {
      indicator.style.transition = "none";
      indicator.style.width = `${width}px`;
      indicator.style.transform = target;
      void indicator.offsetWidth;
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
    <header ref={headerRef} className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <Image
            src="/images/logo/zmago-wordmark-on-dark.svg"
            width={784}
            height={204}
            alt="Zmago"
            className={styles.logo}
            loading="eager"
          />
        </Link>
        <nav ref={navRef} className={styles.nav} aria-label="Main">
          <span ref={indicatorRef} className={styles.indicator} aria-hidden="true" />
          {NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              ref={(el) => {
                if (el) linkRefs.current.set(href, el);
                else linkRefs.current.delete(href);
              }}
              className={href === activeHref ? `${styles.tab} ${styles.tabActive}` : styles.tab}
              aria-current={href === pathname ? "page" : undefined}
              onClick={onTabClick(href)}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className={styles.glowLine} aria-hidden="true" />
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

"use client";

import { useEffect } from "react";

/**
 * Drives the `data-reveal` elements on the page (see reveal.ts). Only elements still below the fold are
 * hidden — never anything already on screen, so nothing flickers — and each fades up once, when it scrolls
 * into view. Without JS, or with reduced motion, everything simply stays visible.
 */
export function RevealOnScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const elements = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "shown";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const element of elements) {
      if (element.getBoundingClientRect().top < window.innerHeight) continue;
      element.dataset.reveal = "pending";
      observer.observe(element);
    }
    return () => {
      observer.disconnect();
      for (const element of elements) element.dataset.reveal = "";
    };
  }, []);
  return null;
}

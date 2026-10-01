import type { CSSProperties } from "react";

/**
 * Marks an element to fade up into place the first time it scrolls into view (RevealOnScroll, globals.scss).
 * Spread it onto the element: `<div {...reveal(120)}>`. `delayMs` staggers neighbours.
 */
export function reveal(delayMs = 0): { "data-reveal": ""; style?: CSSProperties } {
  return delayMs ? { "data-reveal": "", style: { "--reveal-delay": `${delayMs}ms` } as CSSProperties } : { "data-reveal": "" };
}

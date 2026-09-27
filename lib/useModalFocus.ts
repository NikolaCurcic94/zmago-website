"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Wraps header, main and footer; made inert while a modal is open. */
export const SITE_CONTENT_ID = "zm-site";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Options = {
  initialFocus?: RefObject<HTMLElement | null>;
  onKeyDown?: (event: KeyboardEvent) => void;
};

/**
 * Modal behaviour for a custom dialog: moves focus in, keeps Tab inside,
 * makes the rest of the site inert and restores focus when it closes.
 */
export function useModalFocus(
  active: boolean,
  container: RefObject<HTMLElement | null>,
  { initialFocus, onKeyDown }: Options = {},
) {
  const onKeyDownRef = useRef(onKeyDown);

  useEffect(() => {
    onKeyDownRef.current = onKeyDown;
  });

  useEffect(() => {
    if (!active) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const site = document.getElementById(SITE_CONTENT_ID);
    site?.setAttribute("inert", "");
    (initialFocus?.current ?? container.current)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      onKeyDownRef.current?.(event);
      if (event.key !== "Tab" || !container.current) return;

      const focusable = Array.from(container.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const current = document.activeElement;
      if (event.shiftKey && (current === first || !container.current.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (current === last || !container.current.contains(current))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      site?.removeAttribute("inert");
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [active, container, initialFocus]);
}

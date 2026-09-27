"use client";

import { useDisclaimer } from "./DisclaimerProvider";

export function DisclaimerButton({ className }: { className?: string }) {
  const { openGate } = useDisclaimer();

  return (
    <button type="button" className={className} onClick={openGate} aria-haspopup="dialog">
      Disclaimer
    </button>
  );
}

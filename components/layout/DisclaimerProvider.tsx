"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import {
  ENTERED_ATTRIBUTE,
  getAccepted,
  getAcceptedOnServer,
  setAccepted,
  subscribe,
} from "@/lib/disclaimer";

type DisclaimerContextValue = {
  /** The gate is showing. */
  gateOpen: boolean;
  /** The visitor has entered (drives the hero dragon's approach). */
  entered: boolean;
  enter: () => void;
  openGate: () => void;
};

const DisclaimerContext = createContext<DisclaimerContextValue | null>(null);

export function DisclaimerProvider({ children }: { children: React.ReactNode }) {
  const accepted = useSyncExternalStore(subscribe, getAccepted, getAcceptedOnServer);
  const [reopened, setReopened] = useState(false);
  const gateOpen = reopened || !accepted;

  const enter = useCallback(() => {
    setAccepted();
    document.documentElement.setAttribute(ENTERED_ATTRIBUTE, "");
    setReopened(false);
  }, []);

  const openGate = useCallback(() => {
    document.documentElement.removeAttribute(ENTERED_ATTRIBUTE);
    setReopened(true);
  }, []);

  const value = useMemo(
    () => ({ gateOpen, entered: !gateOpen, enter, openGate }),
    [gateOpen, enter, openGate],
  );

  return <DisclaimerContext.Provider value={value}>{children}</DisclaimerContext.Provider>;
}

export function useDisclaimer(): DisclaimerContextValue {
  const ctx = useContext(DisclaimerContext);
  if (!ctx) throw new Error("useDisclaimer must be used inside <DisclaimerProvider>");
  return ctx;
}

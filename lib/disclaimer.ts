// Disclaimer acceptance, remembered for the browser session.

export const DISCLAIMER_STORAGE_KEY = "zmago:disclaimer-accepted";
/** Set on <html> while the gate is accepted, so CSS can hide it before hydration. */
export const ENTERED_ATTRIBUTE = "data-zm-entered";

const CHANGE_EVENT = "zmago:disclaimer-change";

// Fallback when sessionStorage is unavailable (private mode, blocked storage).
let acceptedInMemory = false;

function readStorage(): boolean {
  try {
    return window.sessionStorage.getItem(DISCLAIMER_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function getAccepted(): boolean {
  return acceptedInMemory || readStorage();
}

export function getAcceptedOnServer(): boolean {
  return false;
}

export function setAccepted(): void {
  acceptedInMemory = true;
  try {
    window.sessionStorage.setItem(DISCLAIMER_STORAGE_KEY, "1");
  } catch {
    // Storage blocked: the in-memory flag still covers this page lifetime.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

/** Runs in <head> before first paint so returning visitors never see the gate flash. */
export const DISCLAIMER_BOOT_SCRIPT = `try{if(sessionStorage.getItem(${JSON.stringify(
  DISCLAIMER_STORAGE_KEY,
)})==="1")document.documentElement.setAttribute(${JSON.stringify(ENTERED_ATTRIBUTE)},"")}catch(e){}`;

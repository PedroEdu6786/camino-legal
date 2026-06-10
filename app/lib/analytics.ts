export type ConsentStatus = "granted" | "denied" | null;

const CONSENT_KEY = "analytics-consent";
export const CONSENT_GRANTED_EVENT = "analytics-consent-granted";

export function getConsent(): ConsentStatus {
  if (typeof window === "undefined") return null;
  try {
    const value = localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

export function setConsent(status: "granted" | "denied") {
  try {
    localStorage.setItem(CONSENT_KEY, status);
  } catch {
    // localStorage unavailable (private mode) — consent simply won't persist
  }
  if (status === "granted") {
    window.dispatchEvent(new Event(CONSENT_GRANTED_EVENT));
  }
}

// Subscribe form expected by useSyncExternalStore — notifies on mid-session grants
export function subscribeToConsent(callback: () => void) {
  window.addEventListener(CONSENT_GRANTED_EVENT, callback);
  return () => window.removeEventListener(CONSENT_GRANTED_EVENT, callback);
}

type AnalyticsEvent =
  | "cta_click"
  | "whatsapp_click"
  | "email_click"
  | "social_click"
  | "section_view"
  | "form_start"
  | "contact_form_submit";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: AnalyticsEvent, params?: Record<string, string>) {
  window.gtag?.("event", name, params);
}

export function trackMeta(
  event: "Contact" | "Lead",
  options?: { eventID: string },
) {
  window.fbq?.("track", event, {}, options);
}

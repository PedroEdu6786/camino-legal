import { acquisitionCategories, EVENT_NAMES, providerEventName, publicAnalyticsPath, PendingMeasurements, opaqueId, pageIdentity, sanitizeParams, serviceId, type AnalyticsEvent, type AnalyticsParams, type Destination, type MeasurementRecord } from "./measurement/contracts.ts";
export type { AnalyticsEvent, AnalyticsParams } from "./measurement/contracts.ts";
export type ConsentStatus = "granted" | "denied" | null;
export type ConsentSnapshot = { status: ConsentStatus; version: string; serverAcknowledged: boolean };
const CONSENT_KEY = "analytics-consent";
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const PROVIDERS_REVIEWED = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDERS_REVIEWED === "true";
export const CONSENT_GRANTED_EVENT = "analytics-consent-granted";
const CONSENT_CHANGED_EVENT = "analytics-consent-changed";
let snapshot: ConsentSnapshot = { status: null, version: "", serverAcknowledged: false };
let initialized = false;
let syncConsent: ((status: "granted" | "denied", version: string) => Promise<boolean>) | undefined;
let syncChain = Promise.resolve();
const pending = new PendingMeasurements();
let expiryTimer: ReturnType<typeof setTimeout> | undefined;
let acquisition: AnalyticsParams = {};
function scheduleExpiry() {
  if (expiryTimer) clearTimeout(expiryTimer);
  const next = pending.nextExpiry;
  if (next === null) return;
  expiryTimer = setTimeout(() => { pending.expire(Date.now()); scheduleExpiry(); }, Math.max(0, next - Date.now()));
  expiryTimer.unref?.();
}
let page = pageIdentity("/unknown");
let pageViewId = "";
let pageEpoch = "";
let referralService = "unspecified";
let activeService = "unspecified";
let ready = { ga4: false, meta: false };
let configured = { ga4: true, meta: true };
const dispatched = new Set<string>();
const acceptedIds = new Set<string>();
const id = () => globalThis.crypto.randomUUID();
function updateGACollectionSwitch() {
  if (typeof window === "undefined" || !GA4_ID || !/^G-[A-Z0-9]+$/.test(GA4_ID)) return;
  // Consent-mode denial alone can still produce cookieless pings.
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA4_ID}`] = !(snapshot.status === "granted" && PROVIDERS_REVIEWED && configured.ga4 && publicAnalyticsPath(window.location.pathname));
}
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
function storedStatus(value: string | null): ConsentStatus {
  if (value === "granted" || value === "denied") return value;
  try { const parsed = JSON.parse(value || "null"); return parsed?.status === "granted" || parsed?.status === "denied" ? parsed.status : null; } catch { return null; }
}
function notify() { window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT)); }
function synchronize() {
  const current = snapshot;
  if (!syncConsent || current.status === null) return;
  const sync = syncConsent;
  syncChain = syncChain.then(async () => {
    if (snapshot.version !== current.version) return;
    let acknowledged = false;
    try { acknowledged = await sync(current.status as "granted" | "denied", current.version); } catch { /* Server measurement is optional. */ }
    if (snapshot.version === current.version) { snapshot = { ...snapshot, serverAcknowledged: acknowledged }; notify(); }
    else synchronize();
  }).catch(() => {});
}
function initialize() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  let status: ConsentStatus = null;
  try { status = storedStatus(localStorage.getItem(CONSENT_KEY)); } catch { /* Memory works when persistence does not. */ }
  snapshot = { status, version: id(), serverAcknowledged: false };
  updateGACollectionSwitch();
  if (status === "granted") acquisition = acquisitionCategories(window.location.search, document.referrer);
  window.addEventListener("storage", event => {
    if (event.key !== CONSENT_KEY) return;
    const next = storedStatus(event.newValue);
    if (next !== snapshot.status) transition(next, false);
  });
}
function transition(status: ConsentStatus, persist: boolean) {
  snapshot = { status, version: id(), serverAcknowledged: false };
  if (status === "granted" && pageViewId) pageViewId = id();
  updateGACollectionSwitch();
  pending.clear();
  if (expiryTimer) clearTimeout(expiryTimer);
  acquisition = status === "granted" ? acquisitionCategories(window.location.search, document.referrer) : {};
  dispatched.clear();
  acceptedIds.clear();
  pageEpoch = "";
  referralService = "unspecified";
  activeService = status === "granted" ? page.service_id : "unspecified";
  if (persist) try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ status })); } catch { /* Keep current in-memory choice. */ }
  if (status !== "granted") {
    // Application dispatch stops immediately, even if provider SDKs remain loaded.
    ready.meta = false;
    try { window.fbq?.("consent", "revoke"); } catch { /* Never affect navigation. */ }
    if (window.gtag) try { window.gtag("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" }); } catch { /* No business dependency. */ }
  } else if (publicAnalyticsPath(window.location.pathname)) {
    try { window.fbq?.("consent", "grant"); } catch { /* Provider optional. */ }
    if (window.gtag) try { window.gtag("consent", "update", { analytics_storage: "granted", ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" }); } catch { /* Provider optional. */ }
    window.dispatchEvent(new Event(CONSENT_GRANTED_EVENT));
  }
  notify();
  synchronize();
}
export function getConsentSnapshot(): ConsentSnapshot { initialize(); return snapshot; }
export function getConsent(): ConsentStatus { return getConsentSnapshot().status; }
export function setConsent(status: "granted" | "denied") { initialize(); if (typeof window !== "undefined" && snapshot.status !== status) transition(status, true); }
export function subscribeToConsent(callback: () => void) {
  initialize();
  window.addEventListener(CONSENT_CHANGED_EVENT, callback);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, callback);
}
export function setServerConsentSync(sync: NonNullable<typeof syncConsent>) { initialize(); syncConsent = sync; synchronize(); }
export function openConsentPreferences() { if (typeof window !== "undefined") window.dispatchEvent(new Event("analytics-preferences-open")); }
export function safePageContext() {
  const origin = typeof window === "undefined" ? "https://caminolegal.com.mx" : window.location.origin;
  return { page_location: `${origin}${page.page_path}`, page_title: `Camino Legal | ${page.page_type}`, page_referrer: "" };
}
export function metaBrowserContextSafe() {
  if (typeof window === "undefined" || window.location.search || window.location.hash || pageIdentity(window.location.pathname).page_type === "unknown") return false;
  if (!document.referrer) return true;
  try { const previous = new URL(document.referrer); return previous.origin === window.location.origin && !previous.search && !previous.hash && pageIdentity(previous.pathname).page_type !== "unknown"; } catch { return false; }
}
export function configureProviders(providers: typeof configured) { configured = providers; updateGACollectionSwitch(); for (const destination of ["ga4", "meta"] as const) if (!providers[destination]) pending.take(destination, Date.now()); }
export function markProviderReady(destination: Destination) {
  if (getConsent() !== "granted" || !publicAnalyticsPath(window.location.pathname)) return;
  ready = { ...ready, [destination]: true };
  for (const record of pending.take(destination, Date.now())) dispatch(record, destination);
}
function projection(record: MeasurementRecord): AnalyticsParams {
  const properties: AnalyticsParams = { schema_version: 1, event_id: record.id, page_view_id: record.pageViewId, page_type: record.page.page_type, service_id: record.params.service_id || record.page.service_id, ...record.params };
  const output: AnalyticsParams = {};
  // Correlation fields remain technical event parameters, never custom dimensions.
  for (const [key, value] of Object.entries(properties)) if (value !== null && Object.keys(output).length < 22) output[key] = value;
  return output;
}
function dispatch(record: MeasurementRecord, destination: Destination) {
  if (getConsent() !== "granted" || !configured[destination] || !publicAnalyticsPath(window.location.pathname)) return;
  if (destination === "meta" && (!metaBrowserContextSafe() || record.page.page_path !== window.location.pathname)) return;
  const deliveryId = `${record.id}:${destination}`;
  if (dispatched.has(deliveryId)) return;
  if (!ready[destination] || (destination === "ga4" ? !window.gtag : !window.fbq)) { pending.add(record, destination, Date.now()); scheduleExpiry(); return; }
  // Claim before invocation: an exception/ambiguous send must not trigger a duplicate retry.
  dispatched.add(deliveryId);
  if (dispatched.size > 2000) dispatched.delete(dispatched.values().next().value!);
  try {
    if (destination === "ga4") window.gtag?.("event", record.name, { ...projection(record), ...safePageContext(), page_location: `${window.location.origin}${record.page.page_path}`, page_title: `Camino Legal | ${record.page.page_type}` });
    else {
      const name = providerEventName(record.name, "meta");
      if (name) window.fbq?.("track", name, name === "Contact" ? { channel: record.params.channel || (record.name === "whatsapp_click" ? "whatsapp" : "email") } : {}, { eventID: record.id });
    }
  } catch { /* Analytics never changes the successful business action. */ }
}
export function trackEvent(name: AnalyticsEvent, params: AnalyticsParams = {}, options?: { eventId?: string }) {
  if (typeof window === "undefined" || !publicAnalyticsPath(window.location.pathname) || getConsent() !== "granted" || !EVENT_NAMES.includes(name as AnalyticsEvent)) return;
  if (!pageViewId) beginPage(window.location.pathname);
  const safe = sanitizeParams({ ...attributionContext(), ...params });
  if (["service_select", "quote_change"].includes(name) && safe.service_context === "explicit" && serviceId(safe.service_id) !== "unspecified") {
    activeService = serviceId(safe.service_id);
    referralService = activeService;
  }
  const eventId = options?.eventId && opaqueId(options.eventId) ? options.eventId : id();
  if (name === "lead_submitted") {
    if (!opaqueId(options?.eventId) || acceptedIds.has(eventId)) return;
    acceptedIds.add(eventId);
  }
  const record: MeasurementRecord = { name: name as AnalyticsEvent, id: eventId, time: Date.now(), page, pageViewId, params: { ...safe, ...acquisition } };
  dispatch(record, "ga4");
  if (providerEventName(name, "meta")) dispatch(record, "meta");
}
export function suspendMarketingCollection() {
  pending.clear();
  if (expiryTimer) clearTimeout(expiryTimer);
  ready = { ga4: false, meta: false };
  configured = { ga4: false, meta: false };
  updateGACollectionSwitch();
  try { window.fbq?.("consent", "revoke"); } catch { /* Optional provider. */ }
}
export function beginPage(path: string, force = false) {
  if (!publicAnalyticsPath(path)) {
    page = pageIdentity(path); pageViewId = ""; pageEpoch = ""; activeService = "unspecified"; referralService = "unspecified";
    suspendMarketingCollection();
    return "";
  }
  const next = pageIdentity(path);
  if (next.page_type === "quotation" && typeof window !== "undefined") next.service_id = serviceId(new URLSearchParams(window.location.search).get("servicio"));
  if (force || page.page_path !== next.page_path || !pageViewId) {
    if (getConsent() === "granted" && activeService !== "unspecified") referralService = activeService;
    page = next;
    pageViewId = id();
    pageEpoch = "";
    activeService = next.service_id;
  }
  else if (next.page_type === "quotation" && next.service_id !== page.service_id) { page = next; activeService = next.service_id; }
  if (getConsent() === "granted" && pageEpoch !== snapshot.version) {
    pageEpoch = snapshot.version;
    trackEvent("page_view", { service_context: page.service_id === "unspecified" ? "unspecified" : "explicit" });
  }
  return pageViewId;
}
export function getPageViewId() { return pageViewId; }
export function attributionContext(explicit?: string) {
  const service = serviceId(explicit);
  if (service !== "unspecified") return { service_id: service, service_context: "explicit" };
  if (getConsent() !== "granted") return { service_id: "unspecified", service_context: "unspecified" };
  const inferred = serviceId(activeService !== "unspecified" ? activeService : referralService);
  return { service_id: inferred, service_context: inferred === "unspecified" ? "unspecified" : activeService !== "unspecified" ? "explicit" : "referral" };
}

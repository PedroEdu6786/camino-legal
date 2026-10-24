export const SERVICE_IDS = ["registro-de-marca", "contratos-y-convenios", "derechos-de-autor", "consultoria-legal", "paquete-web-legal"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];
export const EVENT_NAMES = ["page_view", "navigation_click", "cta_click", "service_select", "quote_view", "quote_change", "quote_request_intent", "evaluation_open", "evaluation_close", "form_view", "form_start", "form_submit_attempt", "form_validation_failed", "form_submit_failed", "lead_submitted", "whatsapp_click", "email_click", "social_click", "outbound_reference_click", "section_view", "trademark_step_view", "faq_toggle", "process_step_select", "review_interaction", "quote_disclosure_toggle", "scroll_depth", "utility_interaction"] as const;
export type AnalyticsEvent = (typeof EVENT_NAMES)[number];
export const META_EVENT_NAMES = { page_view: "PageView", lead_submitted: "Lead", whatsapp_click: "Contact", email_click: "Contact", quote_request_intent: "Contact" } as const;
export function providerEventName(name: AnalyticsEvent, provider: "meta"): "PageView" | "Lead" | "Contact" | null;
export function providerEventName(name: AnalyticsEvent, provider: "ga4"): AnalyticsEvent;
export function providerEventName(name: AnalyticsEvent, provider: "ga4" | "meta") {
  return provider === "ga4" ? name : Object.hasOwn(META_EVENT_NAMES, name) ? META_EVENT_NAMES[name as keyof typeof META_EVENT_NAMES] : null;
}
export function publicAnalyticsPath(path: string) { return pageIdentity(path).page_type !== "unknown"; }

export type AnalyticsValue = string | number | boolean | null;
export type AnalyticsParams = Record<string, AnalyticsValue>;
const PAGE_TYPES: Record<string, string> = { "/": "home", "/servicios": "service_directory", "/cotizaciones": "quotation", "/nosotros": "about", "/preguntas": "faq", "/contacto": "contact" };
export function serviceId(value: unknown): ServiceId | "unspecified" {
  return SERVICE_IDS.includes(value as ServiceId) ? value as ServiceId : "unspecified";
}
export function pageIdentity(path: string) {
  const service = serviceId(path.startsWith("/servicios/") ? path.slice(11) : "");
  if (service !== "unspecified") return { page_path: `/servicios/${service}`, page_type: "service_detail", service_id: service };
  if (Object.hasOwn(PAGE_TYPES, path)) return { page_path: path, page_type: PAGE_TYPES[path], service_id: "unspecified" };
  return { page_path: "/unknown", page_type: "unknown", service_id: "unspecified" };
}
export function serviceFromDestination(path: string, search = "") {
  const route = pageIdentity(path);
  return route.service_id !== "unspecified" ? serviceId(route.service_id) : path === "/cotizaciones" ? serviceId(new URLSearchParams(search).get("servicio")) : "unspecified";
}
const SOURCES = new Set(["navbar_desktop", "navbar_mobile_pill", "navbar_mobile_menu", "navbar", "footer", "legal_dialog", "legal", "sticky", "mobile_sticky", "mobile_sticky_bar", "hero", "home", "home_services", "home_about", "home_banner", "services_preview", "about", "banner", "services", "process", "reviews", "service_directory", "directory", "service_detail", "service", "quotation", "quote", "evaluation_modal", "trademark_evaluation", "contact", "contact_form", "contact_card", "faq", "trademark", "trademark_journey", "page"]);
const SIMPLE_IDS = ["nav.logo", "nav.home", "nav.services", "nav.quotation", "nav.about", "nav.faq", "nav.contact", "nav.menu", "footer.contact", "footer.email", "footer.legal", "sticky.contact", "sticky.whatsapp", "hero.services", "hero.contact", "hero.theme", "home.services_all", "home.quotations", "home.about", "home.banner_contact", "process.previous", "process.next", "process.contact", "process.quotation", "process.start", "process.continue", "reviews.previous", "reviews.next", "reviews.swipe", "directory.contact", "service.breadcrumb", "service.back", "service.scope", "service.deliverables", "service.investment", "service.preparation", "trademark.route", "trademark.milestones", "trademark.law", "quote.service", "quote.classes", "quote.ownership_rules", "quote.payment_count", "quote.includes", "quote.cost_breakdown", "quote.payment_schedule", "quote.request_email", "quote.request_whatsapp", "quote.evaluation", "evaluation.whatsapp", "evaluation.submit", "evaluation.close", "evaluation.done", "about.contact", "about.services", "contact.whatsapp", "contact.email", "contact.submit", "quote_cost_breakdown", "quote_payment_schedule", "hero-section", "hero", "services", "process", "about", "reviews", "contact", "faq", "alcance", "entregables", "inversion", "preparacion", "ruta-de-tu-marca", "intro", "belief", "principles", "guidance", "quotation", "before_start", "service_hero", "about_hero", "about_belief", "about_principles", "quote_intro", "quote_guidance", "service_scope", "service_deliverables", "service_investment", "service_preparation", "trademark_route", "trademark_milestones"];
const IDS = new Set(SIMPLE_IDS);
for (const service of SERVICE_IDS) for (const prefix of ["home.service", "directory.select", "directory.preview", "directory.index", "service.quote"]) IDS.add(`${prefix}.${service}`);
for (const network of ["instagram", "facebook", "linktree"]) { IDS.add(`footer.social.${network}`); }
for (let index = 0; index < 20; index++) for (const prefix of ["faq.item", "faq.link", "trademark.faq", "process.tab", "reviews.dot"]) IDS.add(`${prefix}.${index}`);
for (let index = 1; index <= 5; index++) IDS.add(`trademark.step.${String(index).padStart(2, "0")}`);
for (const tab of ["terminos", "privacidad", "cookies", "terms", "privacy"]) { IDS.add(`legal.tab.${tab}`); IDS.add(`legal.email.${tab}`); }
IDS.add("legal.close");
export function registeredId(value: unknown): value is string { return typeof value === "string" && IDS.has(value); }
const ENUMS: Record<string, readonly string[]> = {
  session_source: ["direct", "google", "bing", "facebook", "instagram", "linktree", "other", "unknown"],
  session_medium: ["none", "organic", "social", "paid_social", "cpc", "email", "referral", "other", "unknown"],
  session_campaign: ["none", "brand", "services", "trademark", "other"],
  service_context: ["explicit", "referral", "displayed_default", "unspecified"],
  destination_kind: ["internal", "whatsapp", "email", "social", "official_reference", "dialog"],
  form_id: ["contact", "trademark_evaluation", "quotation_consultation"],
  control_id: ["service", "classes", "ownership_rules", "payment_count", "previous", "next", "dot", "swipe", "tab", "skip", "cost_breakdown", "payment_schedule"],
  close_reason: ["dismiss", "escape", "backdrop", "success_done"],
  field_id: ["name", "email", "phone", "message", "details", "form"],
  error_category: ["required", "format", "length", "other_validation"],
  failure_category: ["recipient_rejected", "transport_failure", "unknown", "validation"],
  quote_type: ["estimate", "custom"], currency: ["MXN"], price_kind: ["estimate"],
  state: ["open", "closed"], channel: ["email", "whatsapp", "social"], network: ["instagram", "facebook", "linktree"],
  interaction_origin: ["user", "visibility"], utility: ["menu", "theme", "legal"], action: ["open", "close", "select", "toggle"],
};
const CORRELATION = new Set(["event_id", "attempt_id", "outcome_event_id", "page_view_id", "form_instance_id", "quote_id", "retry_parent_attempt_id"]);
export function opaqueId(value: unknown): value is string { return typeof value === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value); }
export function sanitizeParams(input: AnalyticsParams): AnalyticsParams {
  const output: AnalyticsParams = {};
  for (const [key, value] of Object.entries(input)) {
    if (["service_id", "previous_service_id", "selected_service_id"].includes(key)) output[key] = serviceId(value);
    else if (["source", "source_surface"].includes(key) && typeof value === "string" && SOURCES.has(value)) output.source_surface = value;
    else if (["action_id", "content_id", "section", "faq_id"].includes(key) && registeredId(value)) output[key === "section" ? "content_id" : key] = value;
    else if (key === "destination_id" && typeof value === "string" && (["business_whatsapp", "business_email", "trademark_law", "instagram", "facebook", "linktree", "evaluation"].includes(value) || pageIdentity(value).page_path !== "/unknown")) output[key] = value;
    else if (key === "previous_value" && (typeof value === "boolean" || (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 10) || SERVICE_IDS.includes(value as ServiceId))) output[key] = value;
    else if (CORRELATION.has(key) && opaqueId(value)) output[key] = value;
    else if (ENUMS[key]?.includes(value as string)) output[key] = value;
    else if (key === "step_id" && typeof value === "string" && ["01", "02", "03", "04", "05"].includes(value)) output[key] = value;
    else if (key === "ownership_rules" && (typeof value === "boolean" || value === null)) output[key] = value;
    else if (["classes", "payment_count", "estimated_total_minor", "evaluation_minor", "attempt_number", "threshold", "review_index"].includes(key)) {
      const maximum = key === "classes" ? 10 : key === "payment_count" ? 3 : key === "threshold" ? 100 : key === "review_index" ? 20 : key === "attempt_number" ? 100 : 100_000_000;
      const minimum = ["classes", "payment_count", "attempt_number", "review_index"].includes(key) ? 1 : 0;
      if (key === "threshold" && ![25, 50, 75, 90].includes(value as number)) continue;
      if (value === null || (typeof value === "number" && Number.isInteger(value) && value >= minimum && value <= maximum)) output[key] = value;
    }
  }
  return output;
}

export type MeasurementRecord = { name: AnalyticsEvent; id: string; time: number; page: ReturnType<typeof pageIdentity>; pageViewId: string; params: AnalyticsParams };
export type Destination = "ga4" | "meta";
export class PendingMeasurements {
  private records: { record: MeasurementRecord; destination: Destination }[] = [];
  add(record: MeasurementRecord, destination: Destination, now: number) {
    this.expire(now);
    if (this.records.some(item => item.destination === destination && item.record.id === record.id)) return;
    this.records.push({ record, destination });
    if (this.records.length > 50) this.records.shift();
  }
  expire(now: number) { this.records = this.records.filter(item => now - item.record.time < 30_000); }
  take(destination: Destination, now: number) {
    this.expire(now);
    const selected = this.records.filter(item => item.destination === destination).map(item => item.record);
    this.records = this.records.filter(item => item.destination !== destination);
    return selected;
  }
  clear() { this.records = []; }
  get size() { return this.records.length; }
  get nextExpiry() { return this.records.length ? Math.min(...this.records.map(item => item.record.time)) + 30_000 : null; }
}

export function acquisitionCategories(search: string, referrer: string): AnalyticsParams {
  const query = new URLSearchParams(search);
  let source = "direct";
  let medium = "none";
  let campaign = "none";
  const knownSources = ["google", "bing", "facebook", "instagram", "linktree"];
  if (query.has("utm_source")) {
    source = knownSources.includes(query.get("utm_source") || "") ? query.get("utm_source")! : "other";
    const suppliedMedium = query.get("utm_medium") || "";
    medium = ["organic", "social", "paid_social", "cpc", "email", "referral"].includes(suppliedMedium) ? suppliedMedium : "other";
  } else if (referrer) {
    try {
      const host = new URL(referrer).hostname;
      source = /(^|\.)google\.[a-z.]+$/.test(host) ? "google" : /(^|\.)bing\.com$/.test(host) ? "bing" : /(^|\.)facebook\.com$/.test(host) ? "facebook" : /(^|\.)instagram\.com$/.test(host) ? "instagram" : host === "linktr.ee" ? "linktree" : "other";
      medium = ["google", "bing"].includes(source) ? "organic" : ["facebook", "instagram", "linktree"].includes(source) ? "social" : "referral";
    } catch { source = "unknown"; medium = "unknown"; }
  }
  if (query.has("utm_campaign")) campaign = ["brand", "services", "trademark"].includes(query.get("utm_campaign") || "") ? query.get("utm_campaign")! : "other";
  return { session_source: source, session_medium: medium, session_campaign: campaign };
}

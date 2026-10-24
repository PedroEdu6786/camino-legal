"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { attributionContext, beginPage, getConsentSnapshot, getPageViewId, setServerConsentSync, subscribeToConsent, trackEvent } from "../../lib/analytics";
import { updateAnalyticsConsent } from "../../actions/analyticsConsent";
import { representativeTarget } from "../../lib/measurement/visibility";
import { EVENT_NAMES, registeredId, serviceFromDestination, serviceId, type AnalyticsEvent, type AnalyticsParams } from "../../lib/measurement/contracts";

export default function SectionViewTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    setServerConsentSync(async (status, version) => (await updateAnalyticsConsent(status, version)).acknowledged);
  }, []);
  useEffect(() => {
    beginPage(pathname);
    // Query-only quotation changes update rendered context, not page counts.
  }, [pathname, search]);
  useEffect(() => {
    let epoch = "";
    let previousProgress = progress();
    const seen = new Set<string>();
    const thresholds = new Set<number>();
    const timers = new Map<Element, ReturnType<typeof setTimeout>>();
    const visible = new Set<Element>();
    const targets = new Map<Element, { owner: Element; key: string; event: AnalyticsEvent; params: AnalyticsParams }>();
    const intendedDetails = new WeakSet<Element>();
    let scanFrame = 0;
    function progress() {
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      return distance > 0 ? window.scrollY / distance * 100 : 0;
    }
    function resetTimers() {
      timers.forEach(clearTimeout);
      timers.clear();
    }
    function eligibility() {
      const current = getConsentSnapshot();
      const next = `${getPageViewId()}:${current.version}`;
      if (epoch !== next) { epoch = next; seen.clear(); thresholds.clear(); previousProgress = progress(); resetTimers(); }
      return current.status === "granted" && document.visibilityState !== "hidden";
    }
    function arm(target: Element) {
      const item = targets.get(target);
      if (!item || !eligibility() || timers.has(target) || seen.has(item.key)) return;
      const expectedEpoch = epoch;
      timers.set(target, setTimeout(() => {
        timers.delete(target);
        if (!eligibility() || epoch !== expectedEpoch || !visible.has(target) || !target.isConnected || !rendered(target) || seen.has(item.key)) return;
        seen.add(item.key);
        trackEvent(item.event, { ...item.params, interaction_origin: "visibility" });
      }, 1000));
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!targets.has(entry.target)) continue;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) { visible.add(entry.target); arm(entry.target); }
        else { visible.delete(entry.target); const timer = timers.get(entry.target); if (timer) clearTimeout(timer); timers.delete(entry.target); }
      }
    }, { threshold: [0, 0.5, 1] });
    const sizedOwners = new Set<Element>();
    const ownerResize = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleScan);
    function rendered(element: Element) {
      const box = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return box.width > 0 && box.height > 0 && style.visibility !== "hidden" && style.visibility !== "collapse" && style.display !== "none";
    }
    function scan() {
      scanFrame = 0;
      const nextTargets = new Map<Element, { owner: Element; key: string; event: AnalyticsEvent; params: AnalyticsParams }>();
      const candidates = document.querySelectorAll<HTMLElement>("[data-analytics-section],[data-analytics-step],[data-analytics-form],[data-analytics-quote]");
      const currentOwners = new Set<Element>(candidates);
      for (const owner of sizedOwners) if (!currentOwners.has(owner)) { ownerResize?.unobserve(owner); sizedOwners.delete(owner); }
      for (const owner of currentOwners) if (!sizedOwners.has(owner)) { ownerResize?.observe(owner); sizedOwners.add(owner); }
      for (const owner of candidates) {
        let event: AnalyticsEvent = "section_view";
        let params: AnalyticsParams = {};
        let key = "";
        if (owner.dataset.analyticsStep) { event = "trademark_step_view"; key = `step:${owner.dataset.analyticsStep}`; params.step_id = owner.dataset.analyticsStep; params.service_id = "registro-de-marca"; }
        else if (owner.dataset.analyticsForm) { event = "form_view"; key = `form:${owner.dataset.analyticsForm}:${owner.dataset.analyticsInstance || "default"}`; params.form_id = owner.dataset.analyticsForm; if (owner.dataset.analyticsInstance) params.form_instance_id = owner.dataset.analyticsInstance; }
        else if (owner.dataset.analyticsQuote) {
          try { params = JSON.parse(owner.dataset.analyticsQuote); } catch { continue; }
          if (typeof params !== "object" || params === null || Array.isArray(params)) continue;
          event = "quote_view"; key = `quote:${params.quote_id}`;
        } else if (registeredId(owner.dataset.analyticsSection)) { key = `section:${owner.dataset.analyticsSection}`; params.content_id = owner.dataset.analyticsSection!; }
        if (!key) continue;
        const service = serviceId(owner.closest<HTMLElement>("[data-analytics-service]")?.dataset.analyticsService);
        if (service !== "unspecified") params.service_id = service;
        // Re-evaluate responsive variants on resize; never observe a hidden first child.
        const target = representativeTarget(owner, window.innerHeight, rendered);
        if (!target) continue;
        const existing = targets.get(target);
        const item = existing?.owner === owner && existing.key === key ? existing : { owner, key, event, params };
        item.params = params;
        nextTargets.set(target, item);
      }
      for (const [target, oldItem] of targets) {
        if (nextTargets.get(target) === oldItem) continue;
        observer.unobserve(target);
        visible.delete(target);
        const timer = timers.get(target);
        if (timer) clearTimeout(timer);
        timers.delete(target);
      }
      const additions = [...nextTargets].filter(([target, item]) => targets.get(target) !== item);
      targets.clear();
      nextTargets.forEach((item, target) => targets.set(target, item));
      for (const [target] of additions) observer.observe(target);
    }
    function scheduleScan() {
      if (!scanFrame) scanFrame = requestAnimationFrame(scan);
    }
    function refreshConsent() {
      beginPage(window.location.pathname);
      if (!eligibility()) resetTimers();
      else visible.forEach(arm);
    }
    function onScroll() {
      if (!eligibility()) return;
      const current = progress();
      for (const threshold of [25, 50, 75, 90]) if (previousProgress < threshold && current >= threshold && !thresholds.has(threshold)) {
        thresholds.add(threshold); trackEvent("scroll_depth", { threshold });
      }
      previousProgress = current;
    }
    function onClick(event: MouseEvent) {
      const element = event.target instanceof Element ? event.target : null;
      const summary = element?.closest("summary");
      if (summary?.parentElement?.tagName === "DETAILS") intendedDetails.add(summary.parentElement);
      const action = element?.closest<HTMLElement>("[data-analytics-event]");
      if (!action || !EVENT_NAMES.includes(action.dataset.analyticsEvent as AnalyticsEvent)) return;
      const name = action.dataset.analyticsEvent as AnalyticsEvent;
      const source = action.dataset.analyticsSource || action.closest<HTMLElement>("[data-analytics-source]")?.dataset.analyticsSource || "page";
      let explicit = action.dataset.analyticsService || action.closest<HTMLElement>("[data-analytics-service]")?.dataset.analyticsService;
      if (serviceId(explicit) === "unspecified" && action instanceof HTMLAnchorElement && action.origin === window.location.origin) {
        explicit = serviceFromDestination(action.pathname, action.search);
      }
      const params: AnalyticsParams = { ...attributionContext(explicit), action_id: action.dataset.analyticsAction || "", source_surface: source };
      let destination = action.dataset.analyticsDestination;
      if (!destination && action instanceof HTMLAnchorElement) {
        if (action.protocol === "mailto:") destination = "business_email";
        else if (action.origin === window.location.origin) destination = action.pathname;
      }
      if (["whatsapp_click", "email_click", "quote_request_intent"].includes(name)) {
        params.destination_kind = name === "whatsapp_click" ? "whatsapp" : "email";
        destination ||= name === "whatsapp_click" ? "business_whatsapp" : "business_email";
        params.channel = name === "whatsapp_click" ? "whatsapp" : "email";
      } else if (name === "social_click") { params.destination_kind = "social"; destination ||= action.dataset.analyticsNetwork; }
      else if (name === "outbound_reference_click") params.destination_kind = "official_reference";
      else params.destination_kind = "internal";
      if (destination) params.destination_id = destination;
      if (action.dataset.analyticsNetwork) params.network = action.dataset.analyticsNetwork;
      trackEvent(name, params);
    }
    function onToggle(event: Event) {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement) || !details.dataset.analyticsFaq || !intendedDetails.has(details)) return;
      intendedDetails.delete(details);
      trackEvent("faq_toggle", { faq_id: details.dataset.analyticsFaq, state: details.open ? "open" : "closed", source_surface: details.dataset.analyticsSource || "faq" });
    }
    const mutation = new MutationObserver(scheduleScan);
    mutation.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-analytics-quote", "data-analytics-instance", "data-analytics-section", "data-analytics-form", "data-analytics-step"] });
    const unsubscribe = subscribeToConsent(refreshConsent);
    const onHistory = () => {
      const previousPage = getPageViewId();
      beginPage(window.location.pathname);
      // Anchor/query-only history entries retain their canonical page and guards.
      if (getPageViewId() !== previousPage) {
        seen.clear(); thresholds.clear(); previousProgress = progress(); resetTimers();
      }
      scheduleScan();
    };
    document.addEventListener("click", onClick, true);
    document.addEventListener("toggle", onToggle, true);
    document.addEventListener("visibilitychange", refreshConsent);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onHistory);
    window.addEventListener("resize", scheduleScan, { passive: true });
    scan(); refreshConsent();
    return () => {
      if (scanFrame) cancelAnimationFrame(scanFrame);
      resetTimers(); observer.disconnect(); ownerResize?.disconnect(); mutation.disconnect(); unsubscribe();
      document.removeEventListener("click", onClick, true); document.removeEventListener("toggle", onToggle, true);
      document.removeEventListener("visibilitychange", refreshConsent); window.removeEventListener("scroll", onScroll); window.removeEventListener("popstate", onHistory); window.removeEventListener("resize", scheduleScan);
    };
  }, [pathname]);
  return null;
}

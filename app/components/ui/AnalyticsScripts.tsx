"use client";

import Script from "next/script";
import { publicAnalyticsPath } from "../../lib/measurement/contracts";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { configureProviders, getConsent, markProviderReady, metaBrowserContextSafe, safePageContext, subscribeToConsent } from "../../lib/analytics";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
// Account automatic-measurement settings must be reviewed before browser SDKs activate.
const REVIEWED = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDERS_REVIEWED === "true";
type PixelFunction = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[][]; push?: PixelFunction; loaded: boolean; version: string };
const subscribeToHash = (notify: () => void) => {
  window.addEventListener("hashchange", notify);
  return () => window.removeEventListener("hashchange", notify);
};
const currentHash = () => window.location.hash;

export default function AnalyticsScripts() {
  const granted = useSyncExternalStore(subscribeToConsent, () => getConsent() === "granted", () => false);
  const path = usePathname();
  const search = useSearchParams();
  const hash = useSyncExternalStore(subscribeToHash, currentHash, () => "");
  const gaInitialized = useRef(false);
  const metaInitialized = useRef(false);
  const gaLoaded = useRef(false);
  const metaLoaded = useRef(false);
  const validGA = !!GA4_ID && /^G-[A-Z0-9]+$/.test(GA4_ID) && REVIEWED && publicAnalyticsPath(path);
  const validMeta = !!PIXEL_ID && /^\d+$/.test(PIXEL_ID) && REVIEWED && publicAnalyticsPath(path);
  const metaContextSafe = typeof window !== "undefined" && metaBrowserContextSafe();
  const metaSafe = granted && metaContextSafe;

  const initializeGA = () => {
    gaLoaded.current = true;
    if (getConsent() !== "granted" || !validGA || !publicAnalyticsPath(window.location.pathname)) return;
    try {
      window.dataLayer ||= [];
      // Google tag consumes its documented arguments-object queue format.
      // eslint-disable-next-line prefer-rest-params
      window.gtag ||= function (..._args: unknown[]) { void _args; window.dataLayer!.push(arguments); };
      if (!gaInitialized.current) {
        gaInitialized.current = true;
        window.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted" });
        window.gtag("js", new Date());
        window.gtag("config", GA4_ID, { send_page_view: false, ...safePageContext(), allow_google_signals: false });
      }
      markProviderReady("ga4");
    } catch { /* Provider initialization must not interrupt the page. */ }
  };
  const initializeMeta = () => {
    metaLoaded.current = true;
    if (getConsent() !== "granted" || !validMeta || !metaBrowserContextSafe()) return;
    try {
      if (!metaInitialized.current) {
        metaInitialized.current = true;
        window.fbq?.("set", "autoConfig", false, PIXEL_ID);
        window.fbq?.("init", PIXEL_ID);
      }
      window.fbq?.("consent", "grant");
      markProviderReady("meta");
    } catch { /* Provider initialization must not interrupt the page. */ }
  };
  useEffect(() => {
    // Availability is independent of consent: a fresh grant must be able to queue
    // its current page before this effect initializes the SDK. Dispatch still
    // rechecks consent and implicit URL safety at the last moment.
    configureProviders({ ga4: validGA, meta: validMeta && metaContextSafe });
    if (!granted) return;
    if (validMeta && !metaSafe) try { window.fbq?.("consent", "revoke"); } catch { /* Keep unsafe-context dispatch disabled. */ }
    if (validMeta && metaSafe && !window.fbq) {
      const queue = function (...args: unknown[]) {
        if (queue.callMethod) queue.callMethod(...args);
        else queue.queue.push(args);
      } as PixelFunction;
      queue.queue = []; queue.push = queue; queue.loaded = true; queue.version = "2.0";
      window.fbq = queue;
      window._fbq ||= queue;
    }
    if (gaLoaded.current) initializeGA();
    if (metaLoaded.current) initializeMeta();
    // Initialization callbacks read current consent/context again at SDK readiness.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granted, path, search, hash, validGA, validMeta, metaContextSafe, metaSafe]);

  if (!granted || !REVIEWED) return null;
  return <>
    {validGA && <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} strategy="afterInteractive" onLoad={initializeGA} onReady={initializeGA} />}
    {validMeta && metaSafe && <Script src="https://connect.facebook.net/en_US/fbevents.js" strategy="afterInteractive" onLoad={initializeMeta} onReady={initializeMeta} />}
  </>;
}

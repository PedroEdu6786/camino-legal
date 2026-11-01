"use client";

import { useEffect, useRef } from "react";

export default function ServiceScrollHint() {
  const hint = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const element = hint.current;
    if (!element) return;
    let dismissed = false;
    const updateScroll = () => {
      if (dismissed || window.scrollY <= 24) return;
      dismissed = true;
      element.dataset.dismissed = "true";
      element.inert = true;
    };
    const updatePosition = () => {
      const banner = document.querySelector('[aria-label="Preferencias de cookies"]');
      element.style.setProperty("--scroll-hint-offset", `${banner?.getBoundingClientRect().height ?? 0}px`);
    };
    const resize = new ResizeObserver(updatePosition);
    let observedBanner: Element | null = null;
    const observeBanner = () => {
      const banner = document.querySelector('[aria-label="Preferencias de cookies"]');
      if (banner !== observedBanner) {
        resize.disconnect();
        if (banner) resize.observe(banner);
        observedBanner = banner;
      }
      updatePosition();
    };
    const mutations = new MutationObserver(observeBanner);
    mutations.observe(document.body, { childList: true, subtree: true });
    observeBanner();
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateScroll);
      resize.disconnect();
      mutations.disconnect();
    };
  }, []);

  return <a ref={hint} className="service-scroll-hint" href="#alcance" aria-label="Ver qué incluye el servicio" data-analytics-event="navigation_click" data-analytics-action="service.scope" data-analytics-source="service_detail">
    <svg width="20" height="24" viewBox="0 0 20 24" fill="none" aria-hidden="true"><path d="M10 3v17m-6-6 6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </a>;
}

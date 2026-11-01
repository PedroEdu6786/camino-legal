"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { trackEvent } from "../../lib/analytics";

const SHOW_AT = 0.08; // fraction of the page scrolled before the banner appears

export default function ServiceQuoteBanner({ slug, title }: { slug: string; title: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(max > 0 && window.scrollY / max >= SHOW_AT);
    };
    const updateOffset = () => {
      const cookie = document.querySelector('[aria-label="Preferencias de cookies"]');
      setOffset(cookie?.getBoundingClientRect().height ?? 0);
    };
    onScroll();
    updateOffset();
    const mutations = new MutationObserver(updateOffset);
    mutations.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateOffset);
    return () => {
      mutations.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateOffset);
    };
  }, []);

  if (dismissed) return null;
  const show = scrolled;

  return (
    <aside
      aria-label={`Cotizar ${title}`}
      inert={!show}
      style={{ bottom: offset }}
      className={`fixed inset-x-0 z-40 px-3 pb-3 sm:px-6 transition-all duration-500 ease-out motion-reduce:transition-none ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-xl bg-brand-burgundy py-3 pl-4 pr-2 text-[#F2ECEA] shadow-2xl sm:gap-4 sm:pl-5">
        <p className="min-w-0 flex-1 text-sm leading-snug">
          <strong className="font-semibold">¿Te interesa {title.toLowerCase()}?</strong>
          <span className="hidden sm:inline"> Conoce el alcance y solicita tu cotización.</span>
        </p>
        <Link
          href={`/cotizaciones?servicio=${slug}`}
          data-analytics-event="service_banner_click"
          data-analytics-action={`service.sticky_quote.${slug}`}
          data-analytics-source="service_sticky_banner"
          data-analytics-service={slug}
          className="shrink-0 rounded-lg bg-[#F2ECEA] px-4 py-2 text-sm font-semibold text-brand-burgundy transition-opacity hover:opacity-90"
        >
          Cotizar →
        </Link>
        <button
          type="button"
          onClick={() => {
            trackEvent("utility_interaction", { action_id: "service.sticky_quote.dismiss", source_surface: "service_sticky_banner", service_id: slug, utility: "banner", action: "close" });
            setDismissed(true);
          }}
          aria-label="Cerrar banner de cotización"
          className="shrink-0 cursor-pointer rounded-lg p-2 opacity-70 transition-opacity hover:opacity-100"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { trackEvent } from "../../lib/analytics";

export default function Banner() {
  return (
    <section id="contact" aria-labelledby="next-step-title" className="mx-auto max-w-7xl px-6 pt-4 pb-16 md:pb-20 lg:px-8 scroll-mt-24">
      <div data-reveal className="flex flex-col md:flex-row md:items-center md:justify-between gap-7 md:gap-12 rounded-2xl bg-primary/10 p-7 md:p-10 lg:p-12">
        <div>
          <h2 id="next-step-title" className="text-2xl md:text-3xl lg:text-4xl max-w-2xl font-bold tracking-tight leading-tight">El camino se hace al decidir <span className="text-secondary">avanzar.</span></h2>
          <p className="mt-3 text-sm md:text-base leading-relaxed opacity-70">Da el primer paso. Te acompañamos en lo que sigue.</p>
        </div>
        <Link href="/contacto" onClick={() => trackEvent("cta_click", { source: "banner" })} className="self-start md:self-auto shrink-0 rounded-lg bg-button-bg text-button-text px-7 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 active:scale-95 motion-reduce:transform-none">Cuéntanos tu caso <span aria-hidden="true" className="ml-3">→</span></Link>
      </div>
    </section>
  );
}

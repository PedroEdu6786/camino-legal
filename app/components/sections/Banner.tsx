"use client";

import Link from "next/link";
import Image from "next/image";

export default function Banner() {
  return (
    <section data-analytics-section="contact" id="contact" aria-labelledby="next-step-title" className="mx-auto max-w-7xl px-6 pt-4 pb-16 md:pb-20 lg:px-8 scroll-mt-24">
      <div data-reveal className="grid md:grid-cols-[1.3fr_1fr] items-center overflow-hidden rounded-2xl bg-surface">
        <div className="p-7 md:p-10 lg:p-12">
          <h2 id="next-step-title" className="text-2xl md:text-3xl lg:text-4xl max-w-2xl font-bold tracking-tight leading-tight">El camino se hace al decidir <span className="text-secondary">avanzar.</span></h2>
          <p className="mt-3 text-sm md:text-base leading-relaxed opacity-70">Da el primer paso. Te acompañamos en lo que sigue.</p>
          <Link data-analytics-event="cta_click" data-analytics-action="home.banner_contact" data-analytics-source="home_banner" href="/contacto" className="mt-6 inline-flex items-center rounded-lg bg-button-bg text-button-text px-7 py-3.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 active:scale-95 motion-reduce:transform-none">Cuéntanos tu caso <span aria-hidden="true" className="ml-3">→</span></Link>
        </div>
        <div className="h-80 md:h-96 self-end overflow-hidden">
          <Image src="/7-removebg.png" alt="Camila, fundadora de Camino Legal" width={1365} height={1781} sizes="(max-width: 767px) 320px, 400px" className="mx-auto -mt-16 md:-mt-20 w-80 md:w-[400px] h-auto" />
        </div>
      </div>
    </section>
  );
}

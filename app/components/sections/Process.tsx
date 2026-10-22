"use client";

import Image from "next/image";
import Link from "next/link";
import { useScrollJourney } from "../../lib/useScrollJourney";
import { useRef, useState } from "react";

const steps = [
  {
    number: "01",
    sticker: "Recurso 88.png",
    note: "Te escuchamos",
    title: "Da el primer paso",
    description:
      "Cont\u00e1ctanos para conocer tus necesidades y resolver tus dudas. A partir de esto, identificamos si es momento de iniciar el proceso o si conviene comenzar con una asesor\u00eda.",
  },
  {
    number: "02",
    sticker: "Recurso 80.png",
    note: "Todo claro desde el inicio",
    title: "Recibe tu propuesta",
    description:
      "Con base en lo que necesitas, te compartimos una cotizaci\u00f3n y el paso a paso de tu proceso: c\u00f3mo se llevar\u00e1 a cabo, tiempos y costos claros, sin sorpresas.",
  },
  {
    number: "03",
    sticker: "Recurso 81.png",
    note: "Vamos contigo",
    title: "Trabajamos en equipo",
    description:
      "Realiza tu pago y, a partir de ese momento, avanzamos conforme a la estrategia definida y en las etapas establecidas. Mantendremos una comunicación constante por correo para dar seguimiento y resolver cualquier aclaración.",
  },
  {
    number: "04",
    sticker: "Recurso 91.png",
    note: "Siempre al tanto",
    title: "Revisi\u00f3n continua",
    description:
      "Te mantenemos al tanto en cada etapa y revisamos en conjunto los avances para asegurar que todo est\u00e9 en orden.",
  },
  {
    number: "05",
    sticker: "Recurso 94.png",
    note: "Listo para seguir creando",
    title: "Cierre del proceso",
    description:
      "Seg\u00fan el servicio, recibir\u00e1s todos los entregables con instrucciones para su uso y materiales de apoyo. Adem\u00e1s, damos seguimiento para acompa\u00f1arte durante el proceso.",
  },
];

const stopLabels = ["Hablemos", "Propuesta", "En equipo", "Revisión", "Entrega"];

export default function Process() {
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { geometry, jumpTo } = useScrollJourney(track, stage, steps.length, setActive);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectStep = (index: number, focus = false) => {
    jumpTo(index);
    if (focus) tabs.current[index]?.focus({ preventScroll: true });
  };

  return (
    <section id="process" aria-labelledby="process-title" className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-24 lg:px-8">
      <div className="md:hidden">
        <h2 className="text-2xl font-bold tracking-tight">¿Cómo funciona Camino?</h2>
        <p className="mt-3 text-sm leading-relaxed opacity-70">Tú das el primer paso. El resto, lo recorremos contigo.</p>
        <div className="mt-6 space-y-2">
          {steps.map(step => (
            <details key={step.number} name="process-mobile" className="process-mobile-step group rounded-xl bg-primary/5 open:bg-primary/10">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-4 py-4 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4">
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <span aria-hidden="true" className="shrink-0 text-xl leading-none text-primary group-open:rotate-45">+</span>
              </summary>
              <p className="px-4 pb-5 text-sm leading-relaxed opacity-80">{step.description}</p>
            </details>
          ))}
        </div>
        <Link href="/contacto" className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-button-bg px-5 py-3 text-sm font-semibold text-button-text focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4">Cuéntanos tu caso <span aria-hidden="true" className="ml-2">↗</span></Link>
      </div>
      <div className="hidden md:block">
      <div ref={track} className="process-scroll-track" style={geometry ? { height: geometry.height + geometry.travel } : undefined}>
      <div ref={stage} className="process-stage" data-scroll-driven={!!geometry} style={geometry ? { position: "sticky", top: geometry.top } : undefined}>
      <div className="mb-5 md:mb-6">
        <h2 id="process-title" className="text-2xl lg:text-3xl font-bold tracking-tight">¿Cómo funciona Camino?</h2>
        <p className="mt-3 text-sm md:text-base opacity-70">Tú das el primer paso. El resto, lo recorremos contigo.</p>
      </div>
      <p id="process-instruction" className="mb-5 text-sm font-medium text-primary">{geometry ? "Desliza para avanzar o selecciona un paso" : "Selecciona un paso para conocerlo"} <span aria-hidden="true">↓</span></p>
      <div className="process-route relative mb-5 md:mb-6">
        <svg className="absolute top-2 left-0 w-full h-12 text-primary/25 pointer-events-none" viewBox="0 0 1000 64" preserveAspectRatio="none" fill="none" aria-hidden="true">
          <path d="M100 24 C170 48 230 0 300 24 S430 48 500 24 S630 0 700 24 S830 48 900 24" stroke="currentColor" strokeWidth="2" strokeDasharray="6 7" />
        </svg>
        <div role="tablist" aria-label="Pasos de tu proceso" aria-describedby="process-instruction" className="relative grid grid-cols-5 gap-1 md:gap-4">
          {steps.map((step, index) => (
            <button key={step.number} ref={element => { tabs.current[index] = element; }} type="button" role="tab" id={`process-tab-${index}`} aria-controls={`process-panel-${index}`} aria-selected={active === index} tabIndex={active === index ? 0 : -1}
              onClick={() => selectStep(index)}
              onKeyDown={event => {
                let next = index;
                if (event.key === "ArrowRight") next = (index + 1) % steps.length;
                else if (event.key === "ArrowLeft") next = (index + steps.length - 1) % steps.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = steps.length - 1;
                else return;
                event.preventDefault(); selectStep(next, true);
              }}
              className="process-route-stop flex flex-col items-center gap-3 rounded-lg py-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4">
              <span className="process-route-number flex items-center justify-center w-12 h-12 rounded-full bg-background text-primary text-sm font-bold">{step.number}</span>
              <span className="process-route-label text-xs md:text-sm font-semibold">{stopLabels[index]}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="relative rounded-2xl bg-primary/10 p-5 md:px-8 md:py-20 lg:px-12">
        <div className="process-panels">
        {steps.map((step, index) => (
          <div key={step.number} role="tabpanel" id={`process-panel-${index}`} aria-labelledby={`process-tab-${index}`} aria-hidden={active !== index} inert={active !== index} tabIndex={active === index ? 0 : -1} className="process-journey-panel rounded-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4">
            <div className="grid items-center gap-5 md:gap-10 md:grid-cols-[0.65fr_1.35fr]">
              <div className="process-illustration flex items-center gap-5 md:flex-col md:text-center">
                <Image src={`/stickers/${step.sticker}`} alt="" aria-hidden width={240} height={240} className="w-16 h-16 md:w-36 md:h-36 lg:w-40 lg:h-40 shrink-0 object-contain -rotate-6" />
                <p className="text-2xl lg:text-3xl text-primary leading-tight [font-family:var(--font-bellaboo)]">{step.note}</p>
              </div>
              <div className="process-journey-copy">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">{step.title}</h3>
                <p className="mt-4 text-sm md:text-base leading-relaxed opacity-80 max-w-xl">{step.description}</p>
                {index === 0 && <Link href="/contacto" className="inline-flex mt-5 text-sm font-semibold text-primary underline underline-offset-4 hover:decoration-2">Cuéntanos tu caso ↗</Link>}
                {index === 1 && <Link href="/cotizaciones" className="inline-flex mt-5 text-sm font-semibold text-primary underline underline-offset-4 hover:decoration-2">Explorar cotizaciones ↗</Link>}
              </div>
            </div>
          </div>
        ))}
        </div>
        <div className="mt-5 md:mt-0 md:absolute md:inset-x-8 md:bottom-6 lg:inset-x-12 flex items-center justify-between gap-4">
          <span className="text-xs md:text-sm opacity-60" aria-live="polite">Paso {active + 1} de {steps.length}</span>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Paso anterior" disabled={active === 0} onClick={() => selectStep(active - 1)} className="process-back rounded-full w-11 h-11 text-xl text-primary bg-primary/10 disabled:opacity-30 disabled:cursor-default cursor-pointer hover:enabled:bg-primary/20 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4">←</button>
            {active < steps.length - 1 ? <button type="button" onClick={() => selectStep(active + 1)} className="process-next rounded-lg bg-button-bg text-button-text px-5 py-3 text-sm font-semibold cursor-pointer transition-transform hover:-translate-y-0.5 motion-reduce:transform-none">Siguiente <span aria-hidden="true">→</span></button> : <Link href="/contacto" className="rounded-lg bg-button-bg text-button-text px-5 py-3 text-sm font-semibold">Empecemos <span aria-hidden="true">→</span></Link>}
          </div>
        </div>
      </div>
      <a href="#process-end" className="inline-block mt-3 text-xs text-primary underline underline-offset-4">Continuar después de los pasos ↓</a>
      </div>
      </div>
      <div id="process-end" className="scroll-mt-28" />
      </div>
    </section>
  );
}

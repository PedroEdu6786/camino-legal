"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Consulta inicial",
    description:
      "Analizamos tu caso y evaluamos la viabilidad de registro de tu marca ante el IMPI.",
  },
  {
    number: "02",
    title: "B\u00fasqueda de anterioridades",
    description:
      "Realizamos una b\u00fasqueda exhaustiva para verificar que tu marca no tenga conflictos con registros existentes.",
  },
  {
    number: "03",
    title: "Presentaci\u00f3n ante el IMPI",
    description:
      "Preparamos y presentamos tu solicitud de registro con toda la documentaci\u00f3n necesaria.",
  },
  {
    number: "04",
    title: "Seguimiento del tr\u00e1mite",
    description:
      "Monitoreamos el proceso y respondemos a cualquier requerimiento de la autoridad.",
  },
  {
    number: "05",
    title: "Obtenci\u00f3n del t\u00edtulo",
    description:
      "Recibimos tu t\u00edtulo de registro de marca y te lo entregamos. \u00a1Tu marca est\u00e1 protegida!",
  },
];

function StepCard({ step, index }: { step: typeof steps[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`flex gap-4 lg:gap-6 transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-full bg-primary text-background text-sm lg:text-base font-bold">
          {step.number}
        </div>
        {index < steps.length - 1 && (
          <div className="w-px flex-1 bg-primary/20 mt-2" />
        )}
      </div>
      <div className="pb-10 lg:pb-12">
        <h3 className="text-lg md:text-xl lg:text-2xl font-semibold mb-1 lg:mb-2">{step.title}</h3>
        <p className="text-sm md:text-base lg:text-lg leading-relaxed opacity-70">{step.description}</p>
      </div>
    </div>
  );
}

export default function Process() {
  return (
    <section id="process" className="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:py-40 lg:px-8">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-10 md:mb-14 lg:mb-16">
        &iquest;C&oacute;mo funciona?
      </h2>
      <div className="max-w-2xl lg:max-w-3xl">
        {steps.map((step, i) => (
          <StepCard key={step.number} step={step} index={i} />
        ))}
      </div>
    </section>
  );
}

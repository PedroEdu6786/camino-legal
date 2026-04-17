"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Da el primer paso",
    description:
      "Cont\u00e1ctanos para conocer tus necesidades y resolver tus dudas. A partir de esto, identificamos si es momento de iniciar el proceso o si conviene comenzar con una asesor\u00eda.",
  },
  {
    number: "02",
    title: "Recibe tu propuesta",
    description:
      "Con base en lo que necesitas, te compartimos una cotizaci\u00f3n y el paso a paso de tu proceso: c\u00f3mo se llevar\u00e1 a cabo, tiempos y costos claros, sin sorpresas.",
  },
  {
    number: "03",
    title: "Trabajamos en equipo",
    description:
      "Realiza tu pago y partir de ese momento, avanzamos conforme a la estrategia definida y en las etapas establecidas. Mantendremos una comunicación constante por correo para dar seguimiento y resolver cualquier aclaración.",
  },
  {
    number: "04",
    title: "Revisi\u00f3n continua",
    description:
      "Te mantenemos al tanto en cada etapa y revisamos en conjunto los avances para asegurar que todo est\u00e9 en orden.",
  },
  {
    number: "05",
    title: "Cierre del proceso",
    description:
      "Seg\u00fan el servicio, recibir\u00e1s todos los entregables con instrucciones para su uso y materiales de apoyo. Adem\u00e1s, damos seguimiento para acompa\u00f1arte durante el proceso.",
  },
];

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[number];
  index: number;
}) {
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
      { threshold: 0.2 },
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
        <div className="flex h-10 w-10 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-full bg-primary text-background text-xs lg:text-sm font-bold">
          {step.number}
        </div>
        {index < steps.length - 1 && (
          <div className="w-px flex-1 bg-primary/20 mt-2" />
        )}
      </div>
      <div className="pb-10 lg:pb-12">
        <h3 className="text-base md:text-lg lg:text-xl font-semibold mb-1 lg:mb-2">
          {step.title}
        </h3>
        <p className="text-xs md:text-sm lg:text-base leading-relaxed opacity-70">
          {step.description}
        </p>
      </div>
    </div>
  );
}

export default function Process() {
  return (
    <section
      id="process"
      className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-24 lg:px-8"
    >
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight mb-10 md:mb-14 lg:mb-16">
        ¿Cómo funciona Camino?
      </h2>
      <div className="max-w-2xl lg:max-w-3xl">
        {steps.map((step, i) => (
          <StepCard key={step.number} step={step} index={i} />
        ))}
      </div>
    </section>
  );
}

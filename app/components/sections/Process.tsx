"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Nos cuentas qu\u00e9 necesitas",
    description:
      "Agenda una consulta con nosotros y cu\u00e9ntanos tu situaci\u00f3n. Sin tecnicismos, sin prisa \u2014 solo escuchamos.",
  },
  {
    number: "02",
    title: "Analizamos tu caso",
    description:
      "Revisamos tu situaci\u00f3n y te explicamos claramente qu\u00e9 se puede hacer, c\u00f3mo y cu\u00e1nto cuesta. Sin sorpresas.",
  },
  {
    number: "03",
    title: "Nos ponemos a trabajar",
    description:
      "Una vez de acuerdo, nos encargamos de todo el proceso legal por ti \u2014 redacci\u00f3n, tr\u00e1mites, gestiones y m\u00e1s.",
  },
  {
    number: "04",
    title: "Revisamos juntos",
    description:
      "Te mantenemos informado en cada etapa y revisamos contigo el resultado antes de finalizar.",
  },
  {
    number: "05",
    title: "\u00a1Listo, est\u00e1s protegido!",
    description:
      "Te entregamos todo en orden y resolvemos cualquier duda. Tu negocio queda protegido legalmente.",
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

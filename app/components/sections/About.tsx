"use client";

import { useEffect, useRef, useState } from "react";

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-24 lg:px-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-start">
        {/* Left — brand narrative */}
        <div
          className={`flex flex-col gap-5 lg:gap-6 transition-all duration-500 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
        >
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight leading-snug">
              Conoce a <span className="relative inline-block">Camino...</span>
            </h2>
          </div>
          <p className="text-xs md:text-sm lg:text-base leading-relaxed">
            <span className="font-bold">CL Camino Legal&reg; </span> ofrece
            acceso claro y cercano al derecho para personas artistas, creadoras
            y negocios. Nuestro objetivo es brindar soluciones
            estrat&eacute;gicas que permitan operar con seguridad y confianza,
            minimizando riesgos y facilitando decisiones informadas.
          </p>
          <p className="text-xs md:text-sm lg:text-base leading-relaxed">
            Adem&aacute;s, busca ser un espacio de inspiraci&oacute;n y
            aprendizaje, promoviendo el reconocimiento y la protecci&oacute;n
            del trabajo creativo.
          </p>
        </div>

        {/* Right — two cards */}
        <div className="flex flex-col gap-5">
          {/* Why NOT card */}
          <div
            className={`rounded-2xl p-6 md:p-7 flex flex-col gap-5 border border-foreground/5 bg-foreground/[0.03] transition-all duration-500 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}`}
            style={{ transitionDelay: visible ? "100ms" : "0ms" }}
          >
            <div className="flex flex-col gap-3">
              <h3 className="text-base md:text-lg font-semibold leading-snug">
                Quiz&aacute; no es para ti si&hellip;
              </h3>
              <ul className="flex flex-col gap-2">
                {[
                  "Buscas asesor\u00eda gen\u00e9rica o sin orientaci\u00f3n.",
                  "Prefieres procesos complicados o poco transparentes.",
                  "Quieres avanzar sin considerar riesgos ni viabilidad.",
                  "Solo buscas que validen tus decisiones sin an\u00e1lisis.",
                  "No te importa asumir riesgos con tal de \u201cavanzar r\u00e1pido\u201d.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm md:text-base leading-relaxed opacity-60"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground/40 shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Why YES card */}
          <div
            className={`rounded-2xl p-6 md:p-7 flex flex-col gap-5 border border-foreground/5 bg-primary transition-all duration-500 ease-out ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"}`}
            style={{ transitionDelay: visible ? "250ms" : "0ms" }}
          >
            <div className="flex flex-col gap-3">
              <h3 className="text-base md:text-lg font-semibold leading-snug text-white">
                &iquest;Por qu&eacute; elegirnos?
              </h3>
              <ul className="flex flex-col gap-2">
                {[
                  "Dedicada a artistas, creadores y negocios.",
                  "Lenguaje claro, sin tecnicismos innecesarios.",
                  "Evaluamos viabilidad y buscamos alternativas \u2014 no decimos \u201cs\u00ed\u201d a todo.",
                  "Acompa\u00f1amiento cercano, honesto y estrat\u00e9gico.",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm md:text-base leading-relaxed text-white/70"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50 shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

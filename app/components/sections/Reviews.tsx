"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const reviews = [
  "Camila hizo todo el proceso m\u00e1s relajado, siempre manten\u00edndonos al tanto de en qu\u00e9 punto \u00edbamos y explicando todo. Nuestro registro de marca fue un \u00e9xito gracias a ella. \u00a1Recomendad\u00edsimo Camino Legal, gran servicio!",
  "La lic. Camila me dio seguimiento durante todos los meses del proceso. Fue muy clara al explicar cada uno de los pasos que deb\u00edamos seguir. Respondi\u00f3 a todas mis dudas. Ahora ya tengo la marca de mi negocio registrada y protegida gracias a Camino.",
  "Camila es muy paciente y explica incre\u00edble todo el proceso de registro de marca para quienes no saben nada del tema. Ha estado pendiente en todo momento. \u00a1Recomendada al 100%!",
  "Durante el proceso nos ha acompa\u00f1ado siempre y actualizado seg\u00fan lo que vaya surgiendo. \u00a1Muy recomendado!",
  "Explica muy a detalle cualquier duda. Muy amable y agradable trato.",
];

function getVisibleCount() {
  if (typeof window === "undefined") return 1;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
}

export default function Reviews() {
  const [current, setCurrent] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const maxIndex = reviews.length - visibleCount;

  useEffect(() => {
    const update = () => setVisibleCount(getVisibleCount());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Clamp current when visibleCount changes (e.g. window resize)
  useEffect(() => {
    if (current > maxIndex) {
      setCurrent(maxIndex);
      scrollToCard(maxIndex);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxIndex]);

  const scrollToCard = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;
    const card = container.children[index] as HTMLElement;
    if (!card) return;
    const scrollLeft =
      container.scrollLeft +
      card.getBoundingClientRect().left -
      container.getBoundingClientRect().left;
    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    setCurrent(index);
  }, []);

  const prev = () => scrollToCard(Math.max(0, current - 1));
  const next = () => scrollToCard(Math.min(maxIndex, current + 1));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => {
      const cards = Array.from(container.children) as HTMLElement[];
      const containerLeft = container.getBoundingClientRect().left;
      let closest = 0;
      let minDiff = Infinity;
      cards.forEach((card, i) => {
        const diff = Math.abs(card.getBoundingClientRect().left - containerLeft);
        if (diff < minDiff) { minDiff = diff; closest = i; }
      });
      setCurrent(Math.min(closest, maxIndex));
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [maxIndex]);

  return (
    <section id="reviews" className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-24 lg:px-8">

      <div className="flex items-center gap-4 mb-10 md:mb-14 lg:mb-16">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
          Lo que dicen nuestros clientes
        </h2>
        <Image
          src="/stickers/Recurso 86.png"
          alt=""
          width={60}
          height={60}
          aria-hidden
          className="w-10 lg:w-14 -rotate-6 scale-y-[-1] opacity-75 pointer-events-none select-none shrink-0"
        />
      </div>

      {/* Scroll container */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((text, i) => (
          <div
            key={i}
            className="snap-start shrink-0 w-[85vw] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] rounded-2xl p-6 md:p-7 flex flex-col gap-4 border border-foreground/5 bg-foreground/[0.03]"
          >
            <span className="text-4xl font-serif leading-none text-secondary/70 select-none">&ldquo;</span>
            <p className="text-xs md:text-sm lg:text-base leading-relaxed flex-1">{text}</p>
            <span className="text-xs opacity-40 font-medium tracking-wide uppercase">Cliente verificado</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-6 md:mt-8">

        {/* Dots — one per reachable scroll position */}
        <div className="flex items-center gap-2">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              aria-label={`Ir a rese\u00f1a ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-5 h-2 bg-primary"
                  : "w-2 h-2 bg-foreground/20 hover:bg-foreground/40"
              }`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={current === 0}
            aria-label="Anterior"
            className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-foreground/10 flex items-center justify-center transition-all duration-200 hover:border-foreground/30 hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={next}
            disabled={current === maxIndex}
            aria-label="Siguiente"
            className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-foreground/10 flex items-center justify-center transition-all duration-200 hover:border-foreground/30 hover:bg-foreground/5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
}

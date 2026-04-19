"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Hero() {
  const [isDark, setIsDark] = useState(false);
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setIsDark(next);
    setFlashing(true);
    setTimeout(() => setFlashing(false), 400);
  };

  return (
    <section className="relative overflow-hidden mx-auto max-w-7xl px-6 min-h-[calc(100dvh-4rem)] md:min-h-[calc(100dvh-5rem)] lg:min-h-[calc(100dvh-6rem)] lg:px-8 flex items-center py-10 lg:py-0">
      {/* Light bulb — toggles dark mode on click */}
      <button
        onClick={toggleDark}
        aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
        className={`hidden lg:block absolute top-14 right-10 w-20 transition-all duration-300 ${flashing ? "scale-125" : "scale-100"} ${isDark ? "opacity-100 drop-shadow-[0_0_12px_rgba(255,220,100,0.6)]" : "opacity-60 hover:opacity-80"}`}
      >
        <Image
          src="/stickers/Recurso 91.png"
          alt={isDark ? "Modo oscuro activo" : "Activar modo oscuro"}
          width={100}
          height={100}
          priority
          className={`rotate-12 select-none transition-transform duration-300 ${flashing ? "-rotate-12" : "rotate-12"}`}
        />
      </button>

      {/* Other decorative stickers */}
      <Image
        src="/stickers/Recurso 93.png"
        alt=""
        width={70}
        height={70}
        aria-hidden
        priority
        className="hidden lg:block pointer-events-none select-none absolute top-1/3 left-2 w-10 -rotate-12 opacity-50"
      />
      <Image
        src="/stickers/Recurso 85.png"
        alt=""
        width={140}
        height={70}
        aria-hidden
        priority
        className="hidden lg:block pointer-events-none select-none absolute bottom-20 right-8 w-28 -rotate-6 opacity-55"
      />
      <Image
        src="/stickers/Recurso 84.png"
        alt=""
        width={80}
        height={80}
        aria-hidden
        priority
        className="hidden lg:block pointer-events-none select-none absolute bottom-1/4 left-4 w-14 rotate-6 opacity-50"
      />
      <div className="flex flex-col items-center text-center gap-10 md:gap-12 w-full">
        {/* Eyebrow label */}
        <div className="flex items-center gap-3 animate-fade-up">
          <svg
            width="28"
            height="8"
            viewBox="0 0 28 8"
            fill="none"
            aria-hidden
            className="opacity-60 text-secondary"
          >
            <path
              d="M0 4 Q7 0 14 4 Q21 8 28 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span className="text-[14px] uppercase tracking-[0.25em] text-secondary font-semibold">
            Servicios Legales &middot; M&eacute;xico
          </span>
          <svg
            width="28"
            height="8"
            viewBox="0 0 28 8"
            fill="none"
            aria-hidden
            className="opacity-60 text-secondary"
          >
            <path
              d="M0 4 Q7 0 14 4 Q21 8 28 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tight max-w-4xl animate-fade-up animation-delay-200 [font-family:var(--font-poppins)] leading-[1.05]">
          El <span className="text-secondary">camino</span> se hace al decidir
           <span className="text-secondary"> avanzar</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs md:text-base lg:text-lg max-w-xl lg:max-w-2xl opacity-70 animate-fade-up animation-delay-200 leading-relaxed">
          Acompañamiento legal para artistas, personas creadoras y negocios.
        </p>

        {/* CTA */}
        <div className="flex animate-fade-up animation-delay-400">
          <a
            href="https://api.whatsapp.com/send/?phone=529992505160&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-button-bg px-8 py-4 text-sm font-semibold text-button-text tracking-widest uppercase transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
          >
            Escr&iacute;benos
          </a>
        </div>
      </div>
    </section>
  );
}

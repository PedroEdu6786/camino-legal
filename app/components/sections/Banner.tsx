"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Banner() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const w = (delay: number) =>
    `inline-block transition-all duration-500 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`;

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#97B1C8] overflow-hidden mt-24 md:mt-36 lg:mt-52 mb-8 md:mb-12 lg:mb-16"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col lg:flex-row items-end justify-between">
        {/* Text */}
        <div className="flex flex-col justify-center py-16 lg:py-28 flex-1 self-center">
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-black tracking-tight [font-family:var(--font-poppins)] leading-[1.1] text-[#2F2A2B] flex flex-wrap gap-x-[0.28em]">
            <span className={w(0)} style={{ transitionDelay: visible ? "0ms" : "0ms" }}>El</span>
            <span className={`text-white ${w(100)}`} style={{ transitionDelay: visible ? "100ms" : "0ms" }}>camino</span>
            <span className={w(200)} style={{ transitionDelay: visible ? "200ms" : "0ms" }}>se hace al decidir</span>
            <span className={`text-white ${w(300)}`} style={{ transitionDelay: visible ? "300ms" : "0ms" }}>avanzar</span>
          </h2>
        </div>

        {/* Image */}
        <div
          className={`hidden lg:flex flex-shrink-0 lg:w-[38%] justify-end items-end self-end transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          style={{ transitionDelay: visible ? "200ms" : "0ms" }}
        >
          <Image
            src="/7-removebg.png"
            alt="Camino Legal"
            width={420}
            height={560}
            className="h-64 md:h-80 lg:h-[500px] w-auto object-contain"
          />
        </div>
      </div>
    </section>
  );
}

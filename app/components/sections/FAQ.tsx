"use client";

import Image from "next/image";
import { useState } from "react";

const faqs = [
  {
    question: "\u00bfQu\u00e9 servicios ofrecen?",
    answer:
      "Brindamos servicios legales en temas corporativos, derechos de autor y propiedad industrial, adaptados para proteger el trabajo de artistas, personas creadoras y negocios.",
  },
  {
    question: "\u00bfCu\u00e1nto tiempo tarda cada servicio?",
    answer:
      "Depende de cada caso. Cuando nos contactes, te compartimos un estimado claro de los tiempos.",
  },
  {
    question: "\u00bfCu\u00e1nto cuesta trabajar con ustedes?",
    answer:
      "Cada proceso es diferente, por lo que te damos una cotizaci\u00f3n seg\u00fan lo que necesites.",
  },
  {
    question: "\u00bfNecesito saber de leyes para contactarlos?",
    answer:
      "Para nada. Nos encargamos de explicarte todo de forma sencilla y sin tecnicismos. T\u00fa solo cu\u00e9ntanos qu\u00e9 necesitas.",
  },
  {
    question: "\u00bfNecesito ser una empresa grande?",
    answer:
      "No. Lo mejor es proteger tu trabajo desde el principio para que puedas crecer con seguridad.",
  },
  {
    question: "\u00bfPueden ayudarme si ya tengo un problema legal?",
    answer:
      "S\u00ed. Revisamos tu situaci\u00f3n contigo, te guiamos sobre los siguientes pasos y vemos si somos el equipo adecuado para acompa\u00f1arte.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-foreground/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 lg:py-6 text-left"
      >
        <span className="text-xs md:text-sm lg:text-base font-medium pr-4">{question}</span>
        <svg
          className={`h-5 w-5 lg:h-6 lg:w-6 shrink-0 text-foreground/50 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          open ? "max-h-96 pb-5 lg:pb-6" : "max-h-0"
        }`}
      >
        <p className="text-xs md:text-sm lg:text-base leading-relaxed opacity-70">{answer}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-24 lg:px-8">
      <div className="flex items-center gap-4 mb-10 md:mb-14 lg:mb-16">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
          Preguntas Frecuentes
        </h2>
        <Image src="/stickers/Recurso 79.png" alt="" width={60} height={60} aria-hidden
          className="w-10 lg:w-14 rotate-12 opacity-75 pointer-events-none select-none shrink-0" />
      </div>
      <div className="max-w-3xl lg:max-w-4xl">
        {faqs.map((faq, i) => (
          <FAQItem key={i} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </section>
  );
}

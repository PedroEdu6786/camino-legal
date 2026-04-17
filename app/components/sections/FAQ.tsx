"use client";

import Image from "next/image";
import { useState } from "react";

const faqs = [
  {
    question: "\u00bfQu\u00e9 servicios ofrecen?",
    answer:
      "Ofrecemos registro de marca, redacci\u00f3n de contratos y convenios, protecci\u00f3n de derechos de autor, t\u00e9rminos y condiciones, avisos de privacidad y asesor\u00eda legal general. Si tienes una necesidad legal para tu negocio, con gusto la revisamos contigo.",
  },
  {
    question: "\u00bfCu\u00e1nto tiempo tarda cada servicio?",
    answer:
      "Depende del servicio. Documentos como contratos, t\u00e9rminos y condiciones o avisos de privacidad pueden estar listos en pocos d\u00edas. El registro de marca ante el IMPI puede tomar entre 4 y 6 meses. En tu consulta inicial te damos un estimado claro seg\u00fan tu caso.",
  },
  {
    question: "\u00bfCu\u00e1nto cuesta trabajar con ustedes?",
    answer:
      "Cada caso es diferente, por eso te damos un presupuesto personalizado desde la consulta inicial. Siempre claro, sin costos ocultos y sin sorpresas.",
  },
  {
    question: "\u00bfNecesito saber de leyes para contactarlos?",
    answer:
      "Para nada. Nos especializamos en explicar todo de forma sencilla y sin tecnicismos. T\u00fa nos cuentas qu\u00e9 necesitas y nosotros nos encargamos del resto.",
  },
  {
    question: "\u00bfAtienden a negocios de cualquier tama\u00f1o?",
    answer:
      "S\u00ed, trabajamos con emprendedores, freelancers, peque\u00f1as empresas y negocios en crecimiento. Nuestros servicios est\u00e1n dise\u00f1ados para ser accesibles sin importar en qu\u00e9 etapa est\u00e9s.",
  },
  {
    question: "\u00bfPueden ayudarme si ya tengo un problema legal?",
    answer:
      "S\u00ed. Si ya tienes un conflicto relacionado con tu marca, un contrato o cualquier tema de propiedad intelectual, podemos asesorarte y analizar las opciones disponibles para tu situaci\u00f3n.",
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

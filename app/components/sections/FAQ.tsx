"use client";

import { useState } from "react";

const faqs = [
  {
    question: "\u00bfCu\u00e1nto tiempo tarda el registro de una marca?",
    answer:
      "El proceso ante el IMPI generalmente toma entre 4 y 6 meses desde la presentaci\u00f3n de la solicitud hasta la emisi\u00f3n del t\u00edtulo de registro, dependiendo de la carga de trabajo de la autoridad y de que no existan oposiciones.",
  },
  {
    question: "\u00bfQu\u00e9 necesito para registrar mi marca?",
    answer:
      "Necesitas definir el nombre o logotipo que deseas registrar, la clase o clases de productos y servicios que ampara, y proporcionarnos tus datos como titular. Nosotros nos encargamos del resto.",
  },
  {
    question: "\u00bfCu\u00e1nto cuesta registrar una marca?",
    answer:
      "Los costos incluyen nuestros honorarios profesionales y las tarifas oficiales del IMPI. Te proporcionamos un presupuesto claro y detallado desde la consulta inicial, sin costos ocultos.",
  },
  {
    question: "\u00bfQu\u00e9 pasa si mi marca es rechazada?",
    answer:
      "Si el IMPI emite un impedimento, analizamos las opciones disponibles: responder al requerimiento con argumentos legales, modificar la solicitud o asesorarte sobre alternativas para proteger tu identidad de marca.",
  },
  {
    question: "\u00bfPor cu\u00e1nto tiempo est\u00e1 protegida mi marca?",
    answer:
      "El registro de marca en M\u00e9xico tiene una vigencia de 10 a\u00f1os a partir de la fecha de otorgamiento, y puede renovarse por per\u00edodos iguales de forma indefinida.",
  },
  {
    question: "\u00bfPueden ayudarme si ya tengo un problema legal con mi marca?",
    answer:
      "S\u00ed, ofrecemos asesor\u00eda en casos de infracci\u00f3n, uso indebido de marca por terceros, oposiciones y cualquier controversia relacionada con propiedad intelectual.",
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
        <span className="text-sm md:text-base lg:text-lg font-medium pr-4">{question}</span>
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
        <p className="text-sm md:text-base lg:text-lg leading-relaxed opacity-70">{answer}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-7xl px-6 py-16 md:py-20 lg:py-40 lg:px-8">
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-10 md:mb-14 lg:mb-16">
        Preguntas Frecuentes
      </h2>
      <div className="max-w-3xl lg:max-w-4xl">
        {faqs.map((faq, i) => (
          <FAQItem key={i} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </section>
  );
}

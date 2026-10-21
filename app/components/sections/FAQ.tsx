import Image from "next/image";
import Link from "next/link";

const faqs = [
  {
    question: "\u00bfQu\u00e9 servicios ofrecen?",
    answer:
      "Te acompañamos en registro de marca, contratos, derechos de autor, consultoría legal y documentos para tu sitio web. Cada servicio tiene su propio alcance.",
    href: "/servicios",
    link: "Explorar servicios",
  },
  {
    question: "\u00bfCu\u00e1nto tiempo tarda cada servicio?",
    answer:
      "Depende de cada caso. Cuando nos contactes, te compartimos un estimado claro de los tiempos.",
  },
  {
    question: "\u00bfCu\u00e1nto cuesta trabajar con ustedes?",
    answer:
      "El registro de marca para una clase tiene un total de $5,899.77 MXN, con IVA incluido. Los demás servicios se cotizan según su alcance. Puedes revisar el desglose y las opciones de pago antes de comenzar.",
    href: "/cotizaciones",
    link: "Ver cotizaciones",
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

export default function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-20 lg:px-8 scroll-mt-24">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 items-start">
        <div data-reveal className="lg:sticky lg:top-28">
          <div className="flex items-center gap-4 mb-5">
            <Image src="/stickers/Recurso 79.png" alt="" width={80} height={80} aria-hidden className="w-14 h-14 lg:w-20 lg:h-20 object-contain -rotate-6" />
            <p className="text-2xl lg:text-3xl text-primary [font-family:var(--font-bellaboo)]">Todo empieza con una pregunta.</p>
          </div>
          <h2 id="faq-title" className="text-2xl lg:text-3xl font-bold tracking-tight">Resolvamos tus dudas.</h2>
          <p className="mt-4 text-sm md:text-base leading-relaxed opacity-70 max-w-sm">Lo que conviene saber antes de dar el primer paso con Camino.</p>
        </div>
        <div className="home-faq-list flex flex-col gap-3">
          {faqs.map(faq => (
            <details key={faq.question} name="home-questions" className="home-faq-item rounded-2xl bg-primary/5 open:bg-primary/10">
              <summary className="flex items-center justify-between gap-5 p-5 md:p-6 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-4">
                <span className="text-sm md:text-base font-semibold leading-relaxed">{faq.question}</span>
                <span aria-hidden="true" className="home-faq-toggle shrink-0 text-xl text-primary">+</span>
              </summary>
              <div className="px-5 pb-5 md:px-6 md:pb-6">
                <p className="text-sm md:text-base leading-relaxed opacity-75">{faq.answer}</p>
                {faq.href && <Link href={faq.href} className="inline-flex mt-4 text-sm font-semibold text-primary underline underline-offset-4 hover:decoration-2">{faq.link} <span aria-hidden="true" className="ml-2">→</span></Link>}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

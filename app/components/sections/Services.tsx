"use client";

import Image from "next/image";
import Link from "next/link";
import ServiceLink from "../ui/ServiceLink";
import { useState, type ReactNode } from "react";
import { trackEvent } from "../../lib/analytics";

const b = (text: string) => (
  <span className="font-bold text-foreground">{text}</span>
);

const services: {
  title: string;
  slug: string;
  description: ReactNode;
  sticker: string;
  accent: string;
}[] = [
  {
    title: "Protección de marca",
    slug: "registro-de-marca",
    description: (
      <>
        Gestionamos la protección, mantenimiento y defensa de tu marca.
        Analizamos su viabilidad y te acompañamos en todo el proceso, como el{" "}
        {b("registro de marca ante el IMPI")}, {b("declaración de uso")},{" "}
        {b("renovación")} y {b("acciones de defensa")}, para que puedas usarla y
        hacerla crecer con seguridad.
      </>
    ),
    sticker: "/stickers/Recurso 81.png",
    accent: "bg-primary/10",
  },
  {
    title: "Contratos y convenios",
    slug: "contratos-y-convenios",
    description: (
      <>
        Redactamos y revisamos contratos claros y adaptados a tu forma de
        trabajar, como {b("prestación de servicios")},{" "}
        {b("acuerdos de confidencialidad (NDA)")} y {b("acuerdos comerciales")}.
        Te orientamos antes de firmar para que entiendas cada compromiso,
        reduzcas riesgos y establezcas relaciones más claras.
      </>
    ),
    sticker: "/stickers/Recurso 80.png",
    accent: "bg-[#2A3D4F]/10",
  },
  {
    title: "Protección de derechos de autor",
    slug: "derechos-de-autor",
    description: (
      <>
        Gestionamos el registro de tu obra ante {b("INDAUTOR")}, asegurando el
        reconocimiento legal de tu autoría. Protegemos tus derechos y te
        respaldamos ante {b("usos no autorizados")}, para que tu trabajo esté
        protegido y puedas aprovecharlo con tranquilidad.
      </>
    ),
    sticker: "/stickers/Recurso 94.png",
    accent: "bg-secondary/10",
  },
  {
    title: "Consultoría legal",
    slug: "consultoria-legal",
    description: (
      <>
        Brindamos {b("asesoría legal personalizada")} para resolver tus dudas y
        ayudarte a tomar decisiones informadas. Analizamos tu caso específico y
        definimos estrategias para proteger tu trabajo y hacerlo avanzar con
        mayor confianza.
      </>
    ),
    sticker: "/stickers/Recurso 91.png",
    accent: "bg-[#6B3A2A]/10",
  },
  {
    title: "Paquete Web Legal",
    slug: "paquete-web-legal",
    description: (
      <>
        Desarrollamos los documentos legales necesarios para tu sitio web, como{" "}
        {b("Términos y Condiciones")}, {b("Aviso de Privacidad")} y{" "}
        {b("Aviso de Cookies")}, conforme a la{" "}
        {b("Ley Federal de Protección de Datos Personales en México")}, para que
        cumplas con tus obligaciones y generes confianza en tus usuarios.
      </>
    ),
    sticker: "/stickers/Recurso 95.png",
    accent: "bg-[#3D4F3A]/10",
  },
];

export default function Services() {
  const [selected, setSelected] = useState<number | null>(null);
  const goals = ["Mi marca", "Un contrato", "Mi obra", "Una duda legal", "Mi sitio web"];

  return (
    <section
      id="services"
      className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-24 lg:px-8"
    >
      {/* Section header */}
      <div data-reveal className="flex flex-col gap-3 mb-10 md:mb-14">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
          &iquest;En qu&eacute; podemos ayudarte?
        </h2>
        <p className="text-sm md:text-base opacity-60 leading-relaxed">
          Te acompañamos con soluciones legales claras para proteger tus ideas y
          hacer crecer tu proyecto.
        </p>
      </div>

      <div className="service-finder mb-8 md:mb-10">
        <p className="text-sm font-semibold mb-3">¿Qué te gustaría proteger o resolver?</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Encuentra tu servicio">
          {goals.map((goal, index) => (
            <button
              key={goal}
              type="button"
              aria-pressed={selected === index}
              onClick={() => setSelected(selected === index ? null : index)}
              className="service-choice rounded-lg px-4 py-2.5 text-sm font-medium"
            >
              {goal}
            </button>
          ))}
        </div>
        <div className="service-recommendation" aria-live="polite">
          {selected === null ? <p className="text-sm opacity-60">Encuentra un punto de partida para tu proyecto.</p> : (
            <p key={selected} className="text-sm">
              Podemos ayudarte con <strong>{services[selected].title.toLowerCase()}</strong>.{" "}
              <ServiceLink className="font-semibold text-primary underline underline-offset-4" href={`/servicios/${services[selected].slug}`}>Conocer este servicio &rarr;</ServiceLink>
            </p>
          )}
        </div>
      </div>

      {/* Cards grid */}
      <div className="flex flex-wrap justify-center gap-4" id="services-grid">
        {services.map((service, i) => (
          <div
            key={i}
            data-reveal="card"
            data-selected={selected === i}
            className={`camino-service-card rounded-2xl p-6 md:p-7 flex flex-col gap-5 border border-foreground/5 hover:border-foreground/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] ${service.accent}`}
          >
            {/* Sticker */}
            <div className="flex justify-between items-start">
              <Image
                src={service.sticker}
                alt=""
                width={72}
                height={72}
                aria-hidden
                priority
                className="w-14 h-14 md:w-16 md:h-16 object-contain -rotate-6 select-none pointer-events-none"
              />
            </div>

            {/* Text */}
            <div className="flex flex-col gap-2">
              <h3 className="text-base md:text-lg font-semibold leading-snug">
                {service.title}
              </h3>
              <p className="text-sm md:text-base leading-relaxed opacity-60">
                {service.description}
              </p>
            </div>
            <ServiceLink
              href={`/servicios/${service.slug}`}
              className="mt-auto pt-2 text-sm font-semibold text-primary hover:underline underline-offset-4"
            >
              Ver servicio y cotización <span className="service-link-arrow" aria-hidden="true">&rarr;</span>
            </ServiceLink>
          </div>
        ))}

        {/* CTA card */}
        <div data-reveal="card" className="camino-service-card rounded-2xl p-6 md:p-7 flex flex-col gap-5 border border-primary/20 bg-primary/5 hover:border-primary/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]">
          <div className="flex justify-between items-start">
            <Image
              src="/stickers/Recurso 88.png"
              alt=""
              width={72}
              height={72}
              aria-hidden
              className="w-14 h-14 md:w-16 md:h-16 object-contain rotate-6 select-none pointer-events-none"
            />
          </div>
          <div className="flex flex-col gap-2 flex-1">
            <h3 className="text-base md:text-lg font-semibold leading-snug">
              &iquest;No sabes cu&aacute;l necesitas?
            </h3>
            <p className="text-sm md:text-base leading-relaxed opacity-60">
              Cu&eacute;ntanos tu caso y te orientamos sobre el mejor camino para proteger tu trabajo.
            </p>
          </div>
          <Link
            href="/contacto"
            onClick={() => { trackEvent("cta_click", { source: "services" }); }}
            className="rounded-lg bg-button-bg px-6 py-3 text-sm font-semibold text-button-text tracking-widest uppercase transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95 text-center"
          >
            Cu&eacute;ntanos tu caso
          </Link>
        </div>
      </div>
    </section>
  );
}

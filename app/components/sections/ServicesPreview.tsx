import Image from "next/image";
import Link from "next/link";
import ServiceLink from "../ui/ServiceLink";
import { services } from "../../lib/services";

const accents = [
  "bg-[#9CC8DF]/25",
  "bg-[#DAC9B5]/25",
  "bg-[#CB886C]/20",
  "bg-[#CB886C]/20",
  "bg-[#9CC8DF]/25",
];

export default function ServicesPreview() {
  return (
    <section data-analytics-section="services" id="services" aria-labelledby="services-preview-title" className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-24 lg:px-8">
      <div data-reveal className="mb-8 flex flex-col gap-6 md:mb-10 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 id="services-preview-title" className="text-2xl lg:text-3xl font-bold tracking-tight">Protege lo que est&aacute;s creando.</h2>
          <p className="mt-3 max-w-xl text-sm md:text-base leading-relaxed opacity-70">
            Tu marca, tus obras, tus acuerdos y tu sitio web. Encuentra el servicio legal que necesita tu proyecto.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 shrink-0">
          <Link data-analytics-event="cta_click" data-analytics-action="home.services_all" data-analytics-source="home_services"  href="/servicios" className="text-sm font-semibold text-primary underline underline-offset-4 hover:decoration-2">
            Explorar servicios <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link data-analytics-event="cta_click" data-analytics-action="home.quotations" data-analytics-source="home_services"  href="/cotizaciones" className="text-sm font-semibold text-primary underline underline-offset-4 hover:decoration-2">Ver cotizaciones</Link>
        </div>
      </div>
      <nav aria-label="Elige un servicio" className="flex flex-wrap justify-center gap-4">
        {services.map((service, index) => (
          <ServiceLink
            key={service.slug}
            data-analytics-event="cta_click" data-analytics-action={`home.service.${service.slug}`} data-analytics-source="home_services" data-analytics-service={service.slug} href={`/servicios/${service.slug}`}
            aria-labelledby={`preview-${service.slug}`}
            data-reveal="card"
            className={`group flex w-full flex-col gap-5 rounded-2xl border border-foreground/5 p-6 md:p-7 sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)] transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transform-none motion-reduce:transition-none ${accents[index]}`}
          >
            <Image
              src={service.image}
              alt=""
              width={72}
              height={72}
              className="h-14 w-14 object-contain -rotate-6 md:h-16 md:w-16 transition-transform duration-200 group-hover:rotate-0 motion-reduce:transform-none motion-reduce:transition-none"
            />
            <div>
              <h3 id={`preview-${service.slug}`} className="text-base md:text-lg font-semibold leading-snug">{service.title}</h3>
              <p className="mt-2 text-sm md:text-base leading-relaxed opacity-70">{service.description}</p>
            </div>
            <span className="mt-auto pt-2 text-sm font-semibold text-primary underline-offset-4 group-hover:underline">
              Ver servicio <span aria-hidden="true">&rarr;</span>
            </span>
          </ServiceLink>
        ))}
      </nav>
    </section>
  );
}

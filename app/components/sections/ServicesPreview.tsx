import Image from "next/image";
import Link from "next/link";

export default function ServicesPreview() {
  return (
    <section id="services" aria-labelledby="services-preview-title" className="mx-auto max-w-7xl px-6 py-10 md:py-14 lg:px-8">
      <div data-reveal className="group rounded-2xl bg-primary/10 p-6 md:p-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
        <Image
          src="/stickers/Recurso 81.png"
          alt=""
          width={112}
          height={112}
          aria-hidden
          className="w-16 h-16 md:w-24 md:h-24 shrink-0 object-contain -rotate-6 transition-transform duration-300 group-hover:rotate-0 motion-reduce:transition-none"
        />
        <div className="flex-1">
          <h2 id="services-preview-title" className="text-2xl lg:text-3xl font-bold tracking-tight">Protege lo que est&aacute;s creando.</h2>
          <p className="mt-3 max-w-xl text-sm md:text-base leading-relaxed opacity-70">
            Tu marca, tus obras, tus acuerdos y tu sitio web. Encuentra el servicio legal que necesita tu proyecto.
          </p>
        </div>
        <div className="flex flex-col items-start md:items-center gap-4 shrink-0">
          <Link href="/servicios" className="w-full md:w-auto rounded-lg bg-button-bg px-6 py-3 text-center text-sm font-semibold text-button-text transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 motion-reduce:transform-none">
            Explorar servicios <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link href="/cotizaciones" className="text-sm font-semibold text-primary underline underline-offset-4 hover:decoration-2">Ver cotizaciones</Link>
        </div>
      </div>
    </section>
  );
}

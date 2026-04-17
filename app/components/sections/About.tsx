import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="relative mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-24 lg:px-8">
      {/* Decorative stickers */}
      <Image src="/stickers/Recurso 100.png" alt="" width={90} height={90} aria-hidden
        className="hidden lg:block pointer-events-none select-none absolute top-12 right-6 w-20 -rotate-6 opacity-65" />
      <Image src="/stickers/Recurso 101.png" alt="" width={90} height={90} aria-hidden
        className="hidden lg:block pointer-events-none select-none absolute bottom-24 right-10 w-20 rotate-6 opacity-65" />
      <Image src="/stickers/Recurso 82.png" alt="" width={100} height={110} aria-hidden
        className="hidden lg:block pointer-events-none select-none absolute bottom-16 left-4 w-20 -rotate-3 opacity-55" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center">
        <div className="flex flex-col gap-5 lg:gap-6">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
            &iquest;Qui&eacute;nes somos?
          </h2>
          <p className="text-xs md:text-sm lg:text-base leading-relaxed">
            <span className="font-bold">Camino Legal&reg;</span> naci&oacute; con una idea
            sencilla: que los emprendedores y negocios en M&eacute;xico puedan acceder a
            asesor&iacute;a legal de calidad, sin lenguaje complicado ni procesos engorrosos.
          </p>
          <p className="text-xs md:text-sm lg:text-base leading-relaxed">
            Somos un equipo de profesionales legales especializados en derecho empresarial
            y propiedad intelectual. Te acompa&ntilde;amos en contratos, marcas, derechos de
            autor, t&eacute;rminos y condiciones, avisos de privacidad y mucho m&aacute;s &mdash;
            siempre de forma cercana, clara y a tu ritmo.
          </p>
        </div>

        <div className="flex flex-col gap-5 lg:gap-6">
          <div className="rounded-xl bg-primary/10 p-6 md:p-8">
            <h3 className="text-base md:text-lg font-semibold mb-2">Nuestra misi&oacute;n</h3>
            <p className="text-xs md:text-sm leading-relaxed">
              Hacer el derecho accesible. Que ning&uacute;n emprendedor tenga que navegar
              solo el mundo legal &mdash; estamos aqu&iacute; para simplificar cada paso.
            </p>
          </div>
          <div className="rounded-xl bg-secondary/10 p-6 md:p-8">
            <h3 className="text-base md:text-lg font-semibold mb-2">Nuestra visi&oacute;n</h3>
            <p className="text-xs md:text-sm leading-relaxed">
              Ser el aliado legal de confianza para todo negocio en M&eacute;xico &mdash;
              desde el primer contrato hasta la protecci&oacute;n completa de su identidad y operaciones.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

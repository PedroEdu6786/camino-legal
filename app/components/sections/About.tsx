export default function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-6 py-16 pb-24 md:py-20 md:pb-32 lg:py-40 lg:pb-52 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center">
        <div className="flex flex-col gap-5 lg:gap-6">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
            &iquest;Qui&eacute;nes somos?
          </h2>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed">
            <span className="font-bold">Camino Legal&reg;</span> naci&oacute; con una
            misi&oacute;n clara: hacer accesible la protecci&oacute;n legal de marcas para
            emprendedores y negocios en M&eacute;xico. Creemos que cada idea merece ser
            protegida y que el proceso no tiene por qu&eacute; ser complicado.
          </p>
          <p className="text-sm md:text-base lg:text-lg leading-relaxed">
            Somos un equipo de profesionales especializados en propiedad intelectual,
            con experiencia en el registro de marcas ante el Instituto Mexicano de la
            Propiedad Industrial (IMPI). Acompa&ntilde;amos a nuestros clientes desde la
            consulta inicial hasta la obtenci&oacute;n de su t&iacute;tulo de registro.
          </p>
        </div>

        <div className="flex flex-col gap-5 lg:gap-6">
          <div className="rounded-xl bg-primary/10 p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-semibold mb-2">Nuestra misi&oacute;n</h3>
            <p className="text-sm md:text-base leading-relaxed">
              Simplificar el camino hacia la protecci&oacute;n de tu marca, brind&aacute;ndote
              un servicio cercano, transparente y profesional en cada etapa del proceso.
            </p>
          </div>
          <div className="rounded-xl bg-secondary/10 p-6 md:p-8">
            <h3 className="text-lg md:text-xl font-semibold mb-2">Nuestra visi&oacute;n</h3>
            <p className="text-sm md:text-base leading-relaxed">
              Ser el aliado de confianza para todo emprendedor que busca proteger su
              identidad de marca en M&eacute;xico, con un servicio &aacute;gil y accesible.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

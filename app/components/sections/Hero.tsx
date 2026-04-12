export default function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-15 md:py-24 lg:min-h-[calc(100vh-6rem)] lg:py-0 lg:px-8 flex flex-col justify-center lg:items-center lg:text-center gap-8 lg:gap-10">
      <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight max-w-4xl animate-fade-up">
        El <span className="text-secondary">camino</span> se hace al decidir
        avanzar
      </h1>
      <p className="text-sm md:text-base lg:text-xl max-w-2xl lg:max-w-3xl animate-fade-up animation-delay-200">
        En <span className="font-bold">Camino Legal&reg;</span> te acompañamos en todo el proceso de
        registro de tu marca para que puedas proteger tu negocio de forma
        clara, segura y sin complicaciones.
      </p>
      <a
        href="https://api.whatsapp.com/send/?phone=529992505160&text&type=phone_number&app_absent=0"
        target="_blank"
        rel="noopener noreferrer"
        className="self-start rounded-md bg-button-bg px-4 py-2 text-sm font-semibold text-button-text transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-95 active:shadow-none md:px-6 md:py-3 md:text-base lg:px-8 lg:py-4 lg:text-lg lg:self-center animate-fade-up animation-delay-400"
      >
        Contactanos
      </a>
    </section>
  );
}

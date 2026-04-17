import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative overflow-hidden mx-auto max-w-7xl px-6 min-h-[calc(100dvh-4rem)] md:min-h-[calc(100dvh-5rem)] lg:min-h-[calc(100dvh-6rem)] lg:px-8 flex items-center py-10 lg:py-0">
      {/* Decorative stickers — desktop only */}
      <Image
        src="/stickers/Recurso 91.png"
        alt=""
        width={100}
        height={100}
        aria-hidden
        className="hidden lg:block pointer-events-none select-none absolute top-14 right-10 w-20 rotate-12 opacity-60"
      />
      <Image
        src="/stickers/Recurso 93.png"
        alt=""
        width={70}
        height={70}
        aria-hidden
        className="hidden lg:block pointer-events-none select-none absolute top-1/3 left-2 w-10 -rotate-12 opacity-50"
      />
      <Image
        src="/stickers/Recurso 85.png"
        alt=""
        width={140}
        height={70}
        aria-hidden
        className="hidden lg:block pointer-events-none select-none absolute bottom-20 right-8 w-28 -rotate-6 opacity-55"
      />
      <Image
        src="/stickers/Recurso 84.png"
        alt=""
        width={80}
        height={80}
        aria-hidden
        className="hidden lg:block pointer-events-none select-none absolute bottom-1/4 left-4 w-14 rotate-6 opacity-50"
      />
      <div className="flex flex-col items-center text-center gap-10 md:gap-12 w-full">
        {/* Eyebrow label */}
        <div className="flex items-center gap-3 animate-fade-up">
          <span className="h-px w-6 bg-secondary opacity-60" />
          <span className="text-[14px] uppercase tracking-[0.25em] text-secondary font-semibold">
            Asesor&iacute;a Legal &middot; M&eacute;xico
          </span>
          <span className="h-px w-6 bg-secondary opacity-60" />
        </div>

        {/* Headline */}
        <h1 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tight max-w-4xl animate-fade-up animation-delay-200 [font-family:var(--font-poppins)] leading-[1.05]">
          El <span className="text-secondary">camino</span> se hace al decidir
          avanzar
        </h1>

        {/* Subtitle */}
        <p className="text-xs md:text-base lg:text-lg max-w-xl lg:max-w-2xl opacity-70 animate-fade-up animation-delay-200 leading-relaxed">
          Acompañamiento legal para artistas, personas creadoras y negocios. 
        </p>

        {/* CTA */}
        <div className="flex animate-fade-up animation-delay-400">
          <a
            href="https://api.whatsapp.com/send/?phone=529992505160&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-button-bg px-8 py-4 text-sm font-semibold text-button-text tracking-widest uppercase transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-95"
          >
            Escr&iacute;benos
          </a>
        </div>

        {/* Trust indicators */}
        <div className="grid grid-cols-2 w-full max-w-[14rem] md:max-w-xs border-t border-foreground/10 pt-6 animate-fade-up animation-delay-400 gap-4">
          <div className="flex flex-col gap-0.5 items-center">
            <span className="text-lg md:text-xl font-black text-foreground [font-family:var(--font-poppins)]">
              &Aacute;gil
            </span>
            <span className="text-[14px] tracking-wide uppercase text-foreground/50 leading-tight">
              Y eficiente
            </span>
          </div>
          <div className="flex flex-col gap-0.5 items-center border-l border-foreground/10 pl-4">
            <span className="text-lg md:text-xl font-black text-foreground [font-family:var(--font-poppins)]">
              Seguro
            </span>
            <span className="text-[14px] tracking-wide uppercase text-foreground/50 leading-tight">
              Y transparente
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

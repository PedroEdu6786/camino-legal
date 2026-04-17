import Image from "next/image";

const services = [
  {
    title: "Registro de Marca",
    description: "Te guiamos paso a paso para proteger tu marca ante el IMPI. Revisamos la viabilidad, gestionamos el trámite y damos seguimiento a cualquier notificación o requerimiento.",
    sticker: "/stickers/Recurso 81.png",
    accent: "bg-primary/10",
  },
  {
    title: "Contratos y Convenios",
    description: "Si necesitas formalizar un acuerdo, elaboramos contratos a la medida y conforme a la ley. También podemos asesorarte antes de firmar cualquier documento.",
    sticker: "/stickers/Recurso 80.png",
    accent: "bg-[#2A3D4F]/10",
  },
  {
    title: "Derechos de Autor",
    description: "Si creaste una obra, te acompañamos en su registro ante INDAUTOR y conocer de tus derechos adquiridos.",
    sticker: "/stickers/Recurso 94.png",
    accent: "bg-secondary/10",
  },
  {
    title: "T\u00e9rminos y Condiciones",
    description: "Redactamos términos y condiciones adaptados a tu actividad o proyecto, definiendo condiciones claras y protegiendo tu relación con clientes o usuarios.",
    sticker: "/stickers/Recurso 95.png",
    accent: "bg-[#3D4F3A]/10",
  },
  {
    title: "Aviso de Privacidad",
    description: "Elaboramos tu aviso de privacidad conforme a la normativa aplicable en México, ayudándote a cumplir con la ley y evitar riesgos por el manejo de datos personales.",
    sticker: "/stickers/Recurso 73.png",
    accent: "bg-foreground/[0.06]",
  },
  {
    title: "Asesor\u00eda Legal",
    description: "Si eres artista, persona creadora o estás por emprender, puedes agendar una asesoría para resolver dudas y tomar decisiones con mayor claridad.",
    sticker: "/stickers/Recurso 91.png",
    accent: "bg-[#6B3A2A]/10",
  },
];

export default function Services() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-24 lg:px-8">

      {/* Section header */}
      <div className="flex flex-col gap-3 mb-10 md:mb-14">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
          &iquest;En qu&eacute; podemos ayudarte?
        </h2>
        <p className="text-sm md:text-base opacity-60 leading-relaxed">
          Desde registrar tu marca hasta redactar tus contratos, estamos para acompa&ntilde;arte en todo lo legal.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {services.map((service, i) => (
          <div
            key={i}
            className={`rounded-2xl p-6 md:p-7 flex flex-col gap-5 border border-foreground/5 hover:border-foreground/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${service.accent}`}
          >
            {/* Sticker */}
            <div className="flex justify-between items-start">
              <Image
                src={service.sticker}
                alt=""
                width={72}
                height={72}
                aria-hidden
                className="w-14 h-14 md:w-16 md:h-16 object-contain -rotate-6 select-none pointer-events-none"
              />
            </div>

            {/* Text */}
            <div className="flex flex-col gap-2">
              <h3 className="text-base md:text-lg font-semibold leading-snug">{service.title}</h3>
              <p className="text-sm md:text-base leading-relaxed opacity-60">{service.description}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
}

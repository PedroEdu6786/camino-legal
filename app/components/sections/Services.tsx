import ServiceCard from "../ui/ServiceCard";

const TrademarkIcon = () => (
  <svg className="h-8 w-8 lg:h-10 lg:w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
  </svg>
);

const ScalesIcon = () => (
  <svg className="h-8 w-8 lg:h-10 lg:w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="h-8 w-8 lg:h-10 lg:w-10" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const services = [
  {
    title: "Registro de Marca",
    description:
      "Te guiamos paso a paso en el proceso de registro de tu marca ante el IMPI, asegurando que tu identidad quede protegida legalmente.",
    className: "bg-primary text-background",
    tiltDeg: -5,
    icon: <TrademarkIcon />,
  },
  {
    title: "Consultoría Legal",
    description:
      "Analizamos tu caso particular y te brindamos asesoría personalizada para que tomes las mejores decisiones legales para tu negocio.",
    className: "bg-foreground text-background",
    tiltDeg: 0,
    icon: <ScalesIcon />,
  },
  {
    title: "Protección de Propiedad Intelectual",
    description:
      "Protegemos tus creaciones, diseños y obras con estrategias legales que resguardan tu propiedad intelectual ante terceros.",
    className: "bg-secondary text-background",
    tiltDeg: 5,
    icon: <ShieldIcon />,
  },
];

export default function Services() {
  return (
    <section id="services" className="px-4 py-16 md:py-20 md:px-6 lg:py-40 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:-mx-4">
        {services.map((service, i) => (
          <ServiceCard
            key={i}
            title={service.title}
            description={service.description}
            icon={service.icon}
            className={`${service.className} ${i === 1 ? "lg:z-20 lg:-mx-4" : "lg:z-10"}`}
            tiltDeg={service.tiltDeg}
            style={{ transitionDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </section>
  );
}

import BrandArtwork from "../ui/BrandArtwork";
import Link from "next/link";

const principles = [
  { title: "Hablamos claro.", description: "Entiende tus opciones y cada decisión, sin tecnicismos innecesarios." },
  { title: "Miramos tu proyecto de cerca.", description: "Evaluamos riesgos y viabilidad. Si hace falta otro camino, buscamos alternativas contigo." },
  { title: "Te acompañamos de verdad.", description: "Orientación cercana, honesta y estratégica para proteger tu trabajo y seguir creando." },
];

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative mx-auto max-w-7xl px-6 py-12 md:py-16 lg:py-24 lg:px-8">
      <div className="grid gap-8 md:gap-10 lg:gap-16 md:grid-cols-[0.9fr_1.1fr] items-center">
        <BrandArtwork />
        <div>
          <div data-reveal>
            <h2 id="about-title" className="text-2xl lg:text-3xl font-bold tracking-tight">Conoce a Camino.</h2>
            <p className="mt-5 text-xl lg:text-2xl font-semibold leading-snug text-primary">Detrás de cada proyecto,<br className="hidden lg:block" /> hay alguien que se atreve.</p>
            <p className="mt-4 text-sm md:text-base leading-relaxed opacity-80">En <strong>CL Camino Legal&reg;</strong> acercamos el derecho a artistas, personas creadoras y negocios. Queremos que puedas proteger lo que haces y tomar decisiones con confianza.</p>
          </div>
          <ul className="mt-7 lg:mt-9 flex flex-col gap-5 lg:gap-6">
            {principles.map(principle => (
              <li key={principle.title} data-reveal className="about-principle flex gap-4 items-start">
                <span aria-hidden="true" className="about-principle-arrow shrink-0 text-2xl text-secondary leading-none pt-1">↗</span>
                <div><h3 className="text-base lg:text-lg font-semibold">{principle.title}</h3><p className="mt-1 text-sm leading-relaxed opacity-70 max-w-md">{principle.description}</p></div>
              </li>
            ))}
          </ul>
          <Link href="/nosotros" className="about-story-link inline-flex items-center gap-3 mt-8 rounded-lg bg-button-bg text-button-text px-6 py-3 text-sm font-semibold transition-transform hover:-translate-y-0.5 motion-reduce:transform-none">Más sobre Camino <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}

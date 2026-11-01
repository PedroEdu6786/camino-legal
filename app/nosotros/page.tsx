import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Reviews from "../components/sections/Reviews";
import Process from "../components/sections/Process";
import BrandArtwork from "../components/ui/BrandArtwork";
import SiteFrame from "../components/layout/SiteFrame";
export const metadata: Metadata = { title: "Conoce a Camino | Camino Legal", description: "Acompañamiento legal cercano para artistas, personas creadoras y negocios en México." };
export default function AboutPage() {
  return <SiteFrame>
    <section data-analytics-section="about_hero" className="site-container route-hero about-route-hero">
      <div data-reveal><p className="hand-note">Mucho gusto, somos Camino.</p><h1>Tu proyecto.<br />Nuestro compromiso.</h1><p>Acercamos el derecho a artistas, personas creadoras y negocios. Para que entiendas tus opciones, protejas tu trabajo y tomes decisiones con confianza.</p><Link className="site-button" data-analytics-event="cta_click" data-analytics-action="about.contact" data-analytics-source="about"  href="/contacto">Hablemos de tu proyecto →</Link></div>
      <BrandArtwork />
    </section>
    <section data-analytics-section="about_belief" className="site-container brand-belief"><div data-reveal><h2>Detrás de tu trabajo<br />hay mucho de ti.</h2><p>Tiempo, ideas, decisiones y ganas de hacerlo crecer. Nuestro acompañamiento parte de entender ese contexto. También queremos ser un espacio de inspiración y aprendizaje que promueva el reconocimiento del trabajo creativo.</p></div><p className="hand-note" data-reveal>Nos importa lo que<br />estás construyendo.</p></section>
    <section data-analytics-section="about_principles" className="site-container section-space"><div className="section-heading"><h2>Así entendemos el acompañamiento.</h2><p>Una relación cercana, con claridad desde el primer día.</p></div><div className="brand-principles">{[
      ["Recurso 80.png", "Palabras que entiendes", "Explicamos tus opciones y compromisos con lenguaje claro. Queremos que sepas qué estás decidiendo y por qué."],
      ["Recurso 91.png", "Criterio antes de avanzar", "Evaluamos riesgos y viabilidad. Si una opción no conviene, te lo decimos y buscamos alternativas contigo."],
      ["Recurso 81.png", "Tu proyecto, de cerca", "Partimos de tu contexto para definir una estrategia, compartir avances y acompañarte en las decisiones que siguen."],
    ].map(([image,title,description]) => <article data-reveal key={title}><Image src={`/stickers/${image}`} width={100} height={100} alt="" /><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <Process />
    <section data-analytics-section="contact" className="site-container"><div className="route-invitation"><div><h2>¿Qué estás creando?</h2><p>Una marca, una obra, un negocio. Hay un punto de partida para protegerlo.</p></div><Link className="site-button" data-analytics-event="cta_click" data-analytics-action="about.services" data-analytics-source="about"  href="/servicios">Explorar servicios →</Link></div></section>
    <Reviews />
  </SiteFrame>;
}

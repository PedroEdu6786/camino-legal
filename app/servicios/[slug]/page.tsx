import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import PreparationChecklist from "../../components/sections/PreparationChecklist";
import SiteFrame from "../../components/layout/SiteFrame";
import { services, money, trademarkQuote } from "../../lib/services";

export function generateStaticParams() { return services.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find(s => s.slug === slug);
  return { title: service ? `${service.title} | Camino Legal` : "Servicio no encontrado", description: service?.description };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find(s => s.slug === slug);
  if (!service) notFound();
  const trademark = slug === "registro-de-marca";
  return <SiteFrame>
    <div className="site-container breadcrumb"><Link href="/servicios">Servicios</Link><span aria-hidden="true"> / </span><span>{service.title}</span></div>
    <section className="site-container route-hero service-route-hero">
      <div data-reveal><h1>{service.title}</h1><p>{service.description}</p><div className="route-actions"><Link className="site-button" href={`/cotizaciones?servicio=${slug}`}>{trademark ? "Calcular mi inversión" : "Solicitar cotización"} →</Link><a className="text-link" href="#alcance">Conocer el alcance ↓</a></div></div>
      <div className="service-stage" data-reveal><Image src={service.image} alt="" width={280} height={280} priority /><p className="hand-note">{service.short}</p><a href="#inversion" className="service-stage-price">{trademark ? <><strong>{money(trademarkQuote(1).total)} MXN</strong><span>Una clase · IVA incluido · Ver desglose ↗</span></> : <><strong>Un alcance a tu medida</strong><span>Conoce cómo cotizamos ↗</span></>}</a></div>
    </section>
    <nav className="site-container service-jump-links" aria-label="En esta página"><a href="#alcance">Qué incluye ↓</a><a href="#entregables">Qué recibes ↓</a><a href="#inversion">Cuánto cuesta ↓</a><a href="#preparacion">Qué necesitas ↓</a></nav>
    <section id="alcance" className="site-container section-space service-scope"><div data-reveal><p className="hand-note">Hagamos espacio para tus ideas.</p><h2>Nos ocupamos<br />de la parte legal.</h2><p>Esto es lo que trabajamos contigo:</p></div><ul className="scope-items">{service.includes.map((item,index) => <li data-reveal key={item}><span aria-hidden="true">{String(index+1).padStart(2,"0")}</span>{item}</li>)}</ul></section>
    {trademark && <section className="soft-band"><div className="site-container"><h2>Así avanza tu registro</h2><ol className="process-columns"><li><h3>Evaluación</h3><p className="timing">3 días hábiles</p><p>Revisamos clasificación, distintividad, disponibilidad y riesgos. Definimos la clase y la estrategia para tu marca.</p></li><li><h3>Preparación</h3><p className="timing">6 días hábiles</p><p>Validamos documentos, preparamos la solicitud y gestionamos su presentación y el pago de la tarifa oficial.</p></li><li><h3>Seguimiento</h3><p className="timing">5 meses aproximadamente</p><p>Atendemos notificaciones, compartimos informes y damos seguimiento hasta la resolución.</p></li></ol><p className="fine-print">Tiempos estimados de la cotización 2026. La resolución y sus plazos dependen del IMPI; el servicio no garantiza la concesión del registro.</p></div></section>}
    <section id="entregables" className="site-container section-space"><div className="deliverable-sheet" data-reveal><div><Image src="/stickers/Recurso 80.png" width={90} height={90} alt="" /><h2>Lo que queda en tus manos.</h2><p>Los entregables corresponden al servicio y al alcance acordados en tu propuesta.</p></div><ul className="content-list">{service.deliverables.map(item => <li key={item}>{item}</li>)}</ul></div></section>
    <section id="inversion" className="cost-band service-investment"><div className="site-container editorial-grid"><div><h2>Tu inversión</h2><p>{service.factors}</p></div><div>{trademark ? <><p>Una clase · IVA incluido</p><p className="display-price">{money(trademarkQuote(1).total)} <small>MXN</small></p><p>Empieza con $799 MXN por la evaluación de viabilidad, incluidos en el total. Elige pago único, dos o tres pagos.</p><p className="fine-print">Reglas de Uso: $616 MXN adicionales cuando hay más de un titular. Otros cargos del IMPI se cotizan según el caso.</p></> : <><h3>Cotización personalizada</h3><p>Antes de comenzar, tu propuesta define honorarios, entregables, tiempos y cualquier gasto adicional aplicable.</p></>}<Link className="site-button light" href={`/cotizaciones?servicio=${slug}`}>{trademark ? "Ver desglose y pagos" : "Preparar mi solicitud"} ↗</Link></div></div></section>
    <section id="preparacion" className="site-container section-space preparation-layout"><div data-reveal><h2>Tu siguiente paso<br />empieza aquí.</h2><p>No necesitas tener todas las respuestas. Esta lista te ayuda a reunir la información para hablar de tu caso.</p><Image src={service.image} alt="" width={180} height={180} className="preparation-art" /></div><PreparationChecklist key={slug} items={service.needs} slug={slug} /></section>
    {trademark && <section className="site-container faq-section"><h2>Antes de dar el paso</h2>{[
      ["¿Ya tienes una marca registrada?", "También te acompañamos en declaración de uso, renovación y acciones de defensa. Estos servicios se cotizan por separado según el caso."],
      ["¿Qué es una clase?", "Es la categoría de productos o servicios para la que se solicita la protección. La evaluación permite identificar las clases que corresponden a tu actividad."],
      ["¿Puedo contratar solo la evaluación?", "Sí. Puedes empezar con la evaluación de $799 MXN y, al recibir los resultados, decidir si continúas con la preparación de la solicitud."],
      ["¿Qué pasa si la evaluación es negativa?", "Te orientamos sobre alternativas. El servicio incluye una segunda evaluación de viabilidad."],
      ["¿Qué pasa después de la resolución?", "Si el IMPI concede el registro, recibirás el título, el manual de uso de tu marca y recordatorios calendarizables de declaración de uso y renovación."],
    ].map(([q,a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>}
    <div className="site-container end-link"><Link className="text-link" href="/servicios">← Explorar otros servicios</Link></div>
  </SiteFrame>;
}

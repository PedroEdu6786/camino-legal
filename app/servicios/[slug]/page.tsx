import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import SiteFrame from "../../components/layout/SiteFrame";
import TrademarkJourney from "../../components/sections/TrademarkJourney";
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
    <div className="site-container breadcrumb"><Link data-analytics-event="navigation_click" data-analytics-action="service.breadcrumb" data-analytics-source="service_detail"  href="/servicios">Servicios</Link><span aria-hidden="true"> / </span><span>{service.title}</span></div>
    <section data-analytics-section="service_hero" className="site-container route-hero service-route-hero">
      <div data-reveal><h1>{service.title}</h1><p>{service.description}</p><div className="route-actions"><Link className="site-button" data-analytics-event="cta_click" data-analytics-action={`service.quote.${slug}`} data-analytics-source="service_detail" data-analytics-service={slug} href={`/cotizaciones?servicio=${slug}`}>Solicitar cotización →</Link></div></div>
      <div className="service-stage" data-reveal><Image src={service.image} alt="" width={280} height={280} priority /><p className="hand-note">{service.short}</p><div className="service-stage-price">{trademark ? <><strong>{money(trademarkQuote(1).total)} MXN</strong><span>Una clase · IVA incluido</span></> : <><strong>Un alcance a tu medida</strong><span>Cotización según tu proyecto</span></>}</div></div>
    </section>
    <section data-analytics-section="service.scope" id="alcance" className="site-container section-space service-scope"><div data-reveal><p className="hand-note">Hagamos espacio para tus ideas.</p><h2>Nos ocupamos<br />de la parte legal.</h2><p>Esto es lo que trabajamos contigo:</p></div><ul className="scope-items">{service.includes.map((item,index) => <li data-reveal key={item}><span aria-hidden="true">{String(index+1).padStart(2,"0")}</span>{item}</li>)}</ul></section>
    {trademark && <TrademarkJourney />}
    <section data-analytics-section="service.deliverables" id="entregables" className="site-container section-space"><div className="deliverable-sheet" data-reveal><div><Image src="/stickers/Recurso 80.png" width={90} height={90} alt="" /><h2>Lo que queda en tus manos.</h2><p>Los entregables corresponden al servicio y al alcance acordados en tu propuesta.</p></div><ul className="content-list">{service.deliverables.map(item => <li key={item}>{item}</li>)}</ul></div></section>
    <section data-analytics-section="service.investment" id="inversion" className="cost-band service-investment"><div className="site-container editorial-grid"><div><h2>Tu inversión</h2><p>{service.factors}</p></div><div>{trademark ? <><p>Una clase · IVA incluido</p><p className="display-price">{money(trademarkQuote(1).total)} <small>MXN</small></p><p>Empieza con $799 MXN por la evaluación de viabilidad, incluidos en el total. Elige pago único, dos o tres pagos.</p><p className="fine-print">Reglas de Uso: $616 MXN adicionales cuando hay más de un titular. Otros cargos del IMPI se cotizan según el caso.</p></> : <><h3>Cotización personalizada</h3><p>Antes de comenzar, tu propuesta define honorarios, entregables, tiempos y cualquier gasto adicional aplicable.</p></>}</div></div></section>
    <section data-analytics-section="service.preparation" id="preparacion" className="site-container section-space"><div className="preparation-sheet preparation-layout" data-reveal><div><h2>¿Qué necesitas?</h2><p>Esta información nos ayuda a conocer tu caso. Si te falta algo, podemos orientarte.</p></div><ul className="content-list">{service.needs.map(item => <li key={item}>{item}</li>)}</ul></div></section>
    {trademark && <section data-analytics-section="faq" className="site-container faq-section"><h2>Antes de dar el paso</h2>{[
      ["¿Ya tienes una marca registrada?", "También te acompañamos en declaración de uso, renovación y acciones de defensa. Estos servicios se cotizan por separado según el caso."],
      ["¿Qué es una clase?", "Es la categoría de productos o servicios para la que se solicita la protección. La evaluación permite identificar las clases que corresponden a tu actividad."],
      ["¿Puedo contratar solo la evaluación?", "Sí. Puedes empezar con la evaluación de $799 MXN y, al recibir los resultados, decidir si continúas con la preparación de la solicitud."],
      ["¿Qué pasa si la evaluación es negativa?", "Te orientamos sobre alternativas. El servicio incluye una segunda evaluación de viabilidad."],
      ["¿Qué pasa después de la resolución?", "Si el IMPI concede el registro, recibirás el título, el manual de uso de tu marca y recordatorios calendarizables de declaración de uso y renovación."],
    ].map(([q,a], index) => <details data-analytics-faq={`trademark.faq.${index + 1}`} key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>}
    <div className="site-container end-link"><Link data-analytics-event="navigation_click" data-analytics-action="service.back" data-analytics-source="service_detail"  className="text-link" href="/servicios">← Explorar otros servicios</Link></div>
  </SiteFrame>;
}

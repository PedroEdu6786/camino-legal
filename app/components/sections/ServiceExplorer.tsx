"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { services, money, trademarkQuote } from "../../lib/services";

const goals = ["Mi marca", "Mis acuerdos", "Mi obra", "Una decisión", "Mi sitio web"];

export default function ServiceExplorer() {
  const [active, setActive] = useState(0);
  const service = services[active];
  return <section className="site-container explorer-section" aria-labelledby="explorer-title">
    <div className="explorer-heading"><h1 id="explorer-title">¿Qué quieres proteger?</h1><p>Tu proyecto tiene su propio camino. Encuentra el apoyo legal para dar el siguiente paso.</p></div>
    <p className="explorer-prompt">Selecciona lo que necesitas ↓</p>
    <div className="explorer-layout">
      <div className="explorer-choices" role="group" aria-label="Elige lo que quieres proteger">
        {services.map((item, index) => <button type="button" key={item.slug} aria-pressed={active === index} aria-controls="service-preview" onClick={() => setActive(index)}><Image src={item.image} width={48} height={48} alt="" /><span>{goals[index]}<small>{item.title}</small></span><span aria-hidden="true">→</span></button>)}
      </div>
      <div id="service-preview" className="explorer-preview" aria-live="polite" aria-atomic="true">
        <div key={service.slug} className="explorer-preview-inner">
          <div className="explorer-art"><Image src={service.image} width={220} height={220} alt="" /><span className="hand-note">{service.short}</span></div>
          <div><h2>{service.title}</h2><p>{service.description}</p><p className="explorer-price">{active === 0 ? `${money(trademarkQuote(1).total)} MXN · una clase, IVA incluido` : "Cotización según el alcance de tu proyecto"}</p><Link className="site-button" href={`/servicios/${service.slug}`}>Conocer el servicio <span aria-hidden="true">→</span></Link></div>
        </div>
      </div>
    </div>
    <nav className="service-index" aria-label="Todas las páginas de servicios">{services.map(item => <Link key={item.slug} href={`/servicios/${item.slug}`}>{item.title} <span aria-hidden="true">↗</span></Link>)}</nav>
    <div className="route-invitation"><div><h2>También puedes empezar con una pregunta.</h2><p>Cuéntanos qué estás creando o qué necesitas resolver. Te ayudamos a encontrar un punto de partida.</p></div><Link className="site-button" href="/contacto">Cuéntanos tu caso →</Link></div>
  </section>;
}

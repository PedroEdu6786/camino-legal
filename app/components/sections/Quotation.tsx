"use client";
import { useState } from "react";
import Link from "next/link";
import { services, money, quoteEmail, trademarkQuote } from "../../lib/services";

export default function Quotation({ initialService }: { initialService: string }) {
  const [slug, setSlug] = useState(initialService);
  const [classes, setClasses] = useState(1);
  const [rules, setRules] = useState(false);
  const [payments, setPayments] = useState(3);
  const service = services.find(s => s.slug === slug) ?? services[0];
  const quote = trademarkQuote(classes, rules);
  const trademark = service.slug === "registro-de-marca";
  const schedule: readonly (readonly [string, number])[] = payments === 1
    ? [["Al inicio", quote.total]]
    : payments === 2
      ? [["Al inicio", quote.evaluation + quote.management], ["Antes de la preparación", quote.official]]
      : [["Al inicio", quote.evaluation], ["Antes de la preparación", quote.official], ["Al entregar el acuse", quote.management]];
  const emailDetail = trademark
    ? `Me interesa una marca en ${classes} clases.\nReglas de Uso: ${rules ? "sí" : "no"}.\nEstimado: ${money(quote.total)} MXN, IVA incluido.\nModalidad: ${payments} pago(s).${rules && payments !== 1 ? " El momento de pago de Reglas de Uso queda por confirmar." : ""}\nQuisiera confirmar el alcance y los próximos pasos.`
    : "Quisiera una propuesta con alcance, honorarios, tiempos y entregables.";
  return <div className="quote-workspace">
    <div className="quote-controls">
      <div className="quote-field-group"><label htmlFor="quote-service">¿Qué necesitas?</label>
      <select id="quote-service" value={service.slug} onChange={e => setSlug(e.target.value)}>{services.map(s => <option key={s.slug} value={s.slug}>{s.title}</option>)}</select>
      <Link className="quote-service-link" href={`/servicios/${service.slug}`}>Ver qué incluye este servicio ↗</Link></div>
      {trademark ? <>
        <div className="quote-field-group"><label htmlFor="quote-classes">¿Cuántas clases necesitas?</label>
        <select id="quote-classes" value={classes} onChange={e => setClasses(Number(e.target.value))}>{Array.from({length: 10}, (_,i) => <option key={i+1} value={i+1}>{i+1} {i === 0 ? "clase" : "clases"}</option>)}</select>
        <p className="fine-print">¿No lo sabes aún? Empieza con una; lo revisamos contigo. Para más de diez, contáctanos.</p>
        <label className="checkbox-label"><input type="checkbox" checked={rules} onChange={e => setRules(e.target.checked)} /><span>La marca tendrá más de un titular<span className="field-hint">Incluir Reglas de Uso · $616.00 MXN</span></span></label></div>
        <fieldset className="quote-field-group"><legend>¿Cómo prefieres pagar?</legend><div className="payment-options">{[1,2,3].map(n => <label key={n}><input type="radio" name="payments" value={n} checked={payments === n} onChange={() => setPayments(n)} /><span>{n === 1 ? "Pago único" : `${n} pagos`}</span></label>)}</div></fieldset>
        <div className="quote-evaluation"><p>¿Prefieres empezar poco a poco?</p><p className="fine-print">Evalúa tu marca por <strong>$799 MXN</strong>, incluidos en el total. Después decides si continúas.</p>
        <a className="text-link" href={quoteEmail("Evaluación de viabilidad", "Quiero comenzar únicamente con la evaluación de $799 MXN, IVA incluido.")}>Empezar con la evaluación →</a></div>
      </> : <><h2>¿Cómo se cotiza?</h2><p>{service.factors}</p><h3>Cuéntanos sobre tu proyecto</h3><ul className="content-list">{service.needs.map(n => <li key={n}>{n}</li>)}</ul></>}
    </div>
    <div className="quote-sheet" aria-live="polite" aria-atomic="true">
      <h2>{trademark ? "Tu inversión" : "Tu propuesta"}</h2><p>{service.title}{trademark ? ` · ${classes} ${classes === 1 ? "clase" : "clases"}` : ""}</p>
      {trademark ? <>
        <div className="quote-total"><span>Total · IVA incluido</span><strong key={`${classes}-${rules}`} className="quote-total-value">{money(quote.total)} <small>MXN</small></strong></div>
        <details className="quote-disclosure"><summary>Ver desglose del total</summary><dl className="quote-lines"><div><dt>Evaluación de viabilidad<small>Una marca</small></dt><dd>{money(quote.evaluation)}</dd></div><div><dt>Preparación y seguimiento<small>Honorarios por {classes} {classes === 1 ? "clase" : "clases"}</small></dt><dd>{money(quote.management)}</dd></div><div><dt>Tarifa oficial IMPI<small>Por {classes} {classes === 1 ? "clase" : "clases"}</small></dt><dd>{money(quote.official)}</dd></div>{rules && <div><dt>Reglas de Uso<small>Más de un titular</small></dt><dd>{money(quote.extra)}</dd></div>}</dl></details>

        <details className="quote-disclosure"><summary>{payments === 1 ? "Cuándo pagar" : `Cómo se distribuyen tus ${payments} pagos`}</summary><ol key={payments} className="payment-schedule">{schedule.map(([label, value]) => <li key={label}><span>{label}</span><strong>{money(value)}</strong></li>)}</ol>
        {rules && payments !== 1 && <p className="fine-print">Más $616.00 MXN por Reglas de Uso. Confirmaremos contigo cuándo se pagan; están incluidos en el total.</p>}</details>
        <p className="fine-print">IVA incluido. Confirmaremos clases y alcance antes de iniciar. Importes de la cotización 2026.</p>
      </> : <><p className="custom-quote-title">Hecha para tu caso.</p><p>Este servicio se cotiza después de conocer tu proyecto. Recibirás el alcance del trabajo, honorarios, gastos aplicables y forma de pago antes de comenzar.</p><p>No se realiza ningún cobro desde esta página.</p></>}
      <a className="site-button" href={quoteEmail(service.title, emailDetail)}>Solicitar por correo <span aria-hidden="true">↗</span></a><p className="fine-print">Abriremos tu correo con la solicitud preparada.</p>
    </div>
  </div>;
}

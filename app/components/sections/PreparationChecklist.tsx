"use client";
import { useState } from "react";
import Link from "next/link";
export default function PreparationChecklist({ items, slug }: { items: readonly string[]; slug: string }) {
  const [checked, setChecked] = useState<string[]>([]);
  return <div className="preparation-sheet"><p className="hand-note">Vamos preparando el camino</p><h2>¿Qué tienes a la mano?</h2><p>Marca lo que ya tienes para tu primera conversación.</p><div className="preparation-items">{items.map(item => <label key={item}><input type="checkbox" checked={checked.includes(item)} onChange={event => setChecked(current => event.target.checked ? [...current, item] : current.filter(value => value !== item))} /><span>{item}</span></label>)}</div><p className="preparation-status" aria-live="polite">{checked.length === items.length ? "Todo listo para contarnos tu proyecto." : `${checked.length} de ${items.length} listos. Si te falta algo, podemos orientarte.`}</p><Link className="site-button" href={`/cotizaciones?servicio=${slug}`}>Preparar mi cotización →</Link><p className="fine-print">Esta lista es solo para ti; no envía información.</p></div>;
}

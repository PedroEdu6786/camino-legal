import type { Metadata } from "next";
import Image from "next/image";
import SiteFrame from "../components/layout/SiteFrame";
import Quotation from "../components/sections/Quotation";
import { services } from "../lib/services";
export const metadata: Metadata = { title: "Cotizaciones y costos | Camino Legal", description: "Consulta honorarios, tarifa IMPI y opciones de pago para tu registro de marca. Solicita una propuesta para otros servicios." };
export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ servicio?: string }> }) {
  const { servicio } = await searchParams;
  const initialService = services.find(s => s.slug === servicio)?.slug ?? services[0].slug;
  return <SiteFrame><section className="site-container page-intro quote-intro"><div className="quote-doodle" aria-hidden="true"><Image src="/stickers/Recurso 95.png" alt="" width={100} height={100} /><span>A tu ritmo</span></div><h1>Tu inversión, clara.</h1><p>Conoce el costo de tu siguiente paso. Sin sorpresas.</p></section><section className="site-container quote-section" aria-label="Cotizador de servicios"><Quotation key={initialService} initialService={initialService} /></section><section className="site-container section-space editorial-grid"><h2>Antes de comenzar</h2><div><h3>Gastos adicionales</h3><p>La atención y seguimiento del trámite forman parte del servicio de registro. Los cargos por requerimientos, multas o recargos que emita el IMPI no están incluidos y se revisan según el caso.</p><h3>Tu factura</h3><p>Los importes mostrados para registro de marca incluyen IVA. Solicita tu factura dentro de los cinco días hábiles posteriores al pago y antes del cierre de mes.</p><h3>Alcance por escrito</h3><p>Para los demás servicios, la propuesta especifica entregables, honorarios, tarifas aplicables y tiempos según tu proyecto.</p></div></section></SiteFrame>;
}

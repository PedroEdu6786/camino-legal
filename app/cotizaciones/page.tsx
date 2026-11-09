import type { Metadata } from "next";
import Image from "next/image";
import SiteFrame from "../components/layout/SiteFrame";
import Quotation from "../components/sections/Quotation";
import BeforeStart from "./BeforeStart";
import { quoteServices as services } from "../lib/serviceQuotes";
export const metadata: Metadata = { title: "Cotizaciones y costos | Camino Legal", description: "Consulta costos y opciones de pago para registro de marca, aviso comercial, registro de obra y contratos de prestación de servicios." };
export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ servicio?: string }> }) {
  const { servicio } = await searchParams;
  const initialService = services.find(s => s.slug === servicio)?.slug ?? services[0].slug;
  return <SiteFrame><section data-analytics-section="quote_intro" className="site-container page-intro quote-intro"><div className="quote-doodle" aria-hidden="true"><Image src="/stickers/Recurso 95.png" alt="" width={100} height={100} /><span>A tu ritmo</span></div><h1>Tu inversión, clara.</h1><p>Conoce el costo de tu siguiente paso. Sin sorpresas.</p></section><section data-analytics-section="quotation" className="site-container quote-section" aria-label="Cotizador de servicios"><Quotation initialService={initialService} explicitService={services.some(s => s.slug === servicio)} /></section><BeforeStart /></SiteFrame>;
}

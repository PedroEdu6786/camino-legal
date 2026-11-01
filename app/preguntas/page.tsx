import type { Metadata } from "next";
import SiteFrame from "../components/layout/SiteFrame";
import FAQ from "../components/sections/FAQ";

export const metadata: Metadata = {
  title: "Preguntas frecuentes | Camino Legal",
  description: "Resuelve tus dudas sobre los servicios, tiempos y costos de trabajar con Camino Legal.",
};

export default function FAQPage() {
  return <SiteFrame><FAQ /></SiteFrame>;
}

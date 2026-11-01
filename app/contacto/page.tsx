import type { Metadata } from "next";
import SiteFrame from "../components/layout/SiteFrame";
import Contact from "../components/sections/Contact";

export const metadata: Metadata = {
  title: "Contáctanos | Camino Legal",
  description: "Cuéntanos tu proyecto o tu duda legal. Contacta a Camino Legal por formulario, WhatsApp o correo electrónico.",
};

export default function ContactPage() {
  return <SiteFrame><Contact /></SiteFrame>;
}

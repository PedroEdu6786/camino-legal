import type { Metadata } from "next";
import SiteFrame from "../components/layout/SiteFrame";
import ServiceExplorer from "../components/sections/ServiceExplorer";
export const metadata: Metadata = { title: "Servicios | Camino Legal", description: "Registro de marca, contratos, derechos de autor, consultoría y documentos para tu web. Conoce el alcance de cada servicio." };
export default function ServicesPage() { return <SiteFrame><ServiceExplorer /></SiteFrame>; }

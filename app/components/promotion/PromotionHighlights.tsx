"use client";

import Image from "next/image";
import Link from "next/link";
import { usePromotion } from "./usePromotion";
import TrademarkPrice from "./TrademarkPrice";
import styles from "./PromotionHighlights.module.css";

export function PromotionBadge() {
  const { phase } = usePromotion();
  if (phase !== "active") return null;
  return <span className={styles.badge}>En promoción · 13–27 nov.</span>;
}

export function PromotionCardPrice() {
  const { phase } = usePromotion();
  if (phase !== "active") return null;
  return <span className={styles.cardPrice}><PromotionBadge /><span><TrademarkPrice compare /> <small>MXN</small></span><span className={styles.caption}>Una clase · IVA y derechos IMPI incluidos</span></span>;
}

export default function HomePromotion() {
  const { phase } = usePromotion();
  if (phase !== "active") return null;
  return <>
    <aside className={styles.calendar} aria-label="Promoción del 13 al 27 de noviembre de 2026">
      <span>Promoción de noviembre</span>
      <strong>13<span aria-hidden="true">—</span>27</strong>
      <span>de noviembre de 2026</span>
      <Image src="/stickers/Recurso 85.png" alt="" width={140} height={70} className={styles.calendarArrow} />
    </aside>
    <div className={styles.offerCopy}><p>Este noviembre, protege tu marca con <strong>precios especiales.</strong></p><Link className={styles.offerLink} href="/cotizaciones?servicio=registro-de-marca" data-analytics-event="cta_click" data-analytics-action="home.quotations" data-analytics-source="hero">Conocer la promoción <span aria-hidden="true">→</span></Link></div>
  </>;
}

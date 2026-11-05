"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { promotion, promotionDaysLeft } from "../../lib/promotion";
import { promotionPreview, usePromotion } from "./usePromotion";
import styles from "./Promotion.module.css";

export function PromotionOffer() {
  return <><div className={styles.offers}>
    <p>Estudio de viabilidad<strong>$499 <small>MXN</small></strong><span>Abonable al registro de tu marca.</span></p>
    <p>Registro de marca<strong>$5,699 <small>MXN</small></strong><span>Total por una clase. Derechos IMPI incluidos.</span></p>
  </div><p className={styles.conditions}>IVA incluido. Los $499 del estudio forman parte del total de $5,699. Clases adicionales y Reglas de Uso se cotizan aparte a tarifa habitual.</p></>;
}

const welcomeKey = promotion.id;

export default function PromotionNotice() {
  const { now, phase } = usePromotion();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const seen = useRef(false);
  useEffect(() => {
    if (phase !== "active" || seen.current) return;
    // Preview replays on reload; the live campaign remembers the first welcome.
    if (!promotionPreview) {
      try { if (localStorage.getItem(welcomeKey)) { seen.current = true; return; } } catch {}
    }
    const timer = window.setInterval(() => {
      const blockingDialog = promotionPreview ? 'dialog[open]' : 'dialog[open], [role="dialog"]';
      if (document.querySelector(blockingDialog)) return;
      seen.current = true;
      setOpen(true);
      if (!promotionPreview) {
        try { localStorage.setItem(welcomeKey, "seen"); } catch {}
      }
      window.clearInterval(timer);
    }, 1500);
    return () => window.clearInterval(timer);
  }, [phase]);
  useEffect(() => {
    if (!open || phase !== "active") return;
    const el = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    el?.showModal();
    document.body.style.overflow = "hidden";
    return () => { el?.close(); document.body.style.overflow = overflow; if (previousFocus?.isConnected) previousFocus.focus(); };
  }, [open, phase]);
  if (!phase || phase === "ended") return null;
  return <>
    <aside className={styles.bar} aria-label={phase === "active" ? "Promoción de noviembre" : "Próximamente en Camino Legal"}>
      {phase === "upcoming" ? <><span>Tu marca tiene una fecha especial. <strong>13–27 de noviembre.</strong></span><span className={styles.countdown}>Faltan {promotionDaysLeft(now!)} {promotionDaysLeft(now!) === 1 ? "día" : "días"}. Algo bueno viene en Camino.</span></> : <><span><strong>Tu marca, a precio especial.</strong> Estudio $499 · Registro $5,699 MXN</span><button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog">Ver promoción ↗</button></>}
    </aside>
    {open && phase === "active" && <dialog ref={dialog} className={styles.modal} aria-labelledby="promotion-title" aria-describedby="promotion-dates" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className={styles.content}><button type="button" autoFocus className={styles.close} aria-label="Cerrar promoción" onClick={() => setOpen(false)}>×</button>
        <p className={styles.handwritten}>El siguiente paso es tuyo.</p>
        <h2 id="promotion-title">Dale a tu marca<br />un buen comienzo.</h2>
        <p id="promotion-dates" className={styles.dates}>{promotion.dates}</p>
        <PromotionOffer />
        <Link className={styles.action} href="/cotizaciones?servicio=registro-de-marca" onClick={() => setOpen(false)}>Cotizar mi marca →</Link>
        <button className={styles.later} type="button" onClick={() => setOpen(false)}>Seguir explorando</button>
      </div>
    </dialog>}
  </>;
}

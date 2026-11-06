"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Start a fresh document across the admin/public boundary. */
import { useState } from "react";
import { setPromotionPreview, usePromotion } from "../promotion/usePromotion";
import type { PromotionPreviewMode } from "../../lib/promotionPreview";
import styles from "./PromotionPreviewControls.module.css";

/** Rendered only inside the server-protected admin page. No public campaign settings are mutated. */
export default function PromotionPreviewControls() {
  const { mode } = usePromotion();
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  async function select(value: PromotionPreviewMode) {
    setPending(true);
    setError(!await setPromotionPreview(value));
    setPending(false);
  }
  return <details className={styles.panel}>
    <summary>Probar promoción</summary>
    <div className={styles.content}>
      <p>Elige la versión que quieres probar. Solo tú verás esta prueba mientras tienes sesión iniciada; tus clientes y otros visitantes no verán cambios.</p>
      <div className={styles.options} role="group" aria-label="Estado de la promoción para pruebas">
        <button type="button" disabled={pending} aria-pressed={mode === "active"} onClick={() => select("active")}>Promoción activa</button>
        <button type="button" disabled={pending} aria-pressed={mode === "upcoming"} onClick={() => select("upcoming")}>Próximamente</button>
        <button type="button" disabled={pending} aria-pressed={mode === "automatic"} onClick={() => select("automatic")}>Sitio actual</button>
      </div>
      <p role="status">{pending ? "Verificando tu sesión…" : error ? "No pudimos activar la vista previa. Comprueba tu sesión y la conexión, permite el almacenamiento de esta pestaña e inténtalo de nuevo." : mode === "active" ? "Verás la promoción y los precios especiales del 13 al 27 de noviembre." : mode === "upcoming" ? "Verás el adelanto con cuenta regresiva y las tarifas habituales." : "Verás lo mismo que tus visitantes: adelanto antes del 13 de noviembre, promoción del 13 al 27 y tarifas habituales al terminar."}</p>
      <a href="/">Ver el sitio con esta vista →</a>
    </div>
  </details>;
}

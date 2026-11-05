"use client";

import { setPromotionPreview, usePromotion } from "./usePromotion";
import styles from "./PromotionPreviewIndicator.module.css";

export default function PromotionPreviewIndicator() {
  const { mode, preview } = usePromotion();
  if (!preview) return null;
  return <aside className={styles.indicator} aria-label="Vista previa privada de promoción">
    <details><summary><strong>Vista previa privada</strong><span>{mode === "active" ? "Promoción activa" : "Próximamente"} · Solo tú</span></summary>
    <p>Esta vista de prueba solo la ves tú mientras tienes sesión iniciada. No cambia el sitio para tus clientes ni otros visitantes.</p>
    <div className={styles.actions}><a href="/admin/analitica">Cambiar vista</a><button type="button" onClick={() => void setPromotionPreview("automatic")}>Salir</button></div></details>
  </aside>;
}

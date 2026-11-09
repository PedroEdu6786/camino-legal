"use client";

import { money, trademarkQuote } from "../../lib/services";
import { usePromotion } from "./usePromotion";

export default function TrademarkPrice({ study = false, compare = false }: { study?: boolean; compare?: boolean }) {
  const { phase } = usePromotion();
  const quote = trademarkQuote(1, false, phase === "active");
  const regular = trademarkQuote(1);
  return <>{compare && phase === "active" && <del className="service-price-previous"><span className="sr-only">Antes </span>{money(study ? regular.evaluation : regular.total)}</del>}{compare && phase === "active" && <span className="sr-only">Ahora </span>}{money(study ? quote.evaluation : quote.total)}</>;
}

export function TrademarkPromotionNote() {
  const { phase } = usePromotion();
  if (phase !== "active") return null;
  return <span className="service-promotion-note">Promoción · 13–27 de noviembre. Estudio $399 abonable al registro.</span>;
}

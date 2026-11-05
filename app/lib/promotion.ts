/** November campaign. Mérida stays at UTC−06:00; the end is exclusive. */
export const promotion = {
  id: "marca-noviembre-2026",
  startsAt: "2026-11-13T00:00:00-06:00",
  endsAt: "2026-11-28T00:00:00-06:00",
  dates: "Del 13 al 27 de noviembre de 2026",
  evaluation: 49900,
  total: 569900,
} as const;

export type PromotionPhase = "upcoming" | "active" | "ended";
export function promotionPhase(now: number): PromotionPhase {
  if (now < Date.parse(promotion.startsAt)) return "upcoming";
  return now < Date.parse(promotion.endsAt) ? "active" : "ended";
}
export function promotionDaysLeft(now: number) {
  return Math.max(0, Math.ceil((Date.parse(promotion.startsAt) - now) / 86400000));
}

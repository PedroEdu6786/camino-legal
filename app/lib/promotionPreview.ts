import { promotion, promotionPhase } from "./promotion.ts";

export type PromotionPreviewMode = "automatic" | "active" | "upcoming";
export const PROMOTION_PREVIEW_KEY = "camino-promotion-preview";

export function promotionPreviewMode(value: string | null): PromotionPreviewMode {
  return value === "active" || value === "upcoming" ? value : "automatic";
}

/** Preview dates affect this tab's display only; they never change the campaign schedule. */
export function promotionPreviewState(now: number, mode: PromotionPreviewMode) {
  const preview = mode !== "automatic";
  const effectiveNow = mode === "upcoming" ? Date.parse(promotion.startsAt) - 7 * 86400000
    : mode === "active" ? Date.parse(promotion.startsAt) : now;
  return { now: effectiveNow, phase: promotionPhase(effectiveNow), mode, preview };
}

/** Only an authenticated server response can authorize the saved display preference. */
export function previewSessionExpiry(body: unknown, now: number): number | null {
  const expiresAt = (body as { expiresAt?: unknown } | null)?.expiresAt;
  return typeof expiresAt === "number" && Number.isFinite(expiresAt) && expiresAt > now
    && expiresAt <= now + 8 * 60 * 60 * 1000 ? expiresAt : null;
}

export function authorizedPreviewMode(mode: PromotionPreviewMode, expiresAt: number, now: number): PromotionPreviewMode {
  return Number.isFinite(expiresAt) && expiresAt > now ? mode : "automatic";
}

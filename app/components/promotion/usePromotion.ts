"use client";

import { useSyncExternalStore } from "react";
import { promotionPhase } from "../../lib/promotion";

// Local development only; production always follows the campaign dates.
export const promotionPreview = process.env.NODE_ENV === "development"
  && process.env.NEXT_PUBLIC_PROMOTION_PREVIEW === "active";

let now: number | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
const tick = () => { now = Date.now(); listeners.forEach(listener => listener()); };
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    tick();
    timer = setInterval(tick, 1000);
    window.addEventListener("focus", tick);
    document.addEventListener("visibilitychange", tick);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      window.removeEventListener("focus", tick);
      document.removeEventListener("visibilitychange", tick);
      now = null;
    }
  };
}
const snapshot = () => now;
const serverSnapshot = () => null;

/** Each Suspense boundary hydrates with the server snapshot before joining the shared clock. */
export function usePromotion() {
  const current = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return { now: current, phase: current === null ? null : promotionPreview ? "active" as const : promotionPhase(current) };
}

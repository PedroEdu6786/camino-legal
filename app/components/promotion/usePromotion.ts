"use client";

import { useSyncExternalStore } from "react";
import { PROMOTION_PREVIEW_KEY, authorizedPreviewMode, previewSessionExpiry, promotionPreviewMode, promotionPreviewState, type PromotionPreviewMode } from "../../lib/promotionPreview";

const changeEvent = "camino-promotion-preview-change";
const initial = { now: null, phase: null, mode: "automatic", preview: false } as const;
type Snapshot = ReturnType<typeof promotionPreviewState> | typeof initial;
let current: Snapshot = initial;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;
let authorizedUntil = 0;
let lastCheck = 0;
let generation = 0;
let verification: Promise<boolean> | null = null;
let controller: AbortController | null = null;

function requestedMode(): PromotionPreviewMode {
  try { return promotionPreviewMode(sessionStorage.getItem(PROMOTION_PREVIEW_KEY)); }
  catch { return "automatic"; }
}
function clearPreference() {
  try { sessionStorage.removeItem(PROMOTION_PREVIEW_KEY); } catch { /* Display still fails closed. */ }
}
function publish() {
  const now = Date.now();
  current = promotionPreviewState(now, authorizedPreviewMode(requestedMode(), authorizedUntil, now));
  listeners.forEach(listener => listener());
}
function revoke() {
  authorizedUntil = 0;
  clearPreference();
  publish();
}

/** Reuse the same verified, allowlisted session as the admin page. No client claim grants access. */
function verifyAccess(): Promise<boolean> {
  if (verification) return verification;
  const attempt = generation;
  const abort = new AbortController();
  controller = abort;
  const timeout = setTimeout(() => abort.abort(), 8000);
  const request = (async () => {
    try {
      const response = await fetch("/api/admin/analytics/session", { cache: "no-store", credentials: "same-origin", redirect: "error", signal: abort.signal });
      const expiresAt = response.status === 200 ? previewSessionExpiry(await response.json(), Date.now()) : null;
      if (attempt !== generation) return false;
      lastCheck = Date.now();
      if (expiresAt === null) { revoke(); return false; }
      authorizedUntil = expiresAt;
      publish();
      return true;
    } catch {
      if (attempt === generation) { lastCheck = Date.now(); revoke(); }
      return false;
    } finally {
      clearTimeout(timeout);
      if (controller === abort) { controller = null; verification = null; }
    }
  })();
  verification = request;
  return request;
}
function tick() {
  if (authorizedUntil > 0 && authorizedUntil <= Date.now()) revoke();
  publish();
  if (requestedMode() !== "automatic" && Date.now() - lastCheck >= 30_000) void verifyAccess();
}
function recheck() {
  if (document.hidden) return;
  // Revalidate after tab changes/bfcache before resuming the private preview.
  if (requestedMode() !== "automatic") {
    authorizedUntil = 0;
    publish();
    void verifyAccess();
  } else tick();
}
function accessDenied() { generation++; controller?.abort(); controller = null; verification = null; revoke(); }
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    tick();
    timer = setInterval(tick, 1000);
    window.addEventListener("focus", recheck);
    window.addEventListener("pageshow", recheck);
    window.addEventListener("analytics-access-denied", accessDenied);
    window.addEventListener(changeEvent, tick);
    document.addEventListener("visibilitychange", recheck);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      window.removeEventListener("focus", recheck);
      window.removeEventListener("pageshow", recheck);
      window.removeEventListener("analytics-access-denied", accessDenied);
      window.removeEventListener(changeEvent, tick);
      document.removeEventListener("visibilitychange", recheck);
      generation++;
      controller?.abort();
      controller = null;
      verification = null;
      authorizedUntil = 0;
      lastCheck = 0;
      current = initial;
    }
  };
}
const snapshot = () => current;
const serverSnapshot = () => initial;

export async function setPromotionPreview(mode: PromotionPreviewMode) {
  if (mode === "automatic") {
    generation++;
    controller?.abort();
    controller = null;
    verification = null;
    revoke();
    return true;
  }
  if (!await verifyAccess()) return false;
  try {
    sessionStorage.setItem(PROMOTION_PREVIEW_KEY, mode);
    window.dispatchEvent(new Event(changeEvent));
    return true;
  } catch { return false; }
}

/** Saved mode stays inactive until the server confirms this browser's logged-in reader. */
export function usePromotion() {
  return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

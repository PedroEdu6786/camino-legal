"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Full navigation is required to apply or clear the beforeInteractive preview. */

import { useSyncExternalStore } from "react";
import { readOverrides } from "../../color-lab/themes";

const subscribe = () => () => {};
function snapshot() {
  try { return sessionStorage.getItem("camino-site-preview") ?? ""; } catch { return ""; }
}
export default function ThemePreviewControls() {
  const saved = useSyncExternalStore(subscribe, snapshot, () => "");
  let colors = null;
  try { if (saved) colors = readOverrides(JSON.parse(saved)); } catch { /* Ignore malformed previews. */ }
  if (!colors) return null;
  const params = new URLSearchParams({ theme: "linen-custom", compare: "linen", ...colors });
  return <nav className="theme-preview-controls" aria-label="Vista previa del tema">
    <span>Tu versión · vista previa</span>
    <a href={`/color-lab?${params}`}>Editar colores</a>
    <a href="/?preview=original">Restaurar original</a>
  </nav>;
}

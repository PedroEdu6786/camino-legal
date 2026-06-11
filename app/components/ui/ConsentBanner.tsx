"use client";

import { useState, useSyncExternalStore } from "react";
import { getConsent, setConsent, subscribeToConsent } from "../../lib/analytics";

export default function ConsentBanner() {
  const [dismissed, setDismissed] = useState(false);
  // Server snapshot pretends a choice exists so the banner never flashes during SSR
  const hasChoice = useSyncExternalStore(
    subscribeToConsent,
    () => getConsent() !== null,
    () => true,
  );

  if (dismissed || hasChoice) return null;

  const decide = (status: "granted" | "denied") => {
    setConsent(status);
    setDismissed(true);
  };

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-[60] bg-background border-t border-foreground/10 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
    >
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-xs md:text-sm opacity-70 flex-1">
          Usamos cookies para entender c&oacute;mo se usa el sitio y mejorar tu
          experiencia. Consulta nuestro{" "}
          <a href="#cookies" className="underline font-medium">
            aviso de cookies
          </a>{" "}
          y{" "}
          <a href="#privacidad" className="underline font-medium">
            aviso de privacidad
          </a>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => decide("denied")}
            className="rounded-lg border border-foreground/20 px-4 py-2 text-xs font-semibold transition-colors hover:border-foreground/40"
          >
            Rechazar
          </button>
          <button
            onClick={() => decide("granted")}
            className="rounded-lg bg-button-bg px-4 py-2 text-xs font-semibold text-button-text transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

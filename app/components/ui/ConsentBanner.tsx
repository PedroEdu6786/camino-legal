"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getConsent, setConsent, subscribeToConsent } from "../../lib/analytics";

export default function ConsentBanner() {
  const choice = useSyncExternalStore(subscribeToConsent, getConsent, () => "denied" as const);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  useEffect(() => {
    const open = () => setPreferencesOpen(true);
    window.addEventListener("analytics-preferences-open", open);
    return () => window.removeEventListener("analytics-preferences-open", open);
  }, []);
  const decide = (status: "granted" | "denied") => { setConsent(status); setPreferencesOpen(false); };
  return <>
    {(choice === null || preferencesOpen) && <div role="dialog" aria-label="Preferencias de cookies" className="fixed bottom-0 left-0 right-0 z-[60] bg-surface border-t border-foreground/10 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-xs md:text-sm opacity-70 flex-1">Usamos cookies para entender c&oacute;mo se usa el sitio y mejorar tu experiencia. Puedes aceptar o rechazar la medici&oacute;n y cambiar tu elecci&oacute;n aqu&iacute; en cualquier momento. Consulta nuestro <a href="#cookies" className="underline font-medium">aviso de cookies</a> y <a href="#privacidad" className="underline font-medium">aviso de privacidad</a>.</p>
        <div className="flex gap-3 shrink-0">
          <button onClick={() => decide("denied")} className="rounded-lg border border-foreground/20 px-4 py-2 text-xs font-semibold transition-colors hover:border-foreground/40">Rechazar</button>
          <button onClick={() => decide("granted")} className="rounded-lg bg-button-bg text-button-text px-4 py-2 text-xs font-semibold">Aceptar</button>
          {preferencesOpen && choice !== null && <button onClick={() => setPreferencesOpen(false)} className="px-2 py-2 text-xs underline" aria-label="Cerrar preferencias de cookies">Cerrar</button>}
        </div>
      </div>
    </div>}
  </>;
}

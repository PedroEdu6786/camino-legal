'use client';

import { useEffect, useState, type ReactNode } from 'react';

/** The server remains authoritative; this also removes stale reports from an open tab. */
export default function ReaderSessionBoundary({ expiresAt, children }: { expiresAt: number; children: ReactNode }) {
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    let disposed = false;
    const controller = new AbortController();
    function leave(status: number) {
      if (disposed) return;
      setBlocked(true);
      const reason = status === 403 ? 'denied' : status === 503 ? 'unavailable' : 'expired';
      window.location.replace(`/admin/acceso?reason=${reason}`);
    }
    async function verify() {
      if (Date.now() >= expiresAt) { leave(401); return; }
      try {
        const response = await fetch('/api/admin/analytics/session', { cache: 'no-store', signal: controller.signal });
        if ([401, 403, 503].includes(response.status)) leave(response.status);
      } catch { /* A network interruption never extends the absolute session deadline. */ }
    }
    function onDenied(event: Event) { leave((event as CustomEvent<number>).detail); }
    function onVisible() { if (!document.hidden) void verify(); }
    const deadline = window.setTimeout(() => leave(401), Math.max(0, expiresAt - Date.now()));
    const interval = window.setInterval(verify, 60_000);
    window.addEventListener('analytics-access-denied', onDenied);
    window.addEventListener('focus', onVisible);
    window.addEventListener('pageshow', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    void verify();
    return () => {
      disposed = true; controller.abort();
      window.clearTimeout(deadline); window.clearInterval(interval);
      window.removeEventListener('analytics-access-denied', onDenied);
      window.removeEventListener('focus', onVisible);
      window.removeEventListener('pageshow', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [expiresAt]);
  return blocked ? <p role="status">La sesión terminó. Abriendo el acceso…</p> : children;
}

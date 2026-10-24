"use client";

import { useEffect, useState, type FormEvent } from 'react';
import { formatSummaryMetric, type GoogleSummary as Summary, type SummaryMetric } from '../../lib/dashboard/reporting';
import styles from './AnalyticsDashboard.module.css';

const primary: { name: SummaryMetric; label: string; description: string }[] = [
  { name: 'totalUsers', label: 'Visitantes', description: 'Usuarios distintos con al menos un evento registrado por Google.' },
  { name: 'screenPageViews', label: 'Vistas de página', description: 'Incluye visitas repetidas a una misma página del flujo web.' },
  { name: 'bounceRate', label: 'Tasa de rebote', description: 'Porcentaje de sesiones que Google no considera sesiones con interacción.' },
];
function dateLabel(value: string) { return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)); }

export default function GoogleSummary() {
  const [preset, setPreset] = useState('28');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [query, setQuery] = useState('days=28');
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/analytics/summary?${query}`, { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'No fue posible consultar el informe.');
        if (!controller.signal.aborted) { setReport(result as Summary); setError(null); }
      })
      .catch(reason => { if (!controller.signal.aborted) { setError(reason instanceof Error ? reason.message : 'No fue posible consultar el informe.'); setReport(null); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, revision]);
  function apply(event: FormEvent) {
    event.preventDefault();
    if (preset === 'custom') {
      const days = (Date.parse(end) - Date.parse(start)) / 86_400_000 + 1;
      if (!Number.isInteger(days) || days < 1 || days > 90) { setError('Selecciona entre 1 y 90 días completos.'); return; }
    }
    setLoading(true); setReport(null); setError(null);
    setQuery(preset === 'custom' ? new URLSearchParams({ start, end }).toString() : `days=${preset}`);
    setRevision(value => value + 1);
  }
  return <section aria-label="Rendimiento del sitio" className={styles.performance}>
    <form className={styles.reportControls} onSubmit={apply}>
      <label>Período<select value={preset} onChange={event => setPreset(event.target.value)}><option value="7">Últimos 7 días completos</option><option value="28">Últimos 28 días completos</option><option value="90">Últimos 90 días completos</option><option value="custom">Rango personalizado</option></select></label>
      {preset === 'custom' && <><label>Desde<input type="date" required value={start} onChange={event => setStart(event.target.value)} /></label><label>Hasta<input type="date" required value={end} onChange={event => setEnd(event.target.value)} /></label></>}
      <button type="submit" disabled={loading}>{loading ? 'Consultando…' : 'Consultar período'}</button>
      <button type="button" disabled={loading} onClick={() => { setLoading(true); setError(null); setRevision(value => value + 1); }}>Actualizar</button>
    </form>
    <div className={styles.reportState} aria-live="polite">
      {error ? <p role="alert">{error}</p> : loading ? <p>Consultando Google Analytics…</p> : <p>{report?.message}</p>}
      {report?.period && <p className={styles.caption}>Informe: {dateLabel(report.period.start)} – {dateLabel(report.period.end)} · {report.period.timezone} · Google Analytics 4</p>}
    </div>
    <div className={styles.summary} aria-busy={loading}>
      {primary.map(metric => <div key={metric.name}><span>{metric.label}</span><p className={report?.metrics[metric.name] == null || loading ? styles.missing : styles.metricValue}>{loading ? 'Consultando…' : formatSummaryMetric(metric.name, report?.metrics[metric.name] ?? null)}</p><small>{metric.description}</small></div>)}
    </div>
    <div className={styles.supportingMetrics}><p><strong>Sesiones:</strong> {loading ? 'Consultando…' : formatSummaryMetric('sessions', report?.metrics.sessions ?? null)}</p><p><strong>Solicitudes observadas:</strong> No disponible · conexión del informe de eventos pendiente</p></div>
    {report?.retrievedAt && <p className={styles.caption}>Última consulta: {new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short', timeZone: report.period?.timezone ?? 'UTC' }).format(new Date(report.retrievedAt))}{report.state === 'stale' ? ' · Datos anteriores; actualización pendiente' : ''}</p>}
    {report?.nextRefreshAt && <p className={styles.caption}>Próxima consulta al proveedor disponible: {new Intl.DateTimeFormat('es-MX', { timeStyle: 'short', timeZone: report.period?.timezone ?? 'UTC' }).format(new Date(report.nextRefreshAt))}. Cambiar de período puede esperar este mismo intervalo.</p>}
    <details className={styles.metricDefinitions}><summary>Cómo interpretar estas métricas</summary><p>Visitantes corresponde a totalUsers de Google, no a usuarios activos ni a un conteo de personas identificadas por Camino Legal. Las vistas incluyen repeticiones. El rebote se calcula a partir de sesiones sin interacción; no equivale simplemente a visitar una sola página.</p><p>Las cifras reflejan la cobertura de Google y el consentimiento disponible. Sin sesiones no se calcula una tasa de rebote. Los datos ausentes no se convierten en cero.</p></details>
  </section>;
}

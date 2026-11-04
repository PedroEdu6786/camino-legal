"use client";

import { checkReaderResponse } from '../../lib/dashboard/readerResponse';

import { useEffect, useState, type PointerEvent } from 'react';
import { trafficFindings, type TrafficInsights } from '../../lib/dashboard/traffic';
import styles from './AnalyticsDashboard.module.css';

const number = new Intl.NumberFormat('es-MX');
const W = 720, H = 200, L = 36, R = 8, T = 10, B = 24;
function niceMax(value: number) { if (value <= 4) return 4; const step = Math.pow(10, Math.floor(Math.log10(value))); return Math.ceil(value / step) * step; }
function shortDate(value: string) { return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)); }

function longDate(value: string) { return new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`)); }

/** One series, straight segments, four faint gridlines, round ticks above the maximum. Hover or touch shows that day's card. */
function TrafficChart({ points }: { points: { date: string; sessions: number; users: number }[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...points.map(point => point.sessions)));
  const x = (index: number) => L + (points.length === 1 ? 0 : (index / (points.length - 1)) * (W - L - R));
  const y = (value: number) => T + (1 - value / max) * (H - T - B);
  const ticks = [0, 1, 2, 3, 4].map(step => (max / 4) * step);
  const labelAt = [0, Math.round((points.length - 1) / 3), Math.round(((points.length - 1) * 2) / 3), points.length - 1];
  function locate(event: PointerEvent<SVGRectElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const position = ((event.clientX - box.left) / box.width) * (W - L - R);
    setActive(Math.max(0, Math.min(points.length - 1, Math.round((position / (W - L - R)) * (points.length - 1)))));
  }
  const point = active === null ? null : points[active];
  const left = active === null ? 0 : (x(active) / W) * 100;
  return <div className={styles.chartWrap}>
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Sesiones por día, de ${shortDate(points[0].date)} a ${shortDate(points[points.length - 1].date)}`} className={styles.chart}>
      {ticks.map(tick => <g key={tick}><line x1={L} x2={W - R} y1={y(tick)} y2={y(tick)} className={tick === 0 ? styles.baseline : styles.grid} /><text x={L - 6} y={y(tick) + 4} textAnchor="end" className={styles.axis}>{Number.isInteger(tick) ? tick : tick.toFixed(1)}</text></g>)}
      <polyline fill="none" strokeWidth="2" strokeLinejoin="round" className={styles.series} points={points.map((item, index) => `${x(index)},${y(item.sessions)}`).join(' ')} />
      {points.map((item, index) => item.sessions > 0 ? <circle key={item.date} cx={x(index)} cy={y(item.sessions)} r="2.5" className={styles.dot} /> : null)}
      {labelAt.map((index, position) => <text key={index} x={x(index)} y={H - 6} textAnchor={position === 0 ? 'start' : position === labelAt.length - 1 ? 'end' : 'middle'} className={styles.axis}>{shortDate(points[index].date)}</text>)}
      {active !== null && point && <g pointerEvents="none"><line x1={x(active)} x2={x(active)} y1={T} y2={H - B} className={styles.cursor} /><circle cx={x(active)} cy={y(point.sessions)} r="5" className={styles.dotActive} /></g>}
      <rect x={L} y={T} width={W - L - R} height={H - T - B} fill="transparent" onPointerMove={locate} onPointerDown={locate} onPointerLeave={() => setActive(null)} />
    </svg>
    {point && <div className={styles.tip} style={{ left: `${left}%`, transform: `translateX(${left > 70 ? '-105%' : '12px'})` }} role="status">
      <strong>{longDate(point.date)}</strong>
      <dl><div><dt>Sesiones</dt><dd>{number.format(point.sessions)}</dd></div><div><dt>Usuarios</dt><dd>{number.format(point.users)}</dd></div></dl>
    </div>}
  </div>;
}
/** A ranked list where the row's own fill is the bar. Numbers are right-aligned tabular figures. */
function Ranking({ title, hint, rows, unit }: { title: string; hint: string; rows: { label: string; value: number }[] | null; unit: string }) {
  const max = Math.max(0, ...(rows ?? []).map(row => row.value));
  return <article className={styles.rank}>
    <h3>{title}</h3><p className={styles.caption}>{hint}</p>
    {rows === null ? <p className={styles.missing}>No disponible: este informe no se pudo leer.</p> : rows.length === 0 ? <p className={styles.missing}>Sin eventos observados en el período.</p> :
      <ol>{rows.map(row => <li key={row.label}><span className={styles.rankFill} style={{ width: `${max ? (row.value / max) * 100 : 0}%` }} /><span className={styles.rankLabel}>{row.label}</span><span className={styles.rankValue}>{number.format(row.value)} <small>{unit}</small></span></li>)}</ol>}
  </article>;
}

export default function InsightsPanel({ days }: { days: string }) {
  const [data, setData] = useState<TrafficInsights | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/analytics/insights?days=${encodeURIComponent(days)}`, { signal: controller.signal, cache: 'no-store' })
      .then(async response => { checkReaderResponse(response); const result = await response.json(); if (!response.ok) throw new Error(typeof result.error === 'string' ? result.error : 'No fue posible consultar el tráfico.'); if (!controller.signal.aborted) { setData(result as TrafficInsights); setError(null); } })
      .catch(reason => { if (!controller.signal.aborted) { setError(reason instanceof Error ? reason.message : 'No fue posible consultar el tráfico.'); setData(null); } });
    return () => controller.abort();
  }, [days]);
  const findings = data ? trafficFindings(data) : [];
  const leadTotal = data?.leadsByPage ? data.leadsByPage.reduce((total, row) => total + row.count, 0) : null;
  const sessions = data?.timeline ? data.timeline.reduce((total, point) => total + point.sessions, 0) : null;
  return <section aria-label="Tráfico y solicitudes" className={styles.insights}>
    <div className={styles.sectionTitle}><h2>Tráfico y solicitudes</h2></div>
    {error ? <p role="alert">{error}</p> : !data ? <p className={styles.caption}>Consultando tráfico en Google Analytics…</p> : <>
      {data.state !== 'available' && <p className={styles.notice}>{data.message}</p>}
      <div className={styles.chartCard}>
        <div className={styles.sectionTitle}><h3>Sesiones por día</h3><span className={styles.caption}>{sessions === null ? '' : `${number.format(sessions)} en total`}</span></div>
        {data.timeline ? <TrafficChart points={data.timeline} /> : <p className={styles.missing}>No disponible: el informe diario no se pudo leer.</p>}
      </div>
      <div className={styles.rankGrid}>
        <Ranking title="Páginas más visitadas" hint="Vistas por ruta. Muestra qué interesa a quien llega." rows={data.pages?.map(page => ({ label: page.path, value: page.views })) ?? null} unit="vistas" />
        <Ranking title="De dónde llegan" hint="Sesiones por origen y medio. Muestra qué canal trae visitas." rows={data.sources?.map(source => ({ label: `${source.source} / ${source.medium}`, value: source.sessions })) ?? null} unit="sesiones" />
        <Ranking title="Por dónde entran" hint="Primera página de cada sesión. Es tu verdadera portada." rows={data.landing?.map(page => ({ label: page.path, value: page.sessions })) ?? null} unit="sesiones" />
        <Ranking title="Dónde se generan solicitudes" hint={leadTotal === null ? 'Eventos lead_submitted por página.' : `${number.format(leadTotal)} solicitudes observadas por Google en el período.`} rows={data.leadsByPage?.map(row => ({ label: row.label, value: row.count })) ?? null} unit="solicitudes" />
      </div>
      <Ranking title="Dónde tocan WhatsApp" hint="Toques en botones de WhatsApp por página. Es intención de contacto, no un mensaje confirmado." rows={data.whatsappByPage?.map(row => ({ label: row.label, value: row.count })) ?? null} unit="toques" />
      {data.leadsBySource && data.leadsBySource.length > 0 && <Ranking title="Qué origen trae solicitudes" hint="Eventos lead_submitted por origen y medio." rows={data.leadsBySource.map(row => ({ label: row.label, value: row.count }))} unit="solicitudes" />}
      {findings.length > 0 && <><div className={styles.sectionTitle}><h2>Qué dicen los datos</h2></div><ul className={styles.findings}>{findings.map(finding => <li key={finding}>{finding}</li>)}</ul></>}
      <p className={styles.caption}>Las solicitudes son eventos lead_submitted recibidos por Google; no equivalen a correos entregados ni a ingresos. Los días sin sesiones se dibujan en cero porque el informe diario está completo.</p>
    </>}
  </section>;
}

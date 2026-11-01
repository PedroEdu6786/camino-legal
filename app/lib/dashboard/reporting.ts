export const SUMMARY_METRICS = ['totalUsers', 'screenPageViews', 'bounceRate', 'sessions'] as const;
export type SummaryMetric = (typeof SUMMARY_METRICS)[number];
export type SummaryState = 'available' | 'not_connected' | 'forbidden' | 'error' | 'partial' | 'no_observations' | 'deferred' | 'stale';
export type SummaryPeriod = { start: string; end: string; timezone: string; days: number };
export type GoogleSummary = {
  provider: 'ga4'; state: SummaryState; period: SummaryPeriod | null;
  resourceId: string | null; streamId: string | null; retrievedAt: string | null;
  nextRefreshAt: string | null; message: string;
  metrics: Record<SummaryMetric, number | null>;
};
export const emptySummaryMetrics = (): GoogleSummary['metrics'] => ({ totalUsers: null, screenPageViews: null, bounceRate: null, sessions: null });
export function dayInTimezone(now: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  return ['year', 'month', 'day'].map(key => parts.find(part => part.type === key)!.value).join('-');
}
function parsedDay(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Usa fechas válidas con formato AAAA-MM-DD.');
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) throw new Error('La fecha no existe.');
  return timestamp;
}
export function summaryPeriod(params: URLSearchParams, timezone: string, now = new Date()): SummaryPeriod {
  const today = parsedDay(dayInTimezone(now, timezone));
  let start: number; let end: number;
  if (params.has('start') || params.has('end')) {
    if (params.has('days')) throw new Error('Selecciona un período predefinido o un rango personalizado.');
    start = parsedDay(params.get('start') ?? ''); end = parsedDay(params.get('end') ?? '');
  } else {
    const days = params.get('days') ?? '28';
    if (!['7', '28', '90'].includes(days)) throw new Error('El período debe ser de 7, 28 o 90 días.');
    end = today - 86_400_000; start = today - Number(days) * 86_400_000;
  }
  const days = (end - start) / 86_400_000 + 1;
  if (days < 1 || days > 90) throw new Error('Selecciona entre 1 y 90 días completos.');
  if (end >= today) throw new Error('El rango debe terminar antes de hoy en la zona horaria de la propiedad.');
  return { start: new Date(start).toISOString().slice(0, 10), end: new Date(end).toISOString().slice(0, 10), timezone, days };
}
export function formatSummaryMetric(name: SummaryMetric, value: number | null): string {
  if (value === null) return 'No disponible';
  return new Intl.NumberFormat('es-MX', name === 'bounceRate' ? { style: 'percent', maximumFractionDigits: 1 } : { maximumFractionDigits: 0 }).format(value);
}

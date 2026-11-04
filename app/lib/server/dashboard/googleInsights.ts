import { createHash } from 'node:crypto';
import { EMPTY_INSIGHTS, type TrafficInsights, type TrafficSlice } from '../../dashboard/traffic.ts';
import { summaryPeriod, type SummaryPeriod, type SummaryState } from '../../dashboard/reporting.ts';
import { COOLDOWN, WINDOW_BUDGET, createGoogleAccess, type AccessOptions } from './googleAccess.ts';

const LIMIT = '10';
const QUERY_COUNT = 7; // reports per observation; all count against the shared budget
const DAY = 86_400_000;
const messages = {
  available: 'Datos de tráfico del flujo web seleccionado en Google Analytics.',
  not_connected: 'La lectura de Google Analytics no está configurada en este entorno.',
  forbidden: 'Google no permitió consultar esta propiedad. Revisa el acceso de lectura.',
  error: 'No fue posible consultar el tráfico en Google Analytics. Puedes intentar después del intervalo de actualización.',
  partial: 'Parte de los informes de tráfico no se pudo leer. Las secciones vacías no se presentan como cero.',
  deferred: 'Este recurso ya se consultó recientemente. El próximo intento estará disponible al finalizar el intervalo.',
};
type Row = { dimensionValues?: { value?: string }[]; metricValues?: { value?: string }[] };
export type ProviderReport = { rows?: Row[]; metadata?: { timeZone?: string; subjectToThresholding?: boolean; dataLossFromOtherRow?: boolean; samplingMetadatas?: unknown[]; dataTruncationReasons?: unknown[]; schemaRestrictionResponse?: { activeMetricRestrictions?: unknown[] } } };
class Denied extends Error {}

const num = (value?: string) => (typeof value === 'string' && /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : null);
/** A report is trusted only when its metadata proves an unrestricted, unsampled, property-local answer. */
function trusted(report: ProviderReport, timezone: string): report is ProviderReport & { rows: Row[] } {
  const m = report.metadata;
  if (!m || m.timeZone !== timezone || m.subjectToThresholding || m.dataLossFromOtherRow || m.samplingMetadatas?.length || m.dataTruncationReasons?.length || m.schemaRestrictionResponse?.activeMetricRestrictions?.length) return false;
  return Array.isArray(report.rows) || report.rows === undefined;
}
/** Maps every row or rejects the whole slice: a half-read table is never shown. */
function mapRows<T>(report: ProviderReport, timezone: string, map: (dims: string[], mets: number[]) => T | null, metricCount: number): T[] | null {
  if (!trusted(report, timezone)) return null;
  const out: T[] = [];
  for (const row of report.rows ?? []) {
    const dims = (row.dimensionValues ?? []).map(value => value?.value ?? '');
    const mets = (row.metricValues ?? []).map(value => num(value?.value));
    if (mets.length !== metricCount || mets.some(value => value === null) || dims.some(value => value === '')) return null;
    const mapped = map(dims, mets as number[]);
    if (mapped === null) return null;
    out.push(mapped);
  }
  return out;
}
export const parsers = {
  timeline(report: ProviderReport, timezone: string, period: SummaryPeriod) {
    const rows = mapRows(report, timezone, (d, m) => (/^\d{8}$/.test(d[0]) ? { date: `${d[0].slice(0, 4)}-${d[0].slice(4, 6)}-${d[0].slice(6, 8)}`, users: m[0], sessions: m[1] } : null), 2);
    if (!rows) return null;
    const seen = new Map(rows.map(point => [point.date, point]));
    const points = [];
    for (let time = Date.parse(`${period.start}T00:00:00Z`); time <= Date.parse(`${period.end}T00:00:00Z`); time += DAY) {
      const date = new Date(time).toISOString().slice(0, 10);
      points.push(seen.get(date) ?? { date, users: 0, sessions: 0 }); // GA4 omits days with no sessions; the report is complete, so absence is a true zero
    }
    return points;
  },
  pages: (report: ProviderReport, tz: string) => mapRows(report, tz, (d, m) => ({ path: d[0], views: m[0], users: m[1], sessions: m[2] }), 3),
  sources: (report: ProviderReport, tz: string) => mapRows(report, tz, (d, m) => ({ source: d[0], medium: d[1], sessions: m[0], users: m[1] }), 2),
  landing: (report: ProviderReport, tz: string) => mapRows(report, tz, (d, m) => ({ path: d[0], sessions: m[0], users: m[1] }), 2),
  leads: (report: ProviderReport, tz: string) => mapRows(report, tz, (d, m) => ({ label: d.join(' / '), count: m[0] }), 1),
};
const filter = (fieldName: string, value: string) => ({ filter: { fieldName, stringFilter: { matchType: 'EXACT', value } } });

export function createGoogleInsightsReader(options: AccessOptions = {}) {
  const { now, request, token } = createGoogleAccess(options);
  const cache = new Map<string, TrafficInsights>();
  const cooldowns = new Map<string, number>();
  const pending = new Map<string, Promise<TrafficInsights>>();
  const calls = new Map<string, number[]>();
  return async (params: URLSearchParams): Promise<TrafficInsights> => {
    const env = options.env ?? process.env;
    const resourceId = env.GOOGLE_ANALYTICS_PROPERTY_ID, streamId = env.GOOGLE_ANALYTICS_STREAM_ID, timezone = env.GOOGLE_ANALYTICS_TIME_ZONE;
    const base: TrafficInsights = { provider: 'ga4', state: 'not_connected', period: null, retrievedAt: null, nextRefreshAt: null, message: messages.not_connected, ...EMPTY_INSIGHTS };
    if (!resourceId || !/^\d+$/.test(resourceId) || !streamId || !/^\d+$/.test(streamId) || !timezone || !(env.GOOGLE_ANALYTICS_ACCESS_TOKEN || env.GOOGLE_ANALYTICS_CREDENTIALS_JSON)) { summaryPeriod(params, 'UTC', now()); return base; }
    try { new Intl.DateTimeFormat('en', { timeZone: timezone }); } catch { return base; }
    const period = summaryPeriod(params, timezone, now());
    base.period = period;
    const resourceKey = `${resourceId}:${streamId}:${timezone}:${createHash('sha256').update(env.GOOGLE_ANALYTICS_ACCESS_TOKEN ?? env.GOOGLE_ANALYTICS_CREDENTIALS_JSON!).digest('hex')}`;
    const key = `${resourceKey}:${period.start}:${period.end}:traffic-v1`;
    const timestamp = now().getTime();
    const inFlight = pending.get(key);
    if (inFlight) return inFlight;
    const cached = cache.get(key);
    if (cached?.retrievedAt && timestamp - Date.parse(cached.retrievedAt) < COOLDOWN) return cached;
    const recent = (calls.get(resourceKey) ?? []).filter(time => timestamp - time < COOLDOWN);
    calls.set(resourceKey, recent);
    const next = Math.max(cooldowns.get(key) ?? 0, recent.length + QUERY_COUNT > WINDOW_BUDGET ? recent[0] + COOLDOWN : 0);
    if (next > timestamp) return cached ? { ...cached, state: 'stale', nextRefreshAt: new Date(next).toISOString(), message: messages.deferred } : { ...base, state: 'deferred', nextRefreshAt: new Date(next).toISOString(), message: messages.deferred };
    cooldowns.set(key, timestamp + COOLDOWN);
    for (let call = 0; call < QUERY_COUNT; call++) recent.push(timestamp);
    base.nextRefreshAt = new Date(timestamp + COOLDOWN).toISOString();
    const dateRanges = [{ startDate: period.start, endDate: period.end }];
    const web = { andGroup: { expressions: [filter('streamId', streamId), { filter: { fieldName: 'platform', stringFilter: { matchType: 'EXACT', value: 'web', caseSensitive: false } } }] } };
    const lead = { andGroup: { expressions: [filter('streamId', streamId), filter('eventName', 'lead_submitted')] } };
    const whatsapp = { andGroup: { expressions: [filter('streamId', streamId), { filter: { fieldName: 'eventName', inListFilter: { values: ['whatsapp_click', 'quote_request_intent'] } } }] } };
    const rank = (metricName: string) => [{ metric: { metricName }, desc: true }];
    const queries: { slice: TrafficSlice; body: object }[] = [
      { slice: 'timeline', body: { dateRanges, dimensions: [{ name: 'date' }], metrics: [{ name: 'totalUsers' }, { name: 'sessions' }], dimensionFilter: web, orderBys: [{ dimension: { dimensionName: 'date' } }], limit: '400' } },
      { slice: 'pages', body: { dateRanges, dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'totalUsers' }, { name: 'sessions' }], dimensionFilter: web, orderBys: rank('screenPageViews'), limit: LIMIT } },
      { slice: 'sources', body: { dateRanges, dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }], dimensionFilter: web, orderBys: rank('sessions'), limit: LIMIT } },
      { slice: 'landing', body: { dateRanges, dimensions: [{ name: 'landingPage' }], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }], dimensionFilter: web, orderBys: rank('sessions'), limit: LIMIT } },
      { slice: 'leadsByPage', body: { dateRanges, dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'eventCount' }], dimensionFilter: lead, orderBys: rank('eventCount'), limit: LIMIT } },
      { slice: 'leadsBySource', body: { dateRanges, dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }], metrics: [{ name: 'eventCount' }], dimensionFilter: lead, orderBys: rank('eventCount'), limit: LIMIT } },
      { slice: 'whatsappByPage', body: { dateRanges, dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'eventCount' }], dimensionFilter: whatsapp, orderBys: rank('eventCount'), limit: LIMIT } },
    ];
    const perform = async (): Promise<TrafficInsights> => {
      try {
        const accessToken = await token(env);
        const results = await Promise.allSettled(queries.map(async ({ body }) => {
          const response = await request(`https://analyticsdata.googleapis.com/v1beta/properties/${resourceId}:runReport`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
          if (!response.ok) throw [401, 403].includes(response.status) ? new Denied() : new Error('provider');
          return await response.json() as ProviderReport;
        }));
        if (results.some(result => result.status === 'rejected' && result.reason instanceof Denied)) return { ...base, state: 'forbidden', message: messages.forbidden };
        const values: Partial<Record<TrafficSlice, unknown>> = {};
        let read = 0;
        queries.forEach(({ slice }, index) => {
          const result = results[index];
          if (result.status !== 'fulfilled') return;
          const report = result.value;
          const parsed = slice === 'timeline' ? parsers.timeline(report, timezone, period) : slice === 'pages' ? parsers.pages(report, timezone) : slice === 'sources' ? parsers.sources(report, timezone) : slice === 'landing' ? parsers.landing(report, timezone) : parsers.leads(report, timezone);
          if (parsed) { values[slice] = parsed; read++; }
        });
        const state: SummaryState = read === queries.length ? 'available' : read === 0 ? 'error' : 'partial';
        const report = { ...base, ...values, state, message: messages[state as 'available' | 'partial' | 'error'], retrievedAt: now().toISOString() } as TrafficInsights;
        if (state !== 'error') { cache.set(key, report); if (cache.size > 16) cache.delete(cache.keys().next().value!); }
        return report;
      } catch {
        return cached ? { ...cached, state: 'stale', message: messages.error } : { ...base, state: 'error', message: messages.error };
      }
    };
    const work = perform(); pending.set(key, work);
    try { return await work; } finally { pending.delete(key); }
  };
}
export const readGoogleInsights = createGoogleInsightsReader();

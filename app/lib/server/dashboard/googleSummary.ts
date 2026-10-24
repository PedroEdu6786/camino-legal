import { createHash, createSign } from 'node:crypto';
import { emptySummaryMetrics, SUMMARY_METRICS, summaryPeriod, type GoogleSummary, type SummaryPeriod } from '../../dashboard/reporting.ts';

const COOLDOWN = 15 * 60_000;
const messages = {
  not_connected: 'La lectura de Google Analytics no está configurada en este entorno.',
  forbidden: 'Google no permitió consultar esta propiedad. Revisa el acceso de lectura.',
  error: 'No fue posible consultar Google Analytics. Puedes intentar después del intervalo de actualización.',
  partial: 'Google devolvió datos limitados o una respuesta incompleta. No se presentan como totales completos.',
  no_observations: 'Google no devolvió observaciones para este período. Esto no se interpreta automáticamente como cero.',
  deferred: 'Este recurso ya se consultó recientemente. El próximo intento estará disponible al finalizar el intervalo.',
};
type Options = { env?: Record<string, string | undefined>; fetcher?: typeof fetch; now?: () => Date };
type ProviderReport = { metricHeaders?: { name?: string }[]; rows?: { metricValues?: { value?: string }[] }[]; rowCount?: number; metadata?: { timeZone?: string; subjectToThresholding?: boolean; dataLossFromOtherRow?: boolean; samplingMetadatas?: unknown[]; dataTruncationReasons?: unknown[]; schemaRestrictionResponse?: { activeMetricRestrictions?: unknown[] } } };

export function parseSummaryReport(report: ProviderReport, timezone: string): Pick<GoogleSummary, 'state' | 'metrics' | 'message'> {
  const unavailable = (state: 'partial' | 'no_observations') => ({ state, metrics: emptySummaryMetrics(), message: messages[state] });
  if (report.metadata?.timeZone !== timezone || report.metadata.subjectToThresholding || report.metadata.dataLossFromOtherRow || report.metadata.samplingMetadatas?.length || report.metadata.dataTruncationReasons?.length || report.metadata.schemaRestrictionResponse?.activeMetricRestrictions?.length) return unavailable('partial');
  if ((report.rows !== undefined && !Array.isArray(report.rows)) || !Array.isArray(report.metricHeaders)) return unavailable('partial');
  if (!report.rows?.length) return report.rowCount && report.rowCount > 0 ? unavailable('partial') : unavailable('no_observations');
  if (report.rows.length !== 1 || (report.rowCount !== undefined && report.rowCount !== 1)) return unavailable('partial');
  if (!Array.isArray(report.rows[0]?.metricValues)) return unavailable('partial');
  const names = report.metricHeaders.map(header => header?.name);
  if (names.length !== SUMMARY_METRICS.length || new Set(names).size !== names.length) return unavailable('partial');
  const metrics = emptySummaryMetrics();
  for (const name of SUMMARY_METRICS) {
    const index = names.indexOf(name);
    const raw = report.rows[0].metricValues?.[index]?.value;
    if (index < 0 || typeof raw !== 'string' || !/^(?:\d+\.?\d*|\.\d+)$/.test(raw)) return unavailable('partial');
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0 || (name === 'bounceRate' ? value > 1 : !Number.isSafeInteger(value))) return unavailable('partial');
    metrics[name] = value;
  }
  if (metrics.sessions === 0) metrics.bounceRate = null;
  return { state: 'available', metrics, message: metrics.sessions === 0 ? 'Sin sesiones registradas; la tasa de rebote no tiene denominador.' : 'Datos agregados del flujo web seleccionado en Google Analytics.' };
}

/** Server-only reader. Injected fetch is for contract tests; production destinations are fixed. */
export function createGoogleSummaryReader(options: Options = {}) {
  const fetcher = options.fetcher ?? fetch;
  const now = options.now ?? (() => new Date());
  const cache = new Map<string, GoogleSummary>();
  const cooldowns = new Map<string, number>();
  const pending = new Map<string, Promise<GoogleSummary>>();
  let tokenCache: { key: string; token: string; expires: number } | null = null;
  async function request(url: string, init: RequestInit): Promise<Response> {
    return fetcher(url, { ...init, cache: 'no-store', signal: AbortSignal.timeout(5000) });
  }
  async function token(env: Record<string, string | undefined>): Promise<string> {
    if (env.GOOGLE_ANALYTICS_ACCESS_TOKEN) return env.GOOGLE_ANALYTICS_ACCESS_TOKEN;
    const raw = env.GOOGLE_ANALYTICS_CREDENTIALS_JSON!;
    const key = createHash('sha256').update(raw).digest('hex');
    if (tokenCache?.key === key && tokenCache.expires > now().getTime() + 60_000) return tokenCache.token;
    const credentials = JSON.parse(raw) as { client_email?: unknown; private_key?: unknown; type?: unknown };
    if (credentials.type !== 'service_account' || typeof credentials.client_email !== 'string' || typeof credentials.private_key !== 'string') throw new Error('credentials');
    const timestamp = Math.floor(now().getTime() / 1000);
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const assertion = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ iss: credentials.client_email, scope: 'https://www.googleapis.com/auth/analytics.readonly', aud: 'https://oauth2.googleapis.com/token', iat: timestamp, exp: timestamp + 3600 })}`;
    const signature = createSign('RSA-SHA256').update(assertion).sign(credentials.private_key, 'base64url');
    const response = await request('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${assertion}.${signature}` }) });
    if (!response.ok) throw new Error('credentials');
    const body = await response.json() as { access_token?: unknown; expires_in?: unknown };
    if (typeof body.access_token !== 'string' || typeof body.expires_in !== 'number' || body.expires_in <= 0) throw new Error('credentials');
    tokenCache = { key, token: body.access_token, expires: now().getTime() + Math.min(body.expires_in, 3600) * 1000 };
    return tokenCache.token;
  }
  return async (params: URLSearchParams): Promise<GoogleSummary> => {
    const env = options.env ?? process.env;
    const resourceId = env.GOOGLE_ANALYTICS_PROPERTY_ID;
    const streamId = env.GOOGLE_ANALYTICS_STREAM_ID;
    const timezone = env.GOOGLE_ANALYTICS_TIME_ZONE;
    const base: GoogleSummary = { provider: 'ga4', state: 'not_connected', resourceId: null, streamId: null, period: null, retrievedAt: null, nextRefreshAt: null, message: messages.not_connected, metrics: emptySummaryMetrics() };
    if (!resourceId || !/^\d+$/.test(resourceId) || !streamId || !/^\d+$/.test(streamId) || !timezone || !(env.GOOGLE_ANALYTICS_ACCESS_TOKEN || env.GOOGLE_ANALYTICS_CREDENTIALS_JSON)) { summaryPeriod(params, 'UTC', now()); return base; }
    try { new Intl.DateTimeFormat('en', { timeZone: timezone }); } catch { return base; }
    const period: SummaryPeriod = summaryPeriod(params, timezone, now());
    base.period = period; base.resourceId = resourceId; base.streamId = streamId;
    const credentialRevision = createHash('sha256').update(env.GOOGLE_ANALYTICS_ACCESS_TOKEN ?? env.GOOGLE_ANALYTICS_CREDENTIALS_JSON!).digest('hex');
    const resourceKey = `${resourceId}:${streamId}:${timezone}:${credentialRevision}`;
    const key = `${resourceKey}:${period.start}:${period.end}:web:summary-v1`;
    const timestamp = now().getTime();
    const inFlight = pending.get(key);
    if (inFlight) return inFlight;
    const cached = cache.get(key);
    const next = cooldowns.get(resourceKey) ?? 0;
    if (cached?.retrievedAt && timestamp - Date.parse(cached.retrievedAt) < COOLDOWN) return cached;
    if (next > timestamp) return { ...base, ...(cached ? { metrics: cached.metrics, retrievedAt: cached.retrievedAt } : {}), state: cached ? 'stale' : 'deferred', nextRefreshAt: new Date(next).toISOString(), message: messages.deferred };
    cooldowns.set(resourceKey, timestamp + COOLDOWN);
    if (cooldowns.size > 8) cooldowns.delete(cooldowns.keys().next().value!);
    base.nextRefreshAt = new Date(timestamp + COOLDOWN).toISOString();
    const perform = async (): Promise<GoogleSummary> => {
    try {
      const accessToken = await token(env);
      const response = await request(`https://analyticsdata.googleapis.com/v1beta/properties/${resourceId}:runReport`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ dateRanges: [{ startDate: period.start, endDate: period.end }], metrics: SUMMARY_METRICS.map(name => ({ name })), dimensionFilter: { andGroup: { expressions: [{ filter: { fieldName: 'streamId', stringFilter: { matchType: 'EXACT', value: streamId } } }, { filter: { fieldName: 'platform', stringFilter: { matchType: 'EXACT', value: 'web', caseSensitive: false } } }] } }, limit: '1', returnPropertyQuota: false }) });
      if (!response.ok) {
        if (response.status === 429) {
          const retry = response.headers.get('retry-after');
          const until = retry && /^\d+$/.test(retry) ? timestamp + Number(retry) * 1000 : retry ? Date.parse(retry) : NaN;
          if (Number.isFinite(until) && until > timestamp + COOLDOWN) { cooldowns.set(resourceKey, until); base.nextRefreshAt = new Date(until).toISOString(); }
        }
        const state = [401, 403].includes(response.status) ? 'forbidden' : 'error';
        return { ...base, state, message: messages[state] };
      }
      const payload = await response.json() as ProviderReport;
      if (!payload || typeof payload !== 'object') throw new Error('response');
      const report: GoogleSummary = { ...base, ...parseSummaryReport(payload, timezone), retrievedAt: now().toISOString() };
      cache.set(key, report);
      if (cache.size > 16) cache.delete(cache.keys().next().value!);
      return report;
    } catch {
      return { ...base, ...(cached ? { metrics: cached.metrics, retrievedAt: cached.retrievedAt } : {}), state: cached ? 'stale' : 'error', message: messages.error };
    }
    };
    const work = perform(); pending.set(key, work);
    try { return await work; } finally { pending.delete(key); }
  };
}
// Process-local only: deployment-wide coordination remains a hosting integration task.
export const readGoogleSummary = createGoogleSummaryReader();

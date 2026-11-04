import type { SummaryPeriod, SummaryState } from './reporting.ts';

export type TrafficPoint = { date: string; users: number; sessions: number };
export type TrafficPage = { path: string; views: number; users: number; sessions: number };
export type TrafficSource = { source: string; medium: string; sessions: number; users: number };
export type LandingPage = { path: string; sessions: number; users: number };
export type LeadRow = { label: string; count: number };
export type TrafficInsights = {
  provider: 'ga4'; state: SummaryState; period: SummaryPeriod | null;
  retrievedAt: string | null; nextRefreshAt: string | null; message: string;
  timeline: TrafficPoint[] | null; pages: TrafficPage[] | null; sources: TrafficSource[] | null;
  landing: LandingPage[] | null; leadsByPage: LeadRow[] | null; leadsBySource: LeadRow[] | null; whatsappByPage: LeadRow[] | null;
};
export type TrafficSlice = 'timeline' | 'pages' | 'sources' | 'landing' | 'leadsByPage' | 'leadsBySource' | 'whatsappByPage';
export const EMPTY_INSIGHTS: Pick<TrafficInsights, TrafficSlice> = { timeline: null, pages: null, sources: null, landing: null, leadsByPage: null, leadsBySource: null, whatsappByPage: null };

const format = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 });
const share = (part: number, whole: number) => (whole > 0 ? `${format.format((part / whole) * 100)}%` : null);

/**
 * Findings are computed from the observed rows only. Every sentence carries its own numbers so a reader can
 * check it against the tables, and a missing slice produces no sentence at all.
 */
export function trafficFindings(insights: TrafficInsights): string[] {
  const findings: string[] = [];
  const { timeline, pages, sources, landing, leadsByPage, leadsBySource, period } = insights;
  const sessions = timeline?.reduce((total, point) => total + point.sessions, 0) ?? null;
  const users = timeline?.reduce((total, point) => total + point.users, 0) ?? null;
  if (sessions !== null && users !== null && period) findings.push(`${format.format(users)} usuarios y ${format.format(sessions)} sesiones en ${period.days} días completos (${period.start} – ${period.end}).`);
  if (pages && pages.length) {
    const views = pages.reduce((total, page) => total + page.views, 0);
    const top = pages[0];
    const topShare = share(top.views, views);
    if (topShare) findings.push(`«${top.path}» concentra el ${topShare} de las ${format.format(views)} vistas de las ${pages.length} páginas más visitadas.`);
    const quiet = pages.filter(page => page.views > 0 && page.sessions === 0);
    if (quiet.length) findings.push(`${quiet.length} de esas páginas recibieron vistas sin ninguna sesión registrada: revisa si el flujo de entrada está partido.`);
  }
  if (sources && sources.length) {
    const total = sources.reduce((sum, source) => sum + source.sessions, 0);
    const labelled = (source: TrafficSource) => `${source.source} / ${source.medium}`;
    const topShare = share(sources[0].sessions, total);
    if (topShare) findings.push(`El mayor origen es «${labelled(sources[0])}» con ${format.format(sources[0].sessions)} sesiones (${topShare}).`);
    const organic = sources.filter(source => source.medium === 'organic').reduce((sum, source) => sum + source.sessions, 0);
    const referral = sources.filter(source => source.medium === 'referral');
    if (organic) findings.push(`${format.format(organic)} sesiones llegan de búsqueda orgánica; ${format.format(referral.reduce((sum, source) => sum + source.sessions, 0))} de referidos.`);
    const odd = referral.filter(source => !/(instagram|facebook|linkedin|twitter|x\.com|tiktok|youtube)/i.test(source.source) && source.sessions >= 5);
    for (const source of odd) findings.push(`«${labelled(source)}» aporta ${format.format(source.sessions)} sesiones por referido: confirma si es tráfico real o un enlace de desarrollo.`);
  }
  if (landing && landing.length) {
    const total = landing.reduce((sum, page) => sum + page.sessions, 0);
    const topShare = share(landing[0].sessions, total);
    if (topShare) findings.push(`El ${topShare} de las sesiones empieza en «${landing[0].path}», no en una página de servicio.`);
  }
  const leads = leadsByPage?.reduce((total, row) => total + row.count, 0) ?? null;
  const leadsFromSources = leadsBySource?.reduce((total, row) => total + row.count, 0) ?? null;
  if (leads !== null && sessions !== null) {
    findings.push(leads === 0
      ? `Ningún evento lead_submitted en Google con ${format.format(sessions)} sesiones: la solicitud aceptada no está llegando al proveedor.`
      : `${format.format(leads)} solicitudes observadas por Google en el período.`);
  }
  const whatsapp = insights.whatsappByPage?.reduce((total, row) => total + row.count, 0) ?? null;
  if (whatsapp !== null && insights.whatsappByPage && insights.whatsappByPage.length) findings.push(`${format.format(whatsapp)} toques en botones de WhatsApp; la página con más es «${insights.whatsappByPage[0].label}» (${format.format(insights.whatsappByPage[0].count)}). Son intención de contacto, no mensajes confirmados.`);
  if (leadsFromSources !== null && leadsFromSources !== leads) findings.push(`Los recuentos por origen y por página no coinciden (${format.format(leadsFromSources)} y ${format.format(leads ?? 0)}): algunas solicitudes no traen página o origen asignado.`);
  if (sessions !== null && sessions < 100) findings.push(`Con ${format.format(sessions)} sesiones, estas cifras orientan pero no alcanzan para decidir una inversión.`);
  return findings;
}

/** Share of the largest row, used for the in-row bars. Returns 0 when there is nothing to compare. */
export function topShare(values: number[]): number {
  const max = Math.max(0, ...values);
  return max > 0 ? max : 0;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { parsers, createGoogleInsightsReader } from '../app/lib/server/dashboard/googleInsights.ts';
import { trafficFindings, EMPTY_INSIGHTS } from '../app/lib/dashboard/traffic.ts';

const tz = 'America/Merida';
const period = { start: '2026-10-01', end: '2026-10-04', timezone: tz, days: 4 };
const meta = { timeZone: tz };
const rep = (rows, extra = {}) => ({ rows, metadata: { ...meta, ...extra } });
const row = (d, m) => ({ dimensionValues: d.map(value => ({ value })), metricValues: m.map(value => ({ value: String(value) })) });

test('timeline fills omitted days with zero only for a trusted report', () => {
  const points = parsers.timeline(rep([row(['20261002'], [2, 3])]), tz, period);
  assert.deepEqual(points.map(point => point.sessions), [0, 3, 0, 0]);
  for (const extra of [{ subjectToThresholding: true }, { samplingMetadatas: [{}] }, { dataTruncationReasons: ['x'] }, { timeZone: 'UTC' }]) assert.equal(parsers.timeline(rep([], extra), tz, period), null);
});
test('a malformed row rejects the whole slice instead of showing a partial table', () => {
  assert.equal(parsers.pages(rep([row(['/'], [1, 1, 1]), row(['/x'], ['bad', 1, 1])]), tz), null);
  assert.equal(parsers.pages(rep([row([''], [1, 1, 1])]), tz), null);
  assert.deepEqual(parsers.pages(rep([row(['/'], [5, 2, 3])]), tz), [{ path: '/', views: 5, users: 2, sessions: 3 }]);
  assert.deepEqual(parsers.leads(rep([row(['google', 'organic'], [2])]), tz), [{ label: 'google / organic', count: 2 }]);
});
test('findings carry their numbers and skip unread slices', () => {
  const base = { provider: 'ga4', state: 'available', period, retrievedAt: null, nextRefreshAt: null, message: '', ...EMPTY_INSIGHTS };
  assert.deepEqual(trafficFindings(base), []);
  const text = trafficFindings({ ...base, timeline: [{ date: '2026-10-01', users: 2, sessions: 4 }], pages: [{ path: '/', views: 9, users: 2, sessions: 4 }, { path: '/a', views: 1, users: 1, sessions: 1 }], leadsByPage: [] }).join('\n');
  assert.match(text, /90%/); assert.match(text, /Ningún evento lead_submitted/); assert.match(text, /no alcanzan para decidir/);
});
test('reader isolates one failing report, reports partial and never serializes the token', async () => {
  const env = { GOOGLE_ANALYTICS_PROPERTY_ID: '1', GOOGLE_ANALYTICS_STREAM_ID: '2', GOOGLE_ANALYTICS_TIME_ZONE: tz, GOOGLE_ANALYTICS_ACCESS_TOKEN: 'secret-token' };
  let n = 0;
  const fetcher = async () => (++n === 2 ? new Response('x', { status: 500 }) : Response.json(rep([])));
  const out = await createGoogleInsightsReader({ env, fetcher, now: () => new Date('2026-10-10T12:00:00Z') })(new URLSearchParams('days=7'));
  assert.equal(out.state, 'partial'); assert.equal(out.pages, null); assert.ok(Array.isArray(out.timeline));
  assert.ok(!JSON.stringify(out).includes('secret-token')); assert.equal(n, 7);
});

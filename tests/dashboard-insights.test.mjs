import test from 'node:test';
import assert from 'node:assert/strict';
import { parsers, createGoogleInsightsReader } from '../app/lib/server/dashboard/googleInsights.ts';
import { serviceDetails } from '../app/lib/services.ts';
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
});
test('limited reports with a larger rowCount are still trusted (only events is truncation-checked)', () => {
  const ten = Array.from({ length: 10 }, (_, i) => row([`/p${i}`], [1, 1, 1]));
  assert.equal(parsers.pages({ ...rep(ten), rowCount: 25 }, tz).length, 10);
  assert.equal(parsers.landing({ ...rep(ten.map(r => ({ ...r, metricValues: r.metricValues.slice(0, 2) }))), rowCount: 25 }, tz).length, 10);
});
test('findings carry their numbers and skip unread slices', () => {
  const base = { provider: 'ga4', state: 'available', period, retrievedAt: null, nextRefreshAt: null, message: '', ...EMPTY_INSIGHTS };
  assert.deepEqual(trafficFindings(base), []);
  const text = trafficFindings({ ...base, timeline: [{ date: '2026-10-01', users: 2, sessions: 4 }], pages: [{ path: '/', views: 9, users: 2, sessions: 4 }, { path: '/a', views: 1, users: 1, sessions: 1 }], leadsByPage: [] }).join('\n');
  assert.match(text, /90%/); assert.match(text, /Ningún evento lead_submitted/); assert.match(text, /no alcanzan para decidir/);
});
const env = { GOOGLE_ANALYTICS_PROPERTY_ID: '1', GOOGLE_ANALYTICS_STREAM_ID: '2', GOOGLE_ANALYTICS_TIME_ZONE: tz, GOOGLE_ANALYTICS_ACCESS_TOKEN: 'secret-token' };
const now = () => new Date('2026-10-10T12:00:00Z');
const ev = (name, page, source, medium, count) => row([name, page, source, medium], [count]);
test('events parser aggregates the merged report into the three slices', () => {
  const rows = [ev('lead_submitted', '/a', 'google', 'organic', 3), ev('lead_submitted', '/b', 'google', 'organic', 1), ev('lead_submitted', '/a', 'fb', 'cpc', 2), ev('whatsapp_click', '/w', 'google', 'organic', 4), ev('quote_request_intent', '/w', 'fb', 'cpc', 1)];
  assert.deepEqual(parsers.events(rep(rows), tz), {
    leadsByPage: [{ label: '/a', count: 5 }, { label: '/b', count: 1 }],
    leadsBySource: [{ label: 'google / organic', count: 4 }, { label: 'fb / cpc', count: 2 }],
    whatsappByPage: [{ label: '/w', count: 5 }],
  });
  const many = Array.from({ length: 12 }, (_, i) => ev('lead_submitted', `/p${i}`, 's', 'm', i + 1));
  const top = parsers.events(rep(many), tz).leadsByPage;
  assert.equal(top.length, 10); assert.deepEqual(top[0], { label: '/p11', count: 12 }); assert.deepEqual(top[9], { label: '/p2', count: 3 });
});
test('events parser rejects truncated, unexpected and untrusted reports; zero rows are an explicit zero', () => {
  assert.equal(parsers.events({ ...rep([ev('lead_submitted', '/a', 's', 'm', 1), ev('lead_submitted', '/b', 's', 'm', 1)]), rowCount: 3 }, tz), null);
  assert.equal(parsers.events(rep([ev('page_view', '/a', 's', 'm', 1)]), tz), null);
  assert.equal(parsers.events(rep([], { subjectToThresholding: true }), tz), null);
  assert.deepEqual(parsers.events(rep([]), tz), { leadsByPage: [], leadsBySource: [], whatsappByPage: [] });
});
const serviceReport = rows => ({ ...rep(rows), dimensionHeaders: [{ name: 'customEvent:service_id' }], metricHeaders: [{ name: 'sessions' }] });
const batch = (reports, calls = [], service = () => Response.json(serviceReport([]))) => async (url, init) => {
  const body = JSON.parse(init.body);
  calls.push({ url: String(url), body });
  return body.requests ? Response.json({ reports: reports(body.requests.length) }) : service();
};
test('calculator report counts sessions by catalog service for the applied range and stream', async () => {
  const calls = [];
  const fetcher = batch(n => Array(n).fill(rep([])), calls, () => Response.json(serviceReport([row(['registro-de-marca'], [3])])));
  const out = await createGoogleInsightsReader({ env, fetcher, now })(new URLSearchParams('start=2026-10-01&end=2026-10-04'));
  assert.deepEqual(out.serviceInterest, [{ label: 'Registro de marca', sessions: 3 }]);
  const { body, url } = calls.find(call => call.url.endsWith(':runReport'));
  assert.match(url, /properties\/1:runReport$/);
  assert.deepEqual(body.dateRanges, [{ startDate: period.start, endDate: period.end }]);
  assert.deepEqual(body.dimensions, [{ name: 'customEvent:service_id' }]); assert.deepEqual(body.metrics, [{ name: 'sessions' }]);
  const filters = body.dimensionFilter.andGroup.expressions.map(e => e.filter);
  for (const [field, value] of [['streamId','2'], ['eventName','quote_change'], ['customEvent:control_id','service']]) assert.ok(filters.some(f => f.fieldName === field && f.stringFilter.matchType === 'EXACT' && f.stringFilter.value === value));
  assert.deepEqual(filters.find(f => f.fieldName === 'customEvent:service_id').inListFilter.values, serviceDetails.map(service => service.slug));
});
test('unavailable dimensions, unknown IDs, malformed counts and restricted reports never become zero', async () => {
  const good = serviceReport([]);
  for (const response of [new Response('', { status: 400 }), ...[rep([]), { ...good, rowCount: 2 }, { ...good, metadata: { ...meta, subjectToThresholding: true } }, serviceReport([row([], [1])]), serviceReport([row(['not-in-catalog'], [4])]), serviceReport([row(['registro-de-marca'], ['x'])])].map(r => Response.json(r))]) {
    const out = await createGoogleInsightsReader({ env, now, fetcher: batch(n => Array(n).fill(rep([])), [], () => response) })(new URLSearchParams('days=7'));
    assert.equal(out.state, 'partial'); assert.equal(out.serviceInterest, null); assert.deepEqual(out.pages, []);
  }
});
test('original five reports stay batched; a bad report degrades only its own slice', async () => {
  const calls = [];
  const fetcher = batch(n => Array.from({ length: n }, (_, i) => (i === 1 ? rep([], { timeZone: 'UTC' }) : rep([]))), calls);
  const out = await createGoogleInsightsReader({ env, fetcher, now })(new URLSearchParams('days=7'));
  assert.equal(out.state, 'partial'); assert.equal(out.pages, null); assert.ok(Array.isArray(out.timeline)); assert.deepEqual(out.leadsByPage, []);
  assert.ok(!JSON.stringify(out).includes('secret-token'));
  assert.equal(calls.length, 2); assert.match(calls[0].url, /:batchRunReports$/);
  const { requests } = calls[0].body;
  assert.equal(requests.length, 5); assert.ok(requests.every(r => !('property' in r)));
  assert.equal(requests[4].limit, '5000');
  const names = JSON.stringify(requests[4].dimensionFilter);
  for (const name of ['lead_submitted', 'whatsapp_click', 'quote_request_intent']) assert.ok(names.includes(name));
});
test('transport failures fail the whole batch; a wrong report count is an error', async () => {
  const run = fetcher => createGoogleInsightsReader({ env, fetcher, now })(new URLSearchParams('days=7'));
  assert.equal((await run(async () => new Response('x', { status: 401 }))).state, 'forbidden');
  assert.equal((await run(async () => new Response('x', { status: 500 }))).state, 'error');
  assert.equal((await run(batch(() => [rep([])]))).state, 'error');
});
test('budget is counted in HTTP calls: 4 distinct ranges per window, then deferred; cache costs nothing', async () => {
  const calls = [];
  const read = createGoogleInsightsReader({ env, fetcher: batch(n => Array.from({ length: n }, () => rep([])), calls), now });
  for (const q of ['days=7', 'days=28', 'days=90', 'start=2026-09-01&end=2026-09-05']) assert.equal((await read(new URLSearchParams(q))).state, 'available');
  assert.deepEqual((await read(new URLSearchParams('days=7'))).serviceInterest, []);
  assert.equal(calls.length, 8);
  assert.equal((await read(new URLSearchParams('start=2026-07-01&end=2026-07-05'))).state, 'deferred'); assert.equal(calls.length, 8);
});

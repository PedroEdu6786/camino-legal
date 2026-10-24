/** Real reader against the local Postman Google contract, with synthetic credentials only. */
import assert from 'node:assert/strict';
import { createGoogleSummaryReader } from '../app/lib/server/dashboard/googleSummary.ts';
import { formatSummaryMetric } from '../app/lib/dashboard/reporting.ts';

const base = process.env.GOOGLE_SUMMARY_SIMULATION_URL || 'http://127.0.0.1:4915/google';
const target = new URL(base);
if (!['127.0.0.1', 'localhost'].includes(target.hostname) || target.protocol !== 'http:') throw new Error('Local synthetic simulation only');
const mode = process.env.GOOGLE_SUMMARY_SIMULATION_MODE || 'success';
let requests = 0;
let upstreamStatus = null;
const reader = createGoogleSummaryReader({
  env: { GOOGLE_ANALYTICS_PROPERTY_ID: '123456', GOOGLE_ANALYTICS_STREAM_ID: '789012', GOOGLE_ANALYTICS_TIME_ZONE: 'America/Merida', GOOGLE_ANALYTICS_ACCESS_TOKEN: 'synthetic-test-token' },
  now: () => new Date('2026-10-24T12:00:00Z'),
  fetcher: async (url, options) => {
    const upstream = new URL(String(url));
    assert.equal(upstream.origin, 'https://analyticsdata.googleapis.com');
    requests++;
    const response = await fetch(`${base}${upstream.pathname}`, options);
    upstreamStatus = response.status;
    return response;
  },
});
const report = await reader(new URLSearchParams('days=28'));
assert.equal(requests, 1, 'one aggregate request, no retry');
if (mode === 'error') {
  assert.equal(upstreamStatus, 503, 'prove injected upstream error rather than an unreachable simulation');
  assert.equal(report.state, 'error');
  assert.ok(Object.values(report.metrics).every(value => value === null));
} else {
  assert.equal(upstreamStatus, 200);
  assert.equal(report.state, 'available');
  assert.deepEqual(report.metrics, { totalUsers: 120, screenPageViews: 340, bounceRate: 0.375, sessions: 160 });
  assert.equal(formatSummaryMetric('bounceRate', report.metrics.bounceRate), '37.5%');
  assert.equal(report.period.timezone, 'America/Merida');
  assert.deepEqual(await reader(new URLSearchParams('days=28')), report);
  assert.equal(requests, 1, 'same-identity read uses cached report');
  const different = await reader(new URLSearchParams('days=7'));
  assert.equal(different.state, 'deferred');
  assert.equal(different.metrics.totalUsers, null, 'new period cannot inherit previous report');
}
assert.ok(!JSON.stringify(report).includes('synthetic-test-token'));
console.log(JSON.stringify({ result: 'passed', mode, requests, state: report.state }));

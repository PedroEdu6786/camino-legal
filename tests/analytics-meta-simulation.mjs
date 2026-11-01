// Run against the local Postman simulation. Only synthetic IDs/hashes are used.
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { sendMetaLead } from '../app/lib/metaCapi.ts';

const base = process.env.META_SIMULATION_URL || 'http://127.0.0.1:4900/meta';
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) throw new Error('Simulation must be local');
const lead = { outcomeEventId: randomUUID(), occurredAt: Date.now(), emailHash: createHash('sha256').update('synthetic@example.test').digest('hex'), eventSourceUrl: 'https://site.example.test/cotizaciones', clientUserAgent: 'Synthetic Browser/1.0' };
const options = { endpoint: `${base}/v25.0/123456/events`, pixelId: '123456', accessToken: 'synthetic-test-token', apiVersion: 'v25.0', deadlineMs: 500 };
const mode = process.env.META_SIMULATION_MODE || 'accepted';
const before = Date.now();
const result = await sendMetaLead(lead, options);
assert.equal(result, mode === 'accepted');
assert.ok(Date.now() - before < 3000, 'HTTP client must have a bounded deadline');
if (mode === 'accepted') {
  assert.equal(await sendMetaLead(lead, { ...options, accessToken: 'synthetic-invalid-token' }), false);
}
console.log(`Meta HTTP simulation passed: ${mode}; no live Meta request was made.`);

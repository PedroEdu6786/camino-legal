import test from 'node:test';
import assert from 'node:assert/strict';
import { deliverEmail, classifyTransportError } from '../app/lib/server/emailDelivery.ts';

const recipient = 'firm@example.test';
async function scenario(sequence, consentStatus = 'unknown') {
  const records = []; let sends = 0;
  const result = await deliverEmail({ recipient, formId: 'trademark_evaluation', consentStatus,
    send: async () => { const response = sequence[sends++]; if (response instanceof Error) throw response; return response; }, sink: record => records.push(record) });
  return { result, sends, records };
}
test('intended recipient acceptance counts; another accepted recipient does not', async () => {
  const accepted = await scenario([{ accepted: [recipient] }]);
  assert.equal(accepted.result.outcome, 'accepted');
  assert.equal(accepted.sends, 1);
  assert.ok(accepted.result.outcomeEventId);
  const rejected = await scenario([{ accepted: ['other@example.test'], rejected: [recipient] }]);
  assert.equal(rejected.result.outcome, 'recipient_rejected');
  assert.equal(rejected.sends, 1);
  assert.equal(rejected.result.outcomeEventId, undefined);
});
test('unknown acceptance retries once and records separate attempts under one submission', async () => {
  for (const final of ['accepted', 'unknown', 'transport_failure']) {
    const response = final === 'accepted' ? { accepted: [recipient] } : final === 'unknown' ? {} : Object.assign(new Error('private@example.test'), { code: 'EAUTH' });
    const { result, sends, records } = await scenario([{}, response]);
    assert.equal(sends, 2); assert.equal(result.outcome, final === 'accepted' ? 'accepted' : 'unknown');
    assert.equal(records.length, 4);
    assert.equal(new Set(records.map(record => record.submission_id)).size, 1);
    assert.equal(new Set(records.map(record => record.attempt_id)).size, 2);
    assert.deepEqual(records.filter(record => record.event_name === 'email_result').map(record => record.outcome), ['unknown', final]);
    assert.equal(Boolean(result.outcomeEventId), final === 'accepted');
    assert.ok(!JSON.stringify(records).includes('private@example.test'));
  }
});
test('known transport failure is not automatically retried', async () => {
  const { result, sends } = await scenario([Object.assign(new Error('secret'), { code: 'ECONNREFUSED' })]);
  assert.equal(sends, 1); assert.equal(result.outcome, 'transport_failure');
  assert.equal(classifyTransportError({ code: 'ETIMEDOUT', command: 'DATA' }).outcome, 'unknown');
});
test('operational events remain content-free in every consent state and sink failure does not resend', async () => {
  for (const consent of ['unknown', 'denied', 'granted']) {
    const { records } = await scenario([{ accepted: [recipient] }], consent);
    assert.equal(records.length, 2); assert.equal(records[0].consent_status, consent);
    assert.ok(!JSON.stringify(records).includes(recipient));
    assert.equal(records[1].duration_ms >= 0, true);
  }
  let sends = 0;
  await deliverEmail({ recipient, formId: 'contact', consentStatus: 'denied', send: async () => { sends++; return { accepted: [recipient] }; }, sink: () => { throw new Error('sink unavailable'); } });
  assert.equal(sends, 1);
});

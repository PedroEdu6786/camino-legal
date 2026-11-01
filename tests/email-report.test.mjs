import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { emailReport } from '../scripts/email-report.mjs';

test('reports automatic retries as two transports and one confirmed submission, without extra log fields', () => {
  const submission = randomUUID();
  const rows = [];
  for (const [number, outcome] of [[1, 'unknown'], [2, 'accepted']]) {
    const attempt = randomUUID();
    const base = { submission_id: submission, attempt_id: attempt, attempt_number: number, form_id: 'contact', email: 'never-output@example.test' };
    rows.push({ ...base, event_id: randomUUID(), event_name: 'email_attempted' });
    rows.push({ ...base, event_id: randomUUID(), event_name: 'email_result', outcome });
  }
  const lines = [...rows, rows[3], { message: 'private content' }].map(row => JSON.stringify(row)).join('\n');
  const report = emailReport(lines, submission);
  assert.equal(report.totals.logical_submissions, 1);
  assert.equal(report.totals.transport_attempts, 2);
  assert.equal(report.totals.automatic_retries, 1);
  assert.equal(report.totals.confirmed_submissions, 1);
  assert.equal(report.totals.unresolved_submissions, 0);
  assert.equal(report.ignored_lines, 1);
  assert.equal(JSON.stringify(report).includes('never-output'), false);
});

test('keeps unknown then failure unresolved and rejects malformed log lines', () => {
  const submission = randomUUID();
  const lines = ['unknown', 'transport_failure'].map((outcome, index) => JSON.stringify({
    event_name: 'email_result', event_id: randomUUID(), attempt_id: randomUUID(), submission_id: submission,
    attempt_number: index + 1, form_id: 'trademark_evaluation', outcome,
  })).join('\n') + '\nnot-json';
  assert.equal(emailReport(lines).totals.unresolved_submissions, 1);
  assert.equal(emailReport(lines).totals.confirmed_submissions, 0);
  assert.equal(emailReport(lines).ignored_lines, 1);
});

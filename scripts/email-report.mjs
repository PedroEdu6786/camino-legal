import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

const UUID = /^[a-f0-9-]{36}$/i;
const outcomes = ['accepted', 'recipient_rejected', 'transport_failure', 'unknown'];

/** Accept extracted JSON log lines; never echo unknown host fields or message contents. */
export function emailReport(lines, submissionId) {
  const records = new Map();
  let ignoredLines = 0;
  for (const line of lines.split('\n')) {
    if (!line.trim()) continue;
    let record;
    try { record = JSON.parse(line); } catch { ignoredLines++; continue; }
    if (!['email_attempted', 'email_result'].includes(record.event_name) ||
        !UUID.test(record.event_id ?? '') || !UUID.test(record.submission_id ?? '') ||
        !UUID.test(record.attempt_id ?? '') || !['contact', 'trademark_evaluation'].includes(record.form_id) ||
        ![1, 2].includes(record.attempt_number) ||
        (record.event_name === 'email_result' && !outcomes.includes(record.outcome))) {
      ignoredLines++; continue;
    }
    if (submissionId && record.submission_id !== submissionId) continue;
    records.set(record.event_id, {
      event_name: record.event_name, event_id: record.event_id,
      submission_id: record.submission_id, attempt_id: record.attempt_id,
      attempt_number: record.attempt_number, form_id: record.form_id,
      ...(record.event_name === 'email_result' ? { outcome: record.outcome } : {}),
    });
  }
  const submissions = new Map();
  const totals = { logical_submissions: 0, transport_attempts: 0, automatic_retries: 0,
    confirmed_submissions: 0, unresolved_submissions: 0, recipient_rejected: 0, transport_failure: 0, unknown_attempts: 0 };
  for (const record of records.values()) {
    const group = submissions.get(record.submission_id) ?? { attempts: new Set(), results: [] };
    if (record.event_name === 'email_attempted') {
      if (!group.attempts.has(record.attempt_id)) {
        group.attempts.add(record.attempt_id);
        totals.transport_attempts++;
        if (record.attempt_number === 2) totals.automatic_retries++;
      }
    } else group.results.push(record);
    submissions.set(record.submission_id, group);
  }
  totals.logical_submissions = submissions.size;
  for (const group of submissions.values()) {
    const accepted = group.results.some(record => record.outcome === 'accepted');
    if (accepted) totals.confirmed_submissions++;
    else if (group.results.some(record => record.outcome === 'unknown') || group.results.length < group.attempts.size) totals.unresolved_submissions++;
    for (const record of group.results) {
      if (record.outcome === 'unknown') totals.unknown_attempts++;
      else if (record.outcome !== 'accepted') totals[record.outcome]++;
    }
  }
  return { totals, ignored_lines: ignoredLines, ...(submissionId ? { attempts: [...records.values()] } : {}) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , filename, submissionId] = process.argv;
  if (!filename || (submissionId && !UUID.test(submissionId))) {
    console.error('Usage: node scripts/email-report.mjs <extracted-email-records.ndjson> [submission-uuid]');
    process.exitCode = 1;
  } else {
    try { console.log(JSON.stringify(emailReport(await readFile(filename, 'utf8'), submissionId), null, 2)); }
    catch { console.error('Could not read the extracted email records.'); process.exitCode = 1; }
  }
}

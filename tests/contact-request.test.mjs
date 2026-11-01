import test from 'node:test';
import assert from 'node:assert/strict';
import { FORM_IDS, contactRequest, validContactRequest, consultationMessage, evaluationMessage } from '../app/lib/contactRequest.ts';
import { sanitizeParams } from '../app/lib/measurement/contracts.ts';
import { websiteSourceUrl, createReceipt, openReceipt, matchingHashes } from '../app/lib/server/analyticsSecurity.ts';
import { emailReport } from '../scripts/email-report.mjs';

const data = (formId, overrides = {}) => {
  const form = new FormData();
  for (const [key, value] of Object.entries({ formId, name: 'Synthetic visitor', phone: '9991234567', email: 'visitor@example.test', message: 'Mi proyecto y mi solicitud.', ...overrides })) form.set(key, value);
  return form;
};
for (const formId of FORM_IDS) {
  test(`${formId} validates phone, email and editable message on the server`, () => {
    assert.equal(validContactRequest(contactRequest(data(formId))), true);
    for (const phone of ['', '999123', '12345678901234567890', 'abcdefghij']) assert.equal(validContactRequest(contactRequest(data(formId, {phone}))), false);
    for (const message of ['', '   ', 'x'.repeat(5001)]) assert.equal(validContactRequest(contactRequest(data(formId, {message}))), false);
    assert.equal(validContactRequest(contactRequest(data(formId, { email: 'not-an-email' }))), false);
    assert.equal(contactRequest(data(formId, { message: ' Mi mensaje editado ' })).message, 'Mi mensaje editado');
    assert.equal(contactRequest(data(formId)).formId, formId);
  });
}
test('prefilled requests distinguish evaluation-only scope from a full quotation', () => {
  const detail = '2 clases. Reglas de Uso: sí. Estimado: $10,000 MXN. Modalidad: 3 pagos.';
  assert.ok(consultationMessage('Registro de marca', detail).includes(detail));
  assert.ok(consultationMessage('Contratos y convenios', 'Propuesta según alcance.').includes('contratos y convenios'));
  assert.match(evaluationMessage, /solo con la evaluación/);
  assert.match(evaluationMessage, /799 MXN/);
  assert.doesNotMatch(evaluationMessage, /3 pagos|registro completo/);
});
test('quotation form has its own registered identity without leaking submitted fields into analytics', () => {
  assert.deepEqual(sanitizeParams({form_id:'quotation_consultation',name:'Private',phone:'9991234567',email:'private@example.test',message:'Private message'}), {form_id:'quotation_consultation'});
  const origin = 'https://example.test';
  assert.equal(websiteSourceUrl('quotation_consultation','/cotizaciones',origin), origin+'/cotizaciones');
  assert.equal(websiteSourceUrl('quotation_consultation','/contacto',origin), null);
  assert.equal(websiteSourceUrl('quotation_consultation','/cotizaciones?message=private',origin), null);
  const now=Date.now(), consent={status:'granted',version:'synthetic-v1'}, secret='synthetic-contact-test-key-over-32-characters';
  const receipt={outcomeEventId:crypto.randomUUID(),occurredAt:now,expiresAt:now+300000,consentVersion:consent.version,formId:'quotation_consultation',...matchingHashes('visitor@example.test','9991234567')};
  assert.deepEqual(openReceipt(createReceipt(receipt,secret),consent,now,secret),receipt);
  const report=emailReport(JSON.stringify({event_name:'email_result',event_id:crypto.randomUUID(),submission_id:crypto.randomUUID(),attempt_id:crypto.randomUUID(),attempt_number:1,form_id:'quotation_consultation',outcome:'accepted'}));
  assert.equal(report.totals.confirmed_submissions,1);
  assert.equal(report.ignored_lines,0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhone } from '../app/lib/phone.ts';
import { contactRequest, validContactRequest, FORM_IDS } from '../app/lib/contactRequest.ts';
import { matchingHashes } from '../app/lib/server/analyticsSecurity.ts';
import { createHash } from 'node:crypto';

const cases = [
  ['MX', '999 123 4567', '+529991234567'],
  ['US', '(202) 555-0123', '+12025550123'],
  ['GB', '020 7946 0958', '+442079460958'],
  ['ES', '612 345 678', '+34612345678'],
  ['FR', '06 12 34 56 78', '+33612345678'],
  ['AU', '0412 345 678', '+61412345678'],
  ['IT', '02 36618 300', '+390236618300'],
];
test('national numbers use the selected country and retain country-specific lengths and leading digits', () => {
  for (const [country, input, expected] of cases) assert.equal(normalizePhone(input, country), expected, country);
  assert.equal(normalizePhone('9991234567'), '+529991234567', 'Mexico is the initial default');
});
test('explicit international numbers override the default without truncation or a second prefix', () => {
  assert.equal(normalizePhone('+44 20 7946 0958', 'MX'), '+442079460958');
  assert.equal(normalizePhone('+1 (202) 555-0123', 'MX'), '+12025550123');
  for (const input of ['', '123', '+999123456789', 'call me at +12025550123', '+12025550123\nInjected text', '1'.repeat(41)]) assert.equal(normalizePhone(input), '', input);
  assert.equal(normalizePhone('2025550123', 'INVALID'), '');
});
test('every form normalizes international phones before email delivery and conversion hashing', () => {
  for (const formId of FORM_IDS) for (const [country, phone, expected] of cases) {
    const data = new FormData();
    for (const [key, value] of Object.entries({ formId, phoneCountry: country, phone, name:'Synthetic visitor', email:'visitor@example.test', message:'Me gustaría conocer sus servicios.' })) data.set(key, value);
    const request = contactRequest(data);
    assert.equal(request.phone, expected);
    assert.equal(validContactRequest(request), true);
    assert.equal(matchingHashes(request.email, request.phone).phoneHash, createHash('sha256').update(expected.slice(1)).digest('hex'));
  }
});

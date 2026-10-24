import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { signConsent, readConsent, matchingHashes, createReceipt, openReceipt, websiteSourceUrl, safeUserAgent } from '../app/lib/server/analyticsSecurity.ts';
const secret = 'synthetic-test-key-not-production-123456';
const consent = { status: 'granted', version: 'consent_v1' };
const now = Date.now();
const payload = { outcomeEventId: randomUUID(), occurredAt: now, expiresAt: now + 300000, consentVersion: consent.version, formId: 'trademark_evaluation', ...matchingHashes('TEST@example.test', '') };
test('server consent is signed and cannot be changed by clients', () => {
  const signed = signConsent(consent, secret);
  assert.deepEqual(readConsent(signed, secret), consent);
  assert.equal(readConsent(`${signed}x`, secret), null);
  assert.equal(readConsent(signed, 'different-secret-longer-than-32-characters'), null);
  assert.equal(signConsent(consent, 'short'), null);
  assert.equal(readConsent(undefined, secret), null);
});
test('accepted receipt encrypts matching hashes and requires current same consent version', () => {
  const encrypted = createReceipt(payload, secret);
  assert.ok(encrypted); assert.ok(!encrypted.includes(payload.emailHash));
  assert.deepEqual(openReceipt(encrypted, consent, now, secret), payload);
  assert.equal(openReceipt(encrypted, { status: 'denied', version: consent.version }, now, secret), null);
  assert.equal(openReceipt(encrypted, { status: 'granted', version: 'later' }, now, secret), null);
  assert.equal(openReceipt(encrypted, consent, now + 300000, secret), null);
  assert.equal(openReceipt(`${encrypted}x`, consent, now, secret), null);
  assert.equal(openReceipt(encrypted, null, now, secret), null);
  assert.equal(openReceipt(encrypted, consent, now, 'short'), null);
});
test('email-only evaluation does not invent a phone matching hash', () => {
  const hashes = matchingHashes('TEST@example.test', '');
  assert.equal(hashes.emailHash, matchingHashes('test@example.test', '').emailHash);
  assert.equal(hashes.phoneHash, undefined);
  assert.equal(matchingHashes('test@example.test', '9991234567').phoneHash, matchingHashes('test@example.test', '529991234567').phoneHash);
});

test('website source uses trusted origin and registered form paths only', () => {
  const origin = 'https://site.example.test';
  assert.equal(websiteSourceUrl('contact', '/', origin), `${origin}/`);
  assert.equal(websiteSourceUrl('contact', '/contacto', origin), `${origin}/contacto`);
  assert.equal(websiteSourceUrl('trademark_evaluation', '/cotizaciones', origin), `${origin}/cotizaciones`);
  assert.equal(websiteSourceUrl('contact', '/contacto?email=private@example.test', origin), null);
  assert.equal(websiteSourceUrl('contact', 'https://attacker.test', origin), null);
  for (const invalid of ['http://site.example.test', 'https://user:pass@site.example.test', 'https://site.example.test?secret=x', 'https://site.example.test/path']) {
    assert.equal(websiteSourceUrl('contact', '/', invalid), null);
  }
  assert.equal(safeUserAgent('Synthetic Browser/1.0'), 'Synthetic Browser/1.0');
  assert.equal(safeUserAgent('a'.repeat(513)), undefined);
  assert.equal(safeUserAgent('line\nvalue'), undefined);
});
test('restricted website fields stay encrypted and origin changes invalidate handoff evidence', () => {
  const previous = process.env.META_WEBSITE_ORIGIN;
  try {
    process.env.META_WEBSITE_ORIGIN = 'https://site.example.test';
    const website = { ...payload, eventSourceUrl: 'https://site.example.test/cotizaciones', clientUserAgent: 'Synthetic Browser/1.0' };
    const encrypted = createReceipt(website, secret);
    assert.ok(!encrypted.includes(website.clientUserAgent));
    assert.ok(!encrypted.includes(website.eventSourceUrl));
    assert.deepEqual(openReceipt(encrypted, consent, now, secret), website);
    process.env.META_WEBSITE_ORIGIN = 'https://another.example.test';
    assert.equal(openReceipt(encrypted, consent, now, secret), null);
  } finally {
    if (previous === undefined) delete process.env.META_WEBSITE_ORIGIN;
    else process.env.META_WEBSITE_ORIGIN = previous;
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { quoteEmail, quoteWhatsApp } from '../app/lib/services.ts';
import { quoteSnapshot } from '../app/lib/quoteAnalytics.ts';
import { beginPage, configureProviders, markProviderReady, setConsent, trackEvent } from '../app/lib/analytics.ts';

test('consultation links encode selected service and quote details for both channels', () => {
  const service = 'Contratos y convenios';
  const detail = 'Dos titulares & revisión\nEstimado: $5,899.77 MXN';
  const email = new URL(quoteEmail(service, detail));
  const whatsapp = new URL(quoteWhatsApp(service, detail));
  assert.equal(email.protocol, 'mailto:');
  assert.equal(email.pathname, 'info@caminolegal.com.mx');
  assert.equal(whatsapp.origin, 'https://wa.me');
  assert.equal(whatsapp.pathname, '/529992505160');
  for (const message of [email.searchParams.get('body'), whatsapp.searchParams.get('text')]) {
    assert.ok(message.includes(service));
    assert.ok(message.includes(detail));
  }
});

test('each consultation channel emits one GA intent and one Meta Contact, gated by consent', () => {
  const ga = [], meta = [], stored = new Map();
  globalThis.window = Object.assign(new EventTarget(), {
    location: new URL('https://caminolegal.com.mx/cotizaciones'),
    gtag: (...args) => ga.push(args), fbq: (...args) => meta.push(args),
  });
  globalThis.document = { referrer: '' };
  globalThis.localStorage = { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) };
  configureProviders({ ga4: true, meta: true });
  beginPage('/cotizaciones');
  const snapshot = quoteSnapshot(crypto.randomUUID(), 'registro-de-marca', 2, true, 2);
  const send = channel => trackEvent('quote_request_intent', { ...snapshot, source_surface: 'quotation', service_context: 'explicit', action_id: `quote.request_${channel}`, channel, destination_kind: channel, destination_id: `business_${channel}` });
  setConsent('denied');
  send('email'); send('whatsapp');
  assert.equal(ga.filter(c => c[0] === 'event').length, 0);
  assert.equal(meta.filter(c => c[0] === 'track').length, 0);
  setConsent('granted'); markProviderReady('ga4'); markProviderReady('meta');
  for (const channel of ['email', 'whatsapp']) {
    send(channel);
    const intents = ga.filter(c => c[1] === 'quote_request_intent' && c[2].channel === channel);
    const contacts = meta.filter(c => c[1] === 'Contact' && c[2].channel === channel);
    assert.equal(intents.length, 1); assert.equal(contacts.length, 1);
    assert.equal(intents[0][2].action_id, `quote.request_${channel}`);
    assert.equal(intents[0][2].estimated_total_minor, snapshot.estimated_total_minor);
    assert.equal(intents[0][2].service_id, snapshot.service_id);
    assert.equal(intents[0][2].event_id, contacts[0][3].eventID);
  }
  assert.equal(ga.filter(c => c[1] === 'lead_submitted').length, 0);
  assert.equal(meta.filter(c => c[1] === 'Lead').length, 0);
  setConsent('denied');
});

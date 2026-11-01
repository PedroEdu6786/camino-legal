import test from 'node:test';
import assert from 'node:assert/strict';
import { trademarkQuote, quoteEmail } from '../app/lib/services.ts';

test('uses the user-confirmed one-class quotation', () => {
  assert.deepEqual(trademarkQuote(1), { evaluation: 79900, management: 228700, official: 281377, extra: 0, total: 589977 });
});
test('charges the evaluation once, with per-class fees and optional Rules of Use', () => {
  assert.equal(trademarkQuote(2).total, 1100054);
  assert.equal(trademarkQuote(1, true).total, 651577);
  for (let count = 1; count <= 10; count++) {
    const quote = trademarkQuote(count, true);
    assert.equal(quote.evaluation, 79900);
    assert.equal(quote.total, 79900 + count * 510077 + 61600);
    assert.equal(quote.total, quote.evaluation + quote.management + quote.official + quote.extra);
  }
});
test('rejects unsupported class counts', () => {
  for (const count of [0, -1, 1.5, 11, NaN]) assert.throws(() => trademarkQuote(count), RangeError);
});
test('encodes the selected service and details in a real email draft', () => {
  const url = new URL(quoteEmail('Contratos & convenios', 'Mi proyecto: A+B\nDos documentos'));
  assert.equal(url.protocol, 'mailto:');
  assert.equal(url.pathname, 'info@caminolegal.com.mx');
  assert.equal(url.searchParams.get('subject'), 'Cotización · Contratos & convenios');
  assert.ok(url.searchParams.get('body').includes('Mi proyecto: A+B\nDos documentos'));
});

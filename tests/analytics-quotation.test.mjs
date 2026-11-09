import test from 'node:test';
import assert from 'node:assert/strict';
import { quoteSnapshot } from '../app/lib/quoteAnalytics.ts';
import { trademarkQuote } from '../app/lib/services.ts';

test('analytics estimate matches every displayed class/rules combination in integer cents', () => {
  for (let classes = 1; classes <= 10; classes++) {
    for (const rules of [false, true]) {
      for (const payments of [1, 2, 3]) {
        const value = quoteSnapshot('quote-instance', 'registro-de-marca', classes, rules, payments);
        assert.equal(value.estimated_total_minor, trademarkQuote(classes, rules).total);
        assert.equal(value.evaluation_minor, 79900);
        assert.equal(value.payment_count, payments);
        assert.equal(value.ownership_rules, rules);
        assert.equal(value.quote_id, 'quote-instance');
        assert.equal(value.currency, 'MXN');
        assert.equal(value.price_kind, 'estimate');
      }
    }
  }
});

test('web legal reports its fixed estimate without trademark-only controls', () => {
  const value = quoteSnapshot('same-quote-instance', 'marco-legal-digital', 10, true, 1);
  assert.equal(value.service_id, 'marco-legal-digital');
  assert.equal(value.quote_type, 'estimate');
  assert.equal(value.estimated_total_minor, 279900);
  assert.equal(value.payment_count, 1);
  for (const field of ['evaluation_minor', 'classes', 'ownership_rules']) {
    assert.equal(value[field], null, field);
  }
});

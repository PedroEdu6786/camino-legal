import test from 'node:test';
import assert from 'node:assert/strict';
import { quoteSnapshot } from '../app/lib/quoteAnalytics.ts';
import { services, trademarkQuote } from '../app/lib/services.ts';

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

test('custom services report unknown prices and no trademark-only controls', () => {
  for (const service of services.filter(service => ["consultoria-legal", "paquete-web-legal"].includes(service.slug))) {
    const value = quoteSnapshot('same-quote-instance', service.slug, 10, true, 1);
    assert.equal(value.service_id, service.slug);
    assert.equal(value.quote_type, 'custom');
    for (const field of ['estimated_total_minor', 'evaluation_minor', 'classes', 'payment_count', 'ownership_rules']) {
      assert.equal(value[field], null, `${service.slug}: ${field}`);
    }
  }
});

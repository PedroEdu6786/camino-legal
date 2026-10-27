import test from 'node:test';
import assert from 'node:assert/strict';
import { serviceQuotes, serviceQuoteTotal, servicePaymentPlan } from '../app/lib/serviceQuotes.ts';
import { quoteSnapshot } from '../app/lib/quoteAnalytics.ts';

test('2026 PDF totals and every payment plan reconcile in centavos', () => {
  const totals = { 'registro-de-aviso-comercial': 589900, 'derechos-de-autor': 259900, 'contratos-y-convenios': 249900 };
  for (const [slug, total] of Object.entries(totals)) {
    assert.equal(serviceQuoteTotal(slug), total);
    for (const plan of serviceQuotes[slug].plans) {
      assert.equal(plan.reduce((sum, [, amount]) => sum + amount, 0), total);
      const snapshot = quoteSnapshot('quote', slug, 10, true, plan.length);
      assert.equal(snapshot.estimated_total_minor, total);
      assert.equal(snapshot.payment_count, plan.length);
      assert.equal(snapshot.service_id, slug);
      assert.equal(snapshot.classes, null);
      assert.equal(snapshot.ownership_rules, null);
    }
  }
});
test('switching from three trademark payments uses an available two-payment plan', () => {
  for (const slug of ['derechos-de-autor', 'contratos-y-convenios']) {
    assert.equal(servicePaymentPlan(slug, 3).length, 2);
    assert.equal(quoteSnapshot('quote', slug, 1, false, 3).payment_count, 2);
  }
});
test('obra refund equals the unperformed second stage; contract diagnosis is part of total', () => {
  assert.deepEqual(servicePaymentPlan('derechos-de-autor', 2).map(([, n]) => n), [56000, 203900]);
  assert.deepEqual(servicePaymentPlan('contratos-y-convenios', 2).map(([, n]) => n), [39900, 210000]);
});

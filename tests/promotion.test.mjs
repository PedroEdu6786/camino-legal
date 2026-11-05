import test from 'node:test';
import assert from 'node:assert/strict';
import { promotionPhase, promotionDaysLeft } from '../app/lib/promotion.ts';
import { trademarkQuote } from '../app/lib/services.ts';
import { quoteSnapshot } from '../app/lib/quoteAnalytics.ts';

test('opens and closes at Mérida midnight, including the entire November 27', () => {
  for (const [instant, phase] of [
    ['2026-11-13T05:59:59.999Z', 'upcoming'],
    ['2026-11-13T06:00:00Z', 'active'],
    ['2026-11-28T05:59:59.999Z', 'active'],
    ['2026-11-28T06:00:00Z', 'ended'],
    ['2027-11-13T06:00:00Z', 'ended'],
  ]) assert.equal(promotionPhase(Date.parse(instant)), phase);
  assert.equal(promotionDaysLeft(Date.parse('2026-11-12T06:00:00Z')), 1);
});
test('credits the study within the exact promotional package; extras remain at regular rates', () => {
  const quote = trademarkQuote(1, false, true);
  assert.equal(quote.evaluation, 49900);
  assert.equal(quote.total, 569900);
  assert.equal(quote.total - quote.evaluation, 520000);
  assert.equal(quote.official, 281377);
  for (let classes = 1; classes <= 10; classes++) {
    for (const rules of [false, true]) {
      const q = trademarkQuote(classes, rules, true);
      assert.equal(q.total, 569900 + (classes - 1) * 510077 + (rules ? 61600 : 0));
      assert.equal(q.total, q.evaluation + q.management + q.official + q.extra);
      assert.equal(quoteSnapshot('test', 'registro-de-marca', classes, rules, 3, true).estimated_total_minor, q.total);
    }
  }
  assert.equal(trademarkQuote(1).total, 589977);
  assert.equal(trademarkQuote(1).evaluation, 79900);
  assert.equal(quoteSnapshot('test', 'consultoria-legal', 1, false, 1, true).estimated_total_minor, 39900);
});

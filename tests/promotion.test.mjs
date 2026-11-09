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
  assert.equal(quote.evaluation, 39900);
  assert.equal(quote.total, 549900);
  assert.equal(quote.total - quote.evaluation, 510000);
  assert.equal(quote.official, 281377);
  for (let classes = 1; classes <= 10; classes++) {
    for (const rules of [false, true]) {
      const q = trademarkQuote(classes, rules, true);
      assert.equal(q.total, 549900 + (classes - 1) * 510077 + (rules ? 61600 : 0));
      assert.equal(q.total, q.evaluation + q.management + q.official + q.extra);
      assert.equal(quoteSnapshot('test', 'registro-de-marca', classes, rules, 3, true).estimated_total_minor, q.total);
    }
  }
  assert.equal(trademarkQuote(1).total, 589977);
  assert.equal(trademarkQuote(1).evaluation, 79900);
  assert.equal(quoteSnapshot('test', 'consultoria-legal', 1, false, 1, true).estimated_total_minor, 39900);
});

test('public campaign follows real dates while private preview can simulate either state', async () => {
  const { promotionPreviewMode, promotionPreviewState } = await import('../app/lib/promotionPreview.ts');
  const expired = Date.parse('2026-12-01T12:00:00-06:00');
  for (const [date, phase] of [
    ['2026-11-05T12:00:00-06:00', 'upcoming'],
    ['2026-11-13T05:59:59.999Z', 'upcoming'],
    ['2026-11-13T06:00:00Z', 'active'],
    ['2026-11-28T05:59:59.999Z', 'active'],
    ['2026-11-28T06:00:00Z', 'ended'],
    ['2026-12-01T12:00:00-06:00', 'ended'],
  ]) {
    const state = promotionPreviewState(Date.parse(date), 'automatic');
    assert.equal(state.phase, phase);
    assert.equal(state.preview, false);
    assert.equal(state.now, Date.parse(date));
  }
  assert.equal(promotionPreviewState(expired, 'automatic').preview, false);
  const active = promotionPreviewState(expired, 'active');
  assert.equal(active.phase, 'active');
  assert.equal(active.preview, true);
  const upcoming = promotionPreviewState(expired, 'upcoming');
  assert.equal(upcoming.phase, 'upcoming');
  assert.equal(promotionDaysLeft(upcoming.now), 7);
  assert.equal(promotionPreviewState(Date.parse('2026-11-15T12:00:00-06:00'), 'upcoming').phase, 'upcoming');
  for (const invalid of [null, '', 'ended', 'ACTIVE', '{"mode":"active"}']) assert.equal(promotionPreviewMode(invalid), 'automatic');
});

test('saved preview needs an unexpired server-verified session and rejects malformed deadlines', async () => {
  const { previewSessionExpiry, authorizedPreviewMode } = await import('../app/lib/promotionPreview.ts');
  const now = Date.parse('2026-11-05T12:00:00-06:00');
  for (const body of [null, {}, { expiresAt: 'tomorrow' }, { expiresAt: NaN }, { expiresAt: Infinity }, { expiresAt: now }, { expiresAt: now + 9 * 3600000 }]) assert.equal(previewSessionExpiry(body, now), null);
  assert.equal(previewSessionExpiry({ expiresAt: now + 3600000 }, now), now + 3600000);
  assert.equal(authorizedPreviewMode('active', 0, now), 'automatic');
  assert.equal(authorizedPreviewMode('upcoming', now - 1, now), 'automatic');
  assert.equal(authorizedPreviewMode('active', now + 1, now), 'active');
  assert.equal(authorizedPreviewMode('active', now, now), 'automatic');
});

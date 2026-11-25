import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = name => readFileSync(new URL(`../app/components/dashboard/${name}`, import.meta.url), 'utf8');

test('the selected analytics range drives the summary and the insights panel', () => {
  const dashboard = read('AnalyticsDashboard.tsx');
  assert.doesNotMatch(dashboard, /<InsightsPanel[^>]*\bdays=/);
  assert.match(dashboard, /<InsightsPanel[^>]*query=\{range\.query\}/);
  assert.match(dashboard, /<GoogleSummary[^>]*onApply=/);
  const insights = read('InsightsPanel.tsx');
  assert.ok(insights.includes('/api/admin/analytics/insights?${query}'));
  assert.ok(!insights.includes('insights?days='));
  assert.ok(read('GoogleSummary.tsx').includes('/api/admin/analytics/summary?${range.query}'));
});

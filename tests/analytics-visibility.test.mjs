import test from 'node:test';
import assert from 'node:assert/strict';
import { representativeTarget } from '../app/lib/measurement/visibility.ts';

test('oversized responsive sections skip hidden text variants without requiring viewport intersection', () => {
  const owner = { getBoundingClientRect: () => ({ width: 900, height: 1800 }), querySelectorAll: () => [hidden, desktop] };
  const hidden = { getBoundingClientRect: () => ({ width: 0, height: 0 }), closest: () => owner };
  const desktop = { getBoundingClientRect: () => ({ width: 500, height: 80, top: 3000 }), closest: () => owner };
  const rendered = node => node.getBoundingClientRect().width > 0 && node.getBoundingClientRect().height > 0;
  assert.equal(representativeTarget(owner, 800, rendered), desktop);
  assert.equal(representativeTarget(owner, 800, node => node !== owner), null);
});

test('responsive form targets can be replaced without choosing content inside another tracked owner', () => {
  let mobile = false;
  const owner = { getBoundingClientRect: () => ({ width: 500, height: mobile ? 1200 : 600 }), querySelectorAll: () => [nested, input] };
  const nested = { getBoundingClientRect: () => ({ width: 200, height: 60 }), closest: () => ({}) };
  const input = { getBoundingClientRect: () => ({ width: 300, height: 44 }), closest: () => owner };
  assert.equal(representativeTarget(owner, 800, () => true), owner);
  mobile = true;
  assert.equal(representativeTarget(owner, 700, () => true), input);
  mobile = false;
  assert.equal(representativeTarget(owner, 800, () => true), owner);
});

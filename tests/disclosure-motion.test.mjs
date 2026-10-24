import test from 'node:test';
import assert from 'node:assert/strict';
import { installDisclosureMotion } from '../app/lib/disclosureMotion.ts';

function harness(t) {
  const listeners = new Map(), frames = new Map();
  let nextFrame = 0, preferenceChange;
  const preference = { matches: false, addEventListener: (_, fn) => { preferenceChange = fn; }, removeEventListener() {} };
  class Element {
    closest(selector) { return selector === 'summary' ? this.summary : null; }
  }
  class Details extends Element {
    open = false;
    isConnected = true;
    calls = [];
    getBoundingClientRect() { return { height: this.open ? 264 : 64 }; }
    animate(keyframes, options) {
      const animation = { cancelled: false, cancel() { this.cancelled = true; } };
      this.calls.push({ keyframes, options, animation });
      return animation;
    }
  }
  const previous = Object.fromEntries(['window', 'document', 'Element', 'HTMLDetailsElement'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  Object.assign(globalThis, {
    Element, HTMLDetailsElement: Details,
    window: {
      matchMedia: () => preference,
      getComputedStyle: () => ({ marginTop: '0px', marginBottom: '0px', paddingTop: '0px', paddingBottom: '0px', borderTopWidth: '0px', borderBottomWidth: '0px' }),
      requestAnimationFrame: fn => { frames.set(++nextFrame, fn); return nextFrame; },
      cancelAnimationFrame: id => frames.delete(id),
    },
    document: { addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: name => listeners.delete(name) },
  });
  const cleanup = installDisclosureMotion();
  t.after(() => {
    cleanup();
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  const details = new Details(), target = new Element();
  target.summary = { parentElement: details, getBoundingClientRect: () => ({ height: 64 }) };
  return {
    details, preference, cleanup, listeners,
    click: () => {
      const event = { target, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
      listeners.get('click')(event);
      return event;
    },
    flush: () => { const pending = [...frames.values()]; frames.clear(); for (const fn of pending) fn(); },
    preferenceChange: () => preferenceChange(),
  };
}

test('opening animates the full card from collapsed height to natural expanded height after native activation', t => {
  const h = harness(t);
  h.click();
  assert.equal(h.details.open, false, 'enhancement must leave native toggling and analytics ownership intact');
  assert.equal(h.details.calls.length, 0);
  h.details.open = true; // Browser default action, also used by keyboard activation.
  h.flush();
  assert.deepEqual(h.details.calls[0].keyframes.map(frame => frame.height), ['64px', '264px']);
  assert.ok(h.details.calls[0].keyframes.every(frame => frame.overflow === 'clip'), 'clipping must not change the measured formatting context');
  h.details.calls[0].animation.onfinish();
  assert.equal(h.details.calls[0].animation.cancelled, true, 'natural sizing resumes after the animation');
  h.details.open = false; h.click(); h.details.open = true; h.flush();
  h.details.open = false;
  h.listeners.get('toggle')({ target: h.details });
  assert.equal(h.details.calls[1].animation.cancelled, true, 'named accordion closure cancels in-flight motion');
});

test('closing keeps content visible until it reaches the collapsed height', t => {
  const h = harness(t);
  h.details.open = true;
  assert.equal(h.click().defaultPrevented, true);
  assert.equal(h.details.open, true);
  assert.deepEqual(h.details.calls[0].keyframes.map(frame => frame.height), ['264px', '64px']);
  h.details.calls[0].animation.onfinish();
  assert.equal(h.details.open, false);
  assert.equal(h.details.calls[0].animation.cancelled, true);
});

test('rapid toggles reverse closing and detached route content does not animate', t => {
  const h = harness(t);
  h.click(); h.details.open = true;
  h.click();
  h.flush();
  assert.equal(h.details.calls.length, 1);
  assert.equal(h.click().defaultPrevented, true);
  assert.equal(h.details.calls[0].animation.cancelled, true);
  h.details.calls[0].animation.onfinish(); // Stale completion must not close a reopened card.
  h.details.calls[1].animation.onfinish();
  assert.equal(h.details.open, true);
  h.details.open = false;
  h.click(); h.details.open = true; h.details.isConnected = false;
  h.flush();
  assert.equal(h.details.calls.length, 2);
});

test('reduced motion bypasses opening and cancels active animations immediately', t => {
  const h = harness(t);
  h.preference.matches = true;
  h.click(); h.details.open = true; h.flush();
  assert.equal(h.details.calls.length, 0);
  h.details.open = false; h.preference.matches = false;
  h.click(); h.details.open = true; h.flush();
  h.preference.matches = true; h.preferenceChange();
  assert.equal(h.details.calls[0].animation.cancelled, true);
  h.cleanup();
  assert.equal(h.listeners.size, 0);
});

test('switching to reduced motion completes a pending close immediately', t => {
  const h = harness(t);
  h.details.open = true; h.click();
  h.preference.matches = true; h.preferenceChange();
  assert.equal(h.details.open, false);
  assert.equal(h.details.calls[0].animation.cancelled, true);
});

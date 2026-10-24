/** Real layout regression: trailing margins must not snap at animation completion. */
import assert from 'node:assert/strict';
import { Browser } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const url = process.env.DISCLOSURE_TEST_URL || 'http://localhost:3002/cotizaciones';
if (!['localhost', '127.0.0.1'].includes(new URL(url).hostname)) throw new Error('Local testing only');
const browser = await Browser.launch({ extraArgs: ["--disable-gpu"] });
let focusTimer;
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ width, height: 900 });
    await page.goto(url);
    await page.send('Page.bringToFront');
    focusTimer = setInterval(() => { void page.send('Page.bringToFront').catch(() => {}); }, 100);
    for (const index of [0, 1]) {
      for (const action of ['open', 'close']) {
        await page.send('Page.bringToFront');
        const result = await page.eval(async ({ index, action }) => {
          const details = document.querySelectorAll('.quote-disclosure')[index];
          details.scrollIntoView({ behavior: 'instant', block: 'center' });
          const frames = [];
          const sample = () => {
            const rect = details.getBoundingClientRect();
            frames.push({ height: rect.height, next: details.nextElementSibling.getBoundingClientRect().top - rect.top, active: details.getAnimations().length > 0 });
          };
          sample();
          details.querySelector('summary').click();
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Animation sampling timed out: ' + JSON.stringify({visibility: document.visibilityState, frames}))), 3000);
            const start = performance.now();
            function tick() {
              sample();
              if (performance.now() - start > 500) { clearTimeout(timeout); resolve(); }
              else requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
          });
          const end = frames.findIndex((frame, i) => i > 1 && !frame.active && frames[i - 1].active);
          return { action, open: details.open, intermediate: frames.filter(f => f.active).length, before: frames[end - 1], after: frames[end], final: frames.at(-1) };
        }, { index, action });
        assert.ok(result.intermediate > 3, `${width}/${index}/${action}: must animate across multiple frames`);
        assert.equal(result.open, action === 'open');
        assert.ok(result.before && result.after, 'Must sample the handoff to natural height');
        for (const key of ['height', 'next']) {
          assert.ok(Math.abs(result.before[key] - result.after[key]) < 1, `${width}/${index}/${action}: ${key} jumped: ${JSON.stringify(result)}`);
          assert.ok(Math.abs(result.after[key] - result.final[key]) < 1, 'Layout must remain stable after completion');
        }
        console.log(`PASS ${width}px disclosure ${index + 1} ${action}: no end-of-animation snap`);
      }
    }
    clearInterval(focusTimer);
    await page.close();
  }
} finally {
  clearInterval(focusTimer);
  await browser.close();
}

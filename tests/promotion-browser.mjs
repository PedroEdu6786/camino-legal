/** Public schedule, responsive prices and live transitions without a reload. */
import assert from 'node:assert/strict';
import { Browser } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const base = process.env.PROMOTION_TEST_URL || 'http://localhost:3000';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only');
const browser = await Browser.launch({extraArgs: ['--disable-gpu']});
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function wait(page, check) {
  for (let i = 0; i < 100; i++) {
    if (await page.eval(check)) return;
    await pause(100);
  }
  throw new Error(`UI did not settle: ${JSON.stringify(page.consoleErrors)}`);
}
async function checkPhase(page, phase) {
  await wait(page, () => !!document.querySelector('main'));
  if (phase === 'upcoming') await wait(page, () => !!document.querySelector('aside[aria-label="Próximamente en Camino Legal"]'));
  if (phase === 'active') await wait(page, () => !!document.querySelector('aside[aria-label="Promoción de noviembre"]'));
  if (phase === 'ended') await wait(page, () => !document.querySelector('aside[aria-label="Promoción de noviembre"], aside[aria-label="Próximamente en Camino Legal"], #promotion-title'));
  assert.equal(await page.eval(() => !!document.querySelector('aside[aria-label="Vista previa privada de promoción"]')), false);
  assert.equal(await page.eval(() => !!document.querySelector('aside[aria-label="Próximamente en Camino Legal"]')), phase === 'upcoming');
  assert.equal(await page.eval(() => !!document.querySelector('aside[aria-label="Promoción de noviembre"]')), phase === 'active');
  const path = await page.eval(() => location.pathname);
  if (path === '/') assert.equal(await page.eval(() => !!document.querySelector('#hero-section aside')), phase === 'active');
  if (path === '/servicios') assert.equal(await page.eval(() => !!document.querySelector('.explorer-price[data-promotion]')), phase === 'active');
  if (path === '/servicios/registro-de-marca' || path === '/cotizaciones') {
    const selector = path === '/cotizaciones' ? '.quote-total' : '.service-stage-price';
    await wait(page, () => !!document.querySelector('.quote-total, .service-stage-price'));
    assert.match(await page.eval(selector => document.querySelector(selector).textContent, selector), phase === 'active' ? /5,699/ : /5,899.77/);
    assert.equal(await page.eval(selector => !!document.querySelector(`${selector} del`), selector), phase === 'active');
  }
  assert.equal(await page.eval(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.deepEqual(page.consoleErrors, []);
}
try {
  for (const width of [1440, 768, 390]) {
    for (const [date, phase] of [
      ['2026-11-13T05:59:59.999Z', 'upcoming'],
      ['2026-11-13T06:00:00Z', 'active'],
      ['2026-11-28T06:00:00Z', 'ended'],
    ]) {
      const page = await browser.newPage({width, height: 900});
      await page.send('Page.addScriptToEvaluateOnNewDocument', {source: `window.campaignTestNow = Date.parse('${date}'); Date.now = () => window.campaignTestNow; localStorage.setItem('analytics-consent', 'denied'); localStorage.removeItem('marca-noviembre-2026');`});
      for (const path of ['/', '/servicios', '/servicios/registro-de-marca', '/cotizaciones']) {
        await page.goto(base + path);
        await page.send('Page.bringToFront');
        await checkPhase(page, phase);
      }
      if (phase === 'upcoming') {
        await page.eval(() => { window.campaignTestNow = Date.parse('2026-11-13T06:00:00Z'); });
        await checkPhase(page, 'active');
        await wait(page, () => !!document.querySelector('dialog[open] #promotion-title'));
        await page.eval(() => { window.campaignTestNow = Date.parse('2026-11-28T06:00:00Z'); });
        await checkPhase(page, 'ended');
        assert.equal(await page.eval(() => document.body.style.overflow === 'hidden'), false);
      }
      console.log(`PASS ${width} ${phase}: public pages/prices, no private indicator, overflow or runtime errors${phase === 'upcoming' ? '; live launch, welcome and expiry without reload' : ''}`);
    }
  }
} finally { await browser.close(); }

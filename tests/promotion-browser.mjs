/** Public visitors must see the original site, even during the campaign dates. */
import assert from 'node:assert/strict';
import { Browser } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const base = process.env.PROMOTION_TEST_URL || 'http://localhost:3000';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only');
const browser = await Browser.launch({extraArgs: ['--disable-gpu']});
try {
  for (const width of [1440, 768, 390]) {
    const page = await browser.newPage({width, height: 900});
    await page.send('Page.addScriptToEvaluateOnNewDocument', {source: `Date.now = () => Date.parse('2026-11-15T12:00:00-06:00'); localStorage.setItem('analytics-consent', 'denied');`});
    for (const path of ['/', '/servicios', '/servicios/registro-de-marca', '/cotizaciones']) {
      await page.goto(base + path);
      await page.send('Page.bringToFront');
      assert.equal(await page.eval(() => !!document.querySelector('aside[aria-label="Promoción de noviembre"], aside[aria-label="Próximamente en Camino Legal"], aside[aria-label="Vista previa privada de promoción"], #promotion-title')), false);
      if (path === '/') {
        assert.equal(await page.eval(() => !!document.querySelector('#hero-section aside')), false);
        assert.equal(await page.eval(() => !!document.querySelector('#hero-section a[href="/servicios"]')), true);
      }
      if (path === '/servicios') assert.equal(await page.eval(() => !!document.querySelector('.explorer-price[data-promotion]')), false);
      if (path === '/servicios/registro-de-marca') assert.match(await page.eval(() => document.querySelector('.service-stage-price').textContent), /5,899.77/);
      if (path === '/cotizaciones') {
        assert.match(await page.eval(() => document.querySelector('.quote-total').textContent), /5,899.77/);
        assert.equal(await page.eval(() => !!document.querySelector('.quote-total del')), false);
      }
      assert.equal(await page.eval(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.deepEqual(page.consoleErrors, []);
    }
    console.log(`PASS ${width}: public home/services/quotes unchanged during campaign dates, no promo or preview UI, no overflow/runtime errors`);
  }
} finally { await browser.close(); }

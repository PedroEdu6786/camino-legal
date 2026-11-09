/** Local admin preview acceptance. No OAuth, live analytics queries, mail or external writes. */
import assert from 'node:assert/strict';
import { encode } from 'next-auth/jwt';
import nextEnv from '@next/env';
import { Browser } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

nextEnv.loadEnvConfig(process.cwd(), true);
const base = process.env.PROMOTION_TEST_URL || 'http://localhost:3000';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only');
const email = process.env.ANALYTICS_READER_EMAILS?.split(',')[0]?.trim();
if (!email || !process.env.AUTH_SECRET) throw new Error('Local reader auth must be configured');
const expiresAt = Date.now() + 60 * 60 * 1000;
const browser = await Browser.launch({ extraArgs: ['--disable-gpu'] });
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function wait(page, check) {
  for (let i = 0; i < 100; i++) {
    await page.send('Page.bringToFront');
    if (await page.eval(check)) return;
    await pause(100);
  }
  throw new Error(`UI did not settle: ${JSON.stringify(page.consoleErrors)}`);
}
async function admin(page) {
  await page.goto(`${base}/admin/analitica`);
  await wait(page, () => !!document.querySelector('[aria-label="Estado de la promoción para pruebas"]'));
  await page.eval(() => { document.querySelector('details').open = true; });
}
async function choose(page, label) {
  await page.eval(label => [...document.querySelectorAll('[aria-label="Estado de la promoción para pruebas"] button')].find(button => button.textContent === label).click(), label);
  await wait(page, () => !document.querySelector('[aria-label="Estado de la promoción para pruebas"] button:disabled'));
  assert.equal(await page.eval(label => [...document.querySelectorAll('[aria-label="Estado de la promoción para pruebas"] button')].find(button => button.textContent === label).getAttribute('aria-pressed'), label), 'true');
}
async function mockReports(page) {
  page.browser.on(page.sessionId, 'Fetch.requestPaused', event => {
    const body = { state: 'not_connected', message: 'Synthetic local UI test', metrics: {} };
    void page.send('Fetch.fulfillRequest', { requestId: event.requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify(body)).toString('base64') }).catch(error => {
      // Navigating away can cancel an intercepted report before the mock is delivered.
      if (!/Invalid InterceptionId|Session.*closed|Target closed/.test(error.message)) throw error;
    });
  });
  await page.send('Fetch.enable', { patterns: ['summary', 'insights'].map(report => ({ urlPattern: `*/api/admin/analytics/${report}*`, requestStage: 'Request' })) });
}
try {
  const guest = await browser.newPage({ width: 1440, height: 1000 });
  await guest.goto(`${base}/admin/analitica`);
  assert.equal(await guest.eval(() => location.pathname), '/admin/acceso');
  assert.equal(await guest.eval(() => !!document.querySelector('[aria-label="Estado de la promoción para pruebas"]')), false);
  await guest.goto(base+'/cotizaciones');
  await guest.eval(() => { sessionStorage.setItem('camino-promotion-preview', 'active'); });
  await guest.goto(base+'/cotizaciones');
  await wait(guest, () => sessionStorage.getItem('camino-promotion-preview') === null);
  assert.equal(await guest.eval(() => !!document.querySelector('aside[aria-label="Vista previa privada de promoción"]')), false);
  console.log('PASS unauthenticated stored preview cannot activate the offer');
  // A short-lived encrypted test session for the configured local allowlisted reader.
  // Credentials and cookie values stay in memory and are never printed or persisted.
  for (const name of ['authjs.session-token', '__Secure-authjs.session-token']) {
    const value = await encode({ secret: process.env.AUTH_SECRET, salt: name, maxAge: 3600, token: { sub: 'synthetic-promotion-preview-test', email, readerExpiresAt: expiresAt } });
    await guest.send('Network.setCookie', { name, value, url: name.startsWith('__Secure-') ? base.replace('http:', 'https:') : base, path: '/', httpOnly: true, secure: name.startsWith('__Secure-'), sameSite: 'Lax' });
  }
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ width, height: 1000 });
    await mockReports(page);
    await page.send('Page.addScriptToEvaluateOnNewDocument', { source: "localStorage.setItem('analytics-consent','denied');" });
    await admin(page);
    await choose(page, 'Promoción activa');
    assert.equal(await page.eval(() => sessionStorage.getItem('camino-promotion-preview')), 'active');
    if (width === 1440) {
      const independent = await browser.newPage({ width: 1440, height: 900 });
      await independent.goto(base);
      assert.equal(await independent.eval(() => sessionStorage.getItem('camino-promotion-preview')), null);
      assert.equal(await independent.eval(() => !!document.querySelector('aside[aria-label="Vista previa privada de promoción"]')), false);
    }
    assert.equal(await page.eval(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `/private/tmp/camino-promotion-admin-${width}.png`, format: 'png' });
    await page.eval(() => [...document.querySelectorAll('details a')].find(link => link.textContent.includes('Ver el sitio')).click());
    await wait(page, () => !!document.querySelector('aside[aria-label="Promoción de noviembre"]'));
    await wait(page, () => !!document.querySelector('aside[aria-label="Vista previa privada de promoción"]'));
    assert.equal(await page.eval(() => getComputedStyle(document.querySelector('aside[aria-label="Vista previa privada de promoción"]')).position), 'fixed');
    await wait(page, () => !!document.querySelector('dialog[open] #promotion-title'));
    await page.eval(() => document.querySelector('[aria-label="Cerrar promoción"]').click());
    await page.goto(`${base}/cotizaciones`);
    await wait(page, () => document.querySelector('.quote-total')?.textContent.includes('5,499'));
    await wait(page, () => !!document.querySelector('dialog[open] #promotion-title'));
    await page.eval(() => document.querySelector('[aria-label="Cerrar promoción"]').click());
    await admin(page);
    await choose(page, 'Próximamente');
    await page.goto(`${base}/cotizaciones`);
    await wait(page, () => !!document.querySelector('aside[aria-label="Próximamente en Camino Legal"]'));
    assert.match(await page.eval(() => document.querySelector('.quote-total').textContent), /5,899.77/);
    assert.equal(await page.eval(() => !!document.querySelector('#promotion-title')), false);
    assert.equal(await page.eval(() => !!document.querySelector('aside[aria-label="Vista previa privada de promoción"]')), true);
    await page.screenshot({ path: `/private/tmp/camino-private-preview-${width}.png`, format: 'png' });
    await admin(page);
    await choose(page, 'Sitio actual');
    assert.equal(await page.eval(() => sessionStorage.getItem('camino-promotion-preview')), null);
    assert.deepEqual(page.consoleErrors, []);
    console.log(`PASS ${width}: protected controls, active welcome/prices, teaser/regular prices, cross-document persistence, reset, no overflow or hydration errors`);
  }
  const clean = await browser.newPage({ width: 1440, height: 900 });
  await clean.goto(base);
  assert.equal(await clean.eval(() => sessionStorage.getItem('camino-promotion-preview')), null);
  assert.equal(await clean.eval(() => !!document.querySelector('aside[aria-label="Vista previa privada de promoción"]')), false);
  console.log('PASS independent tab keeps the current public site');
  await mockReports(clean);
  await admin(clean);
  await choose(clean, 'Promoción activa');
  await clean.goto(base+'/cotizaciones');
  await wait(clean, () => !!document.querySelector('aside[aria-label="Vista previa privada de promoción"]'));
  await wait(clean, () => !!document.querySelector('dialog[open] #promotion-title'));
  await clean.eval(() => document.querySelector('[aria-label="Cerrar promoción"]').click());
  await clean.send('Network.clearBrowserCookies');
  await clean.eval(() => window.dispatchEvent(new Event('focus')));
  await wait(clean, () => !document.querySelector('aside[aria-label="Vista previa privada de promoción"]'));
  await wait(clean, () => sessionStorage.getItem('camino-promotion-preview') === null);
  assert.match(await clean.eval(() => document.querySelector('.quote-total').textContent), /5,899.77/);
  console.log('PASS lost login immediately revokes preview on revalidation and restores regular prices');

} finally { await browser.close(); }

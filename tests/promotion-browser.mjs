/** Local UI checks only: no submissions or external messages. */
import assert from 'node:assert/strict';
import { Browser } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const browser = await Browser.launch({extraArgs:['--disable-gpu']});
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
// Start the dev server with NEXT_PUBLIC_PROMOTION_PREVIEW=off for date-boundary checks.
const base = process.env.PROMOTION_TEST_URL || 'http://localhost:3002';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('Local preview only');
async function wait(page, fn) {
  for (let i=0;i<100;i++) { await page.send('Page.bringToFront'); if(await page.eval(fn)) return; await pause(100); }
  throw new Error('UI did not settle: '+JSON.stringify({errors:page.consoleErrors, page:await page.eval(() => ({url:location.href, text:document.body.innerText.slice(0,500)}))}));
}
try {
  for (const width of [1440,768,390]) {
    const page = await browser.newPage({width,height:900});
    await page.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.campaignNow = Date.parse('2026-11-15T12:00:00-06:00'); Date.now = () => window.campaignNow; localStorage.setItem('analytics-consent','denied'); localStorage.removeItem('marca-noviembre-2026');`});
    await page.goto(base+'/cotizaciones');
    await wait(page, () => !!document.querySelector('#promotion-title'));
    await wait(page, () => !!document.querySelector('dialog[open]'));
    assert.equal(await page.eval(() => document.querySelector('dialog[open]').textContent.includes('$5,699')), true);
    assert.equal(await page.eval(() => document.activeElement.getAttribute('aria-label')), 'Cerrar promoción');
    assert.equal(await page.eval(() => document.querySelector('dialog').scrollWidth > document.querySelector('dialog').clientWidth),false);
    assert.deepEqual(page.consoleErrors, [], 'no hydration or runtime exceptions');
    await pause(350);
    await page.screenshot({path:`/private/tmp/camino-promotion-${width}.png`,format:'png'});
    await page.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await page.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await wait(page, () => !document.querySelector('dialog[open]'));
    assert.match(await page.eval(() => document.querySelector('.quote-total').textContent), /5,699/);
    assert.match(await page.eval(() => document.querySelector('.quote-evaluation-note').textContent), /499/);
    assert.match(await page.eval(() => decodeURIComponent(document.querySelector('.quote-whatsapp-button').href)), /5,699.*promoción/);
    await page.eval(() => document.querySelector('aside[aria-label="Promoción de noviembre"] button').click());
    await wait(page, () => !!document.querySelector('dialog[open]'));
    await page.eval(() => document.querySelector('[aria-label="Cerrar promoción"]').click());
    await page.eval(() => { window.campaignNow = Date.parse('2026-11-28T00:00:00-06:00'); });
    await wait(page, () => !document.querySelector('aside[aria-label="Promoción de noviembre"]'));
    assert.match(await page.eval(() => document.querySelector('.quote-total').textContent), /5,899.77/);
    assert.match(await page.eval(() => document.querySelector('.quote-evaluation-note').textContent), /799/);
    await page.eval(() => { window.campaignNow = Date.parse('2026-11-05T12:00:00-06:00'); });
    await wait(page, () => !!document.querySelector('aside[aria-label="Próximamente en Camino Legal"]'));
    assert.equal(await page.eval(() => !!document.querySelector('#promotion-title')), false);
    assert.equal(await page.eval(() => document.documentElement.scrollWidth > innerWidth),false);
    await page.screenshot({path:`/private/tmp/camino-promotion-teaser-${width}.png`,format:'png'});
    console.log(`PASS ${width}: welcome, focus, escape, replay, discounted quote, message, expiry, teaser, no overflow`);
  }
  const page = await browser.newPage({width:1440,height:900});
  await page.send('Page.addScriptToEvaluateOnNewDocument',{source:`Date.now = () => Date.parse('2026-11-15T12:00:00-06:00'); localStorage.setItem('analytics-consent','denied'); localStorage.setItem('marca-noviembre-2026','seen');`});
  for (const path of ['/','/servicios','/servicios/registro-de-marca','/nosotros','/preguntas','/contacto']) {
    await page.goto(base+path);
    await wait(page, () => !!document.querySelector('aside[aria-label="Promoción de noviembre"]'));
    await pause(1700);
    assert.equal(await page.eval(() => !!document.querySelector('#promotion-title')),false,'welcome stays dismissed across pages');
    if (path === '/') {
      assert.match(await page.eval(() => document.querySelector('#hero-section').textContent), /precios especiales/);
      assert.equal(await page.eval(() => !!document.querySelector('#hero-section a[href="/servicios"]')), true);
      assert.equal(await page.eval(() => !!document.querySelector('#hero-section a[href="/cotizaciones?servicio=registro-de-marca"]')), true);
      assert.equal(await page.eval(() => !!document.querySelector('#hero-section aside[aria-label="Promoción del 13 al 27 de noviembre de 2026"]')), true);
    }
    if (path === '/servicios') {
      assert.equal(await page.eval(() => document.querySelectorAll('.explorer-choices button').length), 6);
      assert.match(await page.eval(() => document.querySelector('.explorer-choices button').textContent), /En promoción/);
    }
    if (path === '/servicios/registro-de-marca') {
      assert.match(await page.eval(() => document.querySelector('.service-stage-price').textContent), /5,699/);
      assert.match(await page.eval(() => document.querySelector('#inversion').textContent), /499/);
      assert.match(await page.eval(() => document.querySelector('.service-stage-price del').textContent), /5,899.77/);
    }
    assert.deepEqual(page.consoleErrors, [], 'no hydration or runtime exceptions');
    console.log(`PASS campaign present on ${path}, welcome stays dismissed`);
  }
  await page.goto(base+'/admin/acceso');
  await pause(2000);
  assert.equal(await page.eval(() => !!document.querySelector('aside[aria-label="Promoción de noviembre"], #promotion-title')),false);
  console.log('PASS admin excluded');
} finally { await browser.close(); }

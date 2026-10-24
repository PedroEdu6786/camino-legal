import assert from 'node:assert/strict';
import { Browser } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
const browser = await Browser.launch({extraArgs:['--disable-gpu']});
try {
  const page = await browser.newPage({width:1440,height:900});
  const warnings = [];
  browser.on(page.sessionId, 'Runtime.consoleAPICalled', event => {
    const message = event.args.map(arg => arg.value || arg.description || '').join(' ');
    if (/Encountered a script tag|hydration|did not match/i.test(message)) warnings.push(message);
  });
  await page.goto('http://localhost:3002/contacto');
  assert.ok(await page.eval(() => getComputedStyle(document.querySelector('#name')).backgroundColor.includes('0.25')));
  await page.eval(() => localStorage.setItem('theme', 'dark'));
  await page.goto('http://localhost:3002/contacto');
  assert.equal(await page.eval(() => document.documentElement.classList.contains('dark')), true);
  await page.goto('http://localhost:3002/contacto?preview=custom&surface=%23abcdef');
  assert.equal(await page.eval(() => document.documentElement.style.getPropertyValue('--lab-surface')), '#abcdef');
  assert.equal(await page.eval(() => document.documentElement.classList.contains('dark')), false);
  await page.goto('http://localhost:3002/contacto');
  assert.equal(await page.eval(() => document.documentElement.style.getPropertyValue('--lab-surface')), '#abcdef');
  await page.eval(() => localStorage.removeItem('theme'));
  await page.goto('http://localhost:3002/contacto?preview=original');
  assert.equal(await page.eval(() => document.documentElement.style.getPropertyValue('--lab-surface')), '');
  await page.eval(() => document.querySelector('#contact form').scrollIntoView({block:'center',behavior:'instant'}));
  await page.screenshot({path:'/private/tmp/camino-contact-translucent.png',format:'png'});
  await page.eval(() => document.querySelector('a[href="/servicios"]').click());
  await new Promise(resolve => setTimeout(resolve, 1200));
  assert.deepEqual(warnings, []);
  assert.deepEqual(page.consoleErrors, []);
  console.log('PASS theme startup, saved previews, reset, translucent fields, and no script/hydration warnings');
  await page.close();
} finally { await browser.close(); }

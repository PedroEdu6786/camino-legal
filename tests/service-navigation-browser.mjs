import assert from 'node:assert/strict';
import { Browser } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';

const browser = await Browser.launch({ extraArgs: ['--disable-gpu'] });
let focusTimer;
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ width, height: 900 });
    focusTimer = setInterval(() => { void page.send('Page.bringToFront').catch(() => {}); }, 100);
    for (const origin of ['/', '/servicios']) {
      await page.goto(`http://localhost:3002${origin}`);
      const target = await page.eval(() => {
        const link = document.querySelector('main a[href^="/servicios/"]');
        link.scrollIntoView({ block: 'center', behavior: 'instant' });
        return link.getAttribute('href');
      });
      assert.ok(await page.eval(() => window.scrollY > 0), 'Start from a scrolled page');
      await page.eval(() => document.querySelector('main a[href^="/servicios/"]').click());
      for (let attempt = 0; attempt < 100; attempt++) {
        if (await page.eval(path => location.pathname === path, target)) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      await new Promise(resolve => setTimeout(resolve, 600));
      assert.equal(await page.eval(() => location.pathname), target);
      assert.equal(await page.eval(() => window.scrollY), 0, `${width}px ${origin} must arrive at the top`);
      console.log(`PASS ${width}px: ${origin} → ${target} at scrollY=0`);
    }
    clearInterval(focusTimer);
    await page.close();
  }
} finally {
  clearInterval(focusTimer);
  await browser.close();
}

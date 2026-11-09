import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Browser } from '../.agents/skills/design-taste-frontend/scripts/lib/cdp.mjs';
import { serviceQuotes } from '../app/lib/serviceQuotes.ts';

// Run against a local dev or production server; never submits forms or grants analytics consent.
const base = process.env.SERVICE_LAYOUT_TEST_URL || 'http://localhost:3000';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(base).hostname));
const screenshots = await mkdtemp(join(tmpdir(), 'camino-service-layout-'));
const browser = await Browser.launch();
const normalize = text => text.replace(/\s+/g, ' ').trim();

async function inspectSection(page, selector) {
  return page.eval(selector => {
    const section = document.querySelector(selector);
    if (!section) throw new Error(`Missing section: ${selector}`);
    return {
      count: document.querySelectorAll(selector).length,
      text: section.textContent,
      heading: document.getElementById(section.getAttribute('aria-labelledby'))?.textContent,
      overflow: document.documentElement.scrollWidth > innerWidth,
      clipped: [...section.querySelectorAll('h2, h3, p, dt, dd')].some(element => {
        const rect = element.getBoundingClientRect();
        return rect.left < 0 || rect.right > innerWidth || element.scrollWidth > element.clientWidth + 1;
      }),
      steps: [...section.querySelectorAll('ol > li')].map(step => ({
        title: step.querySelector('h3')?.textContent,
        text: step.textContent,
      })),
    };
  }, selector);
}

async function capture(page, selector, filename) {
  await page.eval(selector => {
    [...document.querySelectorAll('button')].find(button => button.textContent.trim() === 'Rechazar')?.click();
    const top = document.querySelector(selector).getBoundingClientRect().top + scrollY;
    scrollTo({ top: top - 110, behavior: 'instant' });
  }, selector);
  await page.screenshot({ path: join(screenshots, filename) });
}

try {
  for (const width of [320, 390, 768, 1440]) {
    const page = await browser.newPage({ width, height: 1200, reducedMotion: true });
    try {
      for (const [slug, quote] of Object.entries(serviceQuotes)) {
        await page.goto(`${base}/servicios/${slug}`, { settleMs: 500 });
        const result = await inspectSection(page, '#proceso');
        assert.equal(result.count, 1);
        assert.equal(result.heading, 'El proceso');
        assert.equal(result.overflow, false, `${slug} page overflow at ${width}px`);
        assert.equal(result.clipped, false, `${slug} clipped process text at ${width}px`);
        assert.deepEqual(result.steps.map(step => step.title), quote.stages.map(stage => stage.title));
        quote.stages.forEach((stage, index) => {
          for (const value of [stage.timing, stage.price, stage.description].filter(Boolean)) {
            assert.ok(normalize(result.steps[index].text).includes(normalize(value)), `${slug}: missing ${value}`);
          }
        });
        if (slug === 'contratos-y-convenios') await capture(page, '#proceso', `process-${width}.jpg`);
        console.log(`PASS ${width}px ${slug}: every stage, timing, price and description; no clipping`);
      }
      await page.goto(`${base}/cotizaciones`, { settleMs: 500 });
      const selector = '[data-analytics-section="before_start"]';
      const result = await inspectSection(page, selector);
      assert.equal(result.count, 1);
      assert.equal(result.heading, 'Antes de comenzar');
      assert.equal(result.overflow, false);
      assert.equal(result.clipped, false);
      for (const text of ['cinco días hábiles posteriores al pago', 'antes del cierre de mes', 'incluyen IVA', 'requerimientos, multas o recargos', 'Alcance por escrito']) {
        assert.ok(normalize(result.text).includes(text), `Missing condition: ${text}`);
      }
      assert.ok(await page.eval(() => document.querySelector('[data-analytics-section="before_start"]').getBoundingClientRect().top >= document.querySelector('[data-analytics-section="quotation"]').getBoundingClientRect().bottom));
      await capture(page, selector, `before-start-${width}.jpg`);
      console.log(`PASS ${width}px cotizaciones: visible conditions below calculator; no clipping`);
    } finally {
      await page.close();
    }
  }
  console.log(`Screenshots: ${screenshots}`);
} finally {
  await browser.close();
}

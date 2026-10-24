import test from 'node:test';
import { execFileSync } from 'node:child_process';

for (const reviewed of ['true', 'false']) {
  test(`GA collection switch disables cookieless measurement before revocation (reviewed=${reviewed})`, () => {
    const moduleUrl = new URL('../app/lib/analytics.ts', import.meta.url).href;
    const script = `
      import assert from 'node:assert/strict';
      globalThis.window = new EventTarget();
      window.location = new URL('https://caminolegal.com.mx/');
      globalThis.document = { referrer: '' };
      globalThis.localStorage = { getItem: () => null, setItem: () => {} };
      window.gtag = (...args) => {
        if (args[0] === 'consent' && args[2]?.analytics_storage === 'denied') {
          assert.equal(window['ga-disable-G-TEST123'], true, 'disable flag must precede SDK consent update');
        }
      };
      const runtime = await import(${JSON.stringify(moduleUrl)});
      runtime.configureProviders({ ga4: true, meta: false });
      assert.equal(window['ga-disable-G-TEST123'], true);
      runtime.setConsent('granted');
      assert.equal(window['ga-disable-G-TEST123'], ${reviewed !== 'true'});
      runtime.configureProviders({ ga4: false, meta: false });
      assert.equal(window['ga-disable-G-TEST123'], true);
      runtime.configureProviders({ ga4: true, meta: false });
      assert.equal(window['ga-disable-G-TEST123'], ${reviewed !== 'true'});
      runtime.setConsent('denied');
      assert.equal(window['ga-disable-G-TEST123'], true);
    `;
    execFileSync(process.execPath, ['--input-type=module', '-e', script], {
      env: { ...process.env, NEXT_PUBLIC_GA4_ID: 'G-TEST123', NEXT_PUBLIC_ANALYTICS_PROVIDERS_REVIEWED: reviewed },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  });
}

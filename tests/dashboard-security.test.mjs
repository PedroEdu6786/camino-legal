import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createGoogleAccess } from '../app/lib/server/dashboard/googleAccess.ts';

test('Google credentials cannot be sent to arbitrary hosts or redirected destinations', async () => {
  let calls = 0;
  const access = createGoogleAccess({ fetcher: async (url, options) => {
    calls++;
    assert.equal(options.redirect, 'error');
    assert.equal(options.cache, 'no-store');
    assert.ok(options.signal instanceof AbortSignal);
    return new Response('{}');
  } });
  for (const url of ['http://oauth2.googleapis.com/token', 'https://attacker.invalid', 'https://oauth2.googleapis.com.attacker.invalid/token', 'https://name:password@oauth2.googleapis.com/token', 'https://oauth2.googleapis.com:444/token', 'http://169.254.169.254/']) {
    await assert.rejects(access.request(url, {}));
  }
  assert.equal(calls, 0);
  await access.request('https://oauth2.googleapis.com/token', {});
  await access.request('https://analyticsdata.googleapis.com/v1beta/properties/123:runReport', {});
  assert.equal(calls, 2);
});

test('versionable files contain no Google private keys or downloaded credential payloads', () => {
  const paths = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
  const forbidden = [/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/, /"type"\s*:\s*"service_account"\s*,/, /"client_secret"\s*:\s*"GOCSPX-/];
  for (const path of paths) {
    if (!/\.(?:json|[cm]?[jt]sx?|md|ya?ml|txt)$/.test(path)) continue;
    const content = readFileSync(path, 'utf8');
    for (const pattern of forbidden) assert.equal(pattern.test(content), false, `Possible credential in ${path}; value withheld`);
  }
  for (const path of ['.env.local', 'client_secret_example.json', 'camino-legal-analytics-example.json']) {
    execFileSync('git', ['check-ignore', '-q', path]);
  }
});

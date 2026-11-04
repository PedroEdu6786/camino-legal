/** Actual Next.js boundaries with synthetic encrypted sessions; no live OAuth or GA4 calls. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { encode } from 'next-auth/jwt';

const port = Number(process.env.AUTH_TEST_PORT ?? 3068);
const origin = `http://127.0.0.1:${port}`;
const canonical = 'https://caminolegal.com.mx';
const secret = 'synthetic-runtime-session-secret-at-least-32-bytes';
const cookieName = '__Secure-authjs.session-token';
const env = {
  ...process.env, NODE_ENV: 'production', AUTH_URL: canonical, AUTH_SECRET: secret,
  AUTH_GOOGLE_ID: 'synthetic-client', AUTH_GOOGLE_SECRET: 'synthetic-secret', ANALYTICS_READER_EMAILS: 'reader@example.test',
  GOOGLE_ANALYTICS_ACCESS_TOKEN: '', GOOGLE_ANALYTICS_CREDENTIALS_JSON: '',
  GOOGLE_ANALYTICS_PROPERTY_ID: '123456', GOOGLE_ANALYTICS_STREAM_ID: '789012', GOOGLE_ANALYTICS_TIME_ZONE: 'UTC',
  NEXT_PUBLIC_GA4_ID: 'G-SYNTHETIC', NEXT_PUBLIC_META_PIXEL_ID: '',
};
let server;
let output = '';
async function start(overrides = {}) {
  output = '';
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], { env: { ...env, ...overrides }, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', chunk => { output += chunk; });
  server.stderr.on('data', chunk => { output += chunk; });
  for (let attempt = 0; attempt < 150; attempt++) {
    if (server.exitCode !== null) throw new Error(`Test server exited: ${output}`);
    try { await fetch(`${origin}/api/admin/analytics/session`); return; } catch { await new Promise(resolve => setTimeout(resolve, 200)); }
  }
  throw new Error('Test server did not become ready.');
}
async function stop() {
  if (!server || server.exitCode !== null) return;
  const exit = once(server, 'exit'); server.kill('SIGTERM'); await exit;
}
async function cookie(email = 'reader@example.test', expiresAt = Date.now() + 60_000, maxAge = 3600) {
  return `${cookieName}=${await encode({ secret, salt: cookieName, maxAge, token: { sub: 'synthetic-google-subject', email, readerExpiresAt: expiresAt } })}`;
}
const request = (path, value, options = {}) => fetch(`${origin}${path}`, { redirect: 'manual', ...options, headers: { ...(value ? { cookie: value } : {}), ...options.headers } });

try {
  await start();
  const valid = await cookie();
  for (const path of ['/api/admin/analytics/summary?days=7', '/api/admin/analytics/insights?days=7', '/api/admin/analytics/session']) {
    for (const [value, status] of [[undefined, 401], ['__Secure-authjs.session-token=tampered', 401], [await cookie('outsider@example.test'), 403], [await cookie('reader@example.test', Date.now() - 1000), 401], [await cookie('reader@example.test', Date.now() + 60_000, -60), 401]]) {
      const response = await request(path, value);
      assert.equal(response.status, status, `${path}: expected ${status}`);
      assert.equal(response.headers.get('cache-control'), 'private, no-store');
      const body = await response.json();
      assert.deepEqual(Object.keys(body), ['error']);
    }
    const response = await request(path, valid);
    assert.equal(response.status, 200, path);
    const body = await response.json();
    if (!path.endsWith('session')) assert.equal(body.state, 'not_connected');
  }
  const deniedPage = await request('/admin/analitica');
  assert.equal(deniedPage.status, 307);
  assert.match(deniedPage.headers.get('location'), /^\/admin\/acceso\?reason=expired$/);
  assert.ok(!((await deniedPage.text()).includes('G-SYNTHETIC')));
  const allowedPage = await request('/admin/analitica', valid);
  assert.equal(allowedPage.status, 200);
  assert.match(allowedPage.headers.get('cache-control'), /private.*no-store/);
  const html = await allowedPage.text();
  assert.match(html, /Cerrar sesión/);
  assert.match(html, /G-SYNTHETIC/);
  for (const value of [secret, 'synthetic-secret', 'synthetic-client']) assert.ok(!html.includes(value));
  const login = await request('/admin/acceso');
  assert.equal(login.status, 200);
  assert.match(await login.text(), /Continuar con Google/);

  if (process.env.AUTH_TEST_INSPECT === '1') {
    const inspect = spawn(process.execPath, ['.agents/skills/design-taste-frontend/scripts/inspect.mjs', `${origin}/admin/acceso`, '--app', '--out', '/private/tmp/camino-auth-inspect'], { stdio: 'inherit' });
    const [code] = await once(inspect, 'exit');
    assert.equal(code, 0, 'Sign-in screen visual inspection');
  }

  for (const path of ['/admin/acceso', '/admin/analitica', '/api/admin/analytics/session', '/api/auth/csrf']) {
    const response = await request(path, valid);
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
    assert.equal(response.headers.get('access-control-allow-origin'), null);
  }
  // Missing CSRF must not initiate OAuth or clear an authenticated session.
  for (const action of ['signin/google', 'signout']) {
    const denied = await request(`/api/auth/${action}`, valid, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://attacker.invalid' },
      body: new URLSearchParams({ callbackUrl: 'https://attacker.invalid' }),
    });
    assert.ok(!String(denied.headers.get('location')).startsWith('https://accounts.google.com'));
    assert.ok(!denied.headers.getSetCookie().some(value => value.startsWith(`${cookieName}=`) && /Max-Age=0/.test(value)));
  }
  const forgedCallback = await request('/api/auth/callback/google?code=forged&state=forged');
  assert.ok(!forgedCallback.headers.getSetCookie().some(value => value.startsWith(`${cookieName}=`) && !/Max-Age=0/.test(value)));
  const poisoned = await request('/api/auth/providers', undefined, { headers: { 'X-Forwarded-Host': 'attacker.invalid', 'X-Forwarded-Proto': 'http' } });
  const providers = await poisoned.json();
  assert.equal(providers.google.callbackUrl, `${canonical}/api/auth/callback/google`);
  assert.equal((await request('/api/admin/analytics/summary', valid, { method: 'POST' })).status, 405);

  const csrfResponse = await request('/api/auth/csrf', valid);
  const { csrfToken } = await csrfResponse.json();
  for (const value of csrfResponse.headers.getSetCookie()) {
    assert.match(value, /HttpOnly/i); assert.match(value, /Secure/i); assert.match(value, /SameSite=lax/i);
  }
  const csrfCookies = csrfResponse.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
  const logout = await request('/api/auth/signout', `${valid}; ${csrfCookies}`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: canonical },
    body: new URLSearchParams({ csrfToken, callbackUrl: '/admin/acceso' }),
  });
  assert.equal(logout.status, 302);
  assert.equal(logout.headers.get('location'), `${canonical}/admin/acceso`);
  assert.ok(logout.headers.getSetCookie().some(value => value.startsWith(`${cookieName}=`) && /Max-Age=0/.test(value)));
  const afterLogout = await request('/api/admin/analytics/session');
  assert.equal(afterLogout.status, 401);

  await stop();
  await start({ AUTH_GOOGLE_SECRET: '' });
  const unavailable = await request('/api/admin/analytics/summary', valid);
  assert.equal(unavailable.status, 503);
  assert.match((await request('/admin/analitica', valid)).headers.get('location'), /reason=unavailable/);
  const unavailableLogin = await request('/admin/acceso');
  assert.ok(!((await unavailableLogin.text()).includes('Continuar con Google')));
  console.log('PASS: actual Next.js page/API access, synthetic encrypted sessions, private caching, logout and missing configuration. No live OAuth/GA4 calls.');
} finally { await stop(); }

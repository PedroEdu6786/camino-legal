import test from 'node:test';
import assert from 'node:assert/strict';
import { encode, decode } from 'next-auth/jwt';
import { readerAuthConfig } from '../app/lib/server/dashboard/readerAuthConfig.ts';
import { allowedReader, evaluateReader, readerAuthReady, readerOrigin, READER_SESSION_SECONDS } from '../app/lib/server/dashboard/readerPolicy.ts';
import { protectedReport } from '../app/lib/server/dashboard/protectedReport.ts';

const env = {
  NODE_ENV: 'test', AUTH_URL: 'https://analytics.example.test', AUTH_SECRET: 'synthetic-only-secret-with-at-least-32-bytes',
  AUTH_GOOGLE_ID: 'synthetic-client', AUTH_GOOGLE_SECRET: 'synthetic-google-secret', ANALYTICS_READER_EMAILS: 'Reader@example.test, other@example.test',
};
const now = Date.now();
const reader = { email: 'reader@example.test', subject: 'google-subject', expiresAt: now + 60_000 };

test('reader configuration fails closed and only permits exact normalized email matches', () => {
  for (const key of ['AUTH_URL', 'AUTH_SECRET', 'AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET', 'ANALYTICS_READER_EMAILS']) {
    assert.equal(readerAuthReady({ ...env, [key]: '' }), false);
    assert.equal(evaluateReader({ reader }, { ...env, [key]: '' }, now).status, 503);
  }
  for (const email of [null, '', 'someone@example.test', 'reader@example.test.attacker.test', '@example.test']) assert.equal(allowedReader(email, env), false);
  assert.equal(allowedReader(' READER@EXAMPLE.TEST ', env), true);
  for (const origin of ['https://name:password@example.test', 'https://example.test/path', 'https://example.test?redirect=x', 'http://example.test']) assert.equal(readerOrigin({ ...env, AUTH_URL: origin }), null);
  assert.equal(readerOrigin({ ...env, AUTH_URL: 'http://localhost:3000' }), 'http://localhost:3000');
  assert.equal(readerOrigin({ ...env, NODE_ENV: 'production', AUTH_URL: 'http://localhost:3000' }), null);
});

test('Google login requires a verified, allowlisted identity', async () => {
  const { signIn } = readerAuthConfig(env).callbacks;
  const login = { account: { provider: 'google' }, profile: { sub: reader.subject, email: reader.email, email_verified: true } };
  assert.equal(await signIn(login), true);
  for (const value of [false, undefined, 'true']) assert.equal(await signIn({ ...login, profile: { ...login.profile, email_verified: value } }), false);
  assert.equal(await signIn({ ...login, account: { provider: 'github' } }), false);
  assert.equal(await signIn({ ...login, profile: { ...login.profile, email: 'outsider@example.test' } }), false);
});

test('session identity excludes provider tokens; client updates never extend absolute expiry or replace identity', async () => {
  const config = readerAuthConfig(env);
  const token = await config.callbacks.jwt({ token: {}, account: { provider: 'google', access_token: 'private-access-token', refresh_token: 'private-refresh-token' }, profile: { sub: reader.subject, email: reader.email, email_verified: true } });
  assert.ok(token.readerExpiresAt <= Date.now() + READER_SESSION_SECONDS * 1000);
  assert.ok(!JSON.stringify(token).includes('private-'));
  assert.deepEqual(await config.callbacks.jwt({ token, trigger: 'update', session: { email: 'attacker@example.test', readerExpiresAt: Infinity } }), token);
  assert.equal(await config.callbacks.jwt({ token: { ...token, readerExpiresAt: now - 1 } }), null);
  const session = await config.callbacks.session({ session: { user: {}, expires: new Date(token.readerExpiresAt).toISOString() }, token });
  assert.equal(evaluateReader(session, env).status, 200);
  assert.equal(evaluateReader(session, { ...env, ANALYTICS_READER_EMAILS: 'other@example.test' }).status, 403);
});

test('missing, expired and malformed sessions deny access; removing an email revokes existing sessions', () => {
  for (const session of [null, {}, { reader: { ...reader, subject: '' } }, { reader: { ...reader, expiresAt: now } }, { reader: { ...reader, expiresAt: Infinity } }]) assert.equal(evaluateReader(session, env, now).status, 401);
  assert.equal(evaluateReader({ reader }, env, now).status, 200);
  assert.equal(evaluateReader({ reader }, { ...env, ANALYTICS_READER_EMAILS: 'other@example.test' }, now).status, 403);
});

test('auth-library encrypted cookies reject tampering, wrong secrets and expired tokens', async () => {
  const options = { secret: env.AUTH_SECRET, salt: 'authjs.session-token' };
  const token = { sub: reader.subject, email: reader.email, readerExpiresAt: reader.expiresAt };
  const cookie = await encode({ ...options, token });
  const decoded = await decode({ ...options, token: cookie });
  assert.equal(decoded.sub, reader.subject);
  await assert.rejects(decode({ ...options, token: `${cookie.slice(0, -8)}tampered` }));
  await assert.rejects(decode({ ...options, secret: 'a-different-synthetic-secret', token: cookie }));
  const expired = await encode({ ...options, token, maxAge: -60 });
  await assert.rejects(decode({ ...options, token: expired }));
});

test('denied reporting requests never invoke the reader, including malformed queries and cache hits', async () => {
  let calls = 0;
  const read = async () => { calls++; return { businessData: true }; };
  for (const status of [401, 403, 503]) {
    const handler = protectedReport(read, async () => ({ status }));
    for (const query of ['days=7', 'days=7&days=28', 'unexpected=true']) {
      const response = await handler(new Request(`https://example.test/report?${query}`));
      assert.equal(response.status, status);
      assert.equal(response.headers.get('cache-control'), 'private, no-store');
      assert.ok(!JSON.stringify(await response.json()).includes('businessData'));
    }
  }
  assert.equal(calls, 0);
  const handler = protectedReport(read, async () => ({ status: 200, reader }));
  assert.equal((await handler(new Request('https://example.test/report?days=7'))).status, 200);
  assert.equal(calls, 1);
  assert.equal((await handler(new Request('https://example.test/report?days=7&days=28'))).status, 400);
  assert.equal(calls, 1);
});

test('redirects only return fixed admin destinations on the configured origin', async () => {
  const { redirect } = readerAuthConfig(env).callbacks;
  for (const url of ['https://attacker.test/', '//attacker.test/admin/acceso', '/contacto', '/admin/analitica?secret=x', 'http://[', 'javascript:alert(1)', 'https://analytics.example.test.attacker.test/admin/acceso']) assert.equal(await redirect({ url }), `${env.AUTH_URL}/admin/analitica`);
  assert.equal(await redirect({ url: '/admin/acceso' }), `${env.AUTH_URL}/admin/acceso`);
});


test('malformed expiry and Google subjects cannot create or refresh a session', async () => {
  const { jwt } = readerAuthConfig(env).callbacks;
  for (const readerExpiresAt of [NaN, Infinity, Date.now() + 9 * 60 * 60 * 1000]) {
    assert.equal(await jwt({ token: { sub: reader.subject, email: reader.email, readerExpiresAt } }), null);
  }
  for (const sub of [null, '', 123, {}]) {
    assert.equal(await jwt({ token: {}, account: { provider: 'google' }, profile: { sub, email: reader.email, email_verified: true } }), null);
  }
});

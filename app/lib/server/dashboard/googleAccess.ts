import { createHash, createSign } from 'node:crypto';

export const COOLDOWN = 15 * 60_000;
export const REQUEST_TIMEOUT = 15_000;
export const WINDOW_BUDGET = 8; // distinct provider calls per resource per cooldown window
export type AccessOptions = { env?: Record<string, string | undefined>; fetcher?: typeof fetch; now?: () => Date };

/** Server-only Google access: bounded fetch plus the official read-only service-account token exchange. */
export function createGoogleAccess(options: AccessOptions = {}) {
  const fetcher = options.fetcher ?? fetch;
  const now = options.now ?? (() => new Date());
  let tokenCache: { key: string; token: string; expires: number } | null = null;
  async function request(url: string, init: RequestInit): Promise<Response> {
    const destination = new URL(url);
    if (destination.protocol !== 'https:' || destination.username || destination.password || destination.port ||
      !['oauth2.googleapis.com', 'analyticsdata.googleapis.com'].includes(destination.hostname)) throw new Error('destination');
    return fetcher(url, { ...init, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT) });
  }
  async function token(env: Record<string, string | undefined>): Promise<string> {
    if (env.GOOGLE_ANALYTICS_ACCESS_TOKEN) return env.GOOGLE_ANALYTICS_ACCESS_TOKEN;
    const raw = env.GOOGLE_ANALYTICS_CREDENTIALS_JSON!;
    const key = createHash('sha256').update(raw).digest('hex');
    if (tokenCache?.key === key && tokenCache.expires > now().getTime() + 60_000) return tokenCache.token;
    const credentials = JSON.parse(raw) as { client_email?: unknown; private_key?: unknown; type?: unknown };
    if (credentials.type !== 'service_account' || typeof credentials.client_email !== 'string' || typeof credentials.private_key !== 'string') throw new Error('credentials');
    const timestamp = Math.floor(now().getTime() / 1000);
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
    const assertion = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ iss: credentials.client_email, scope: 'https://www.googleapis.com/auth/analytics.readonly', aud: 'https://oauth2.googleapis.com/token', iat: timestamp, exp: timestamp + 3600 })}`;
    const signature = createSign('RSA-SHA256').update(assertion).sign(credentials.private_key, 'base64url');
    const response = await request('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${assertion}.${signature}` }) });
    if (!response.ok) throw new Error('credentials');
    const body = await response.json() as { access_token?: unknown; expires_in?: unknown };
    if (typeof body.access_token !== 'string' || typeof body.expires_in !== 'number' || body.expires_in <= 0) throw new Error('credentials');
    tokenCache = { key, token: body.access_token, expires: now().getTime() + Math.min(body.expires_in, 3600) * 1000 };
    return tokenCache.token;
  }
  return { now, request, token };
}

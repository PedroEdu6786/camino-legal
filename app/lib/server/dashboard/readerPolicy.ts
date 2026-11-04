export const READER_SESSION_SECONDS = 8 * 60 * 60;
export const READER_CACHE_HEADERS = { 'Cache-Control': 'private, no-store' };

type Environment = Record<string, string | undefined>;
export type ReaderIdentity = { email: string; subject: string; expiresAt: number };
export type ReaderAccess = { status: 200; reader: ReaderIdentity } | { status: 401 | 403 | 503 };

export function readerOrigin(env: Environment): string | null {
  try {
    const url = new URL(env.AUTH_URL ?? '');
    const local = env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(url.hostname);
    return (url.protocol === 'https:' || (local && url.protocol === 'http:')) &&
      !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash ? url.origin : null;
  } catch { return null; }
}

export function allowedReader(email: unknown, env: Environment): email is string {
  if (typeof email !== 'string' || !email.trim()) return false;
  const allowed = (env.ANALYTICS_READER_EMAILS ?? '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export function readerAuthReady(env: Environment): boolean {
  return Boolean(readerOrigin(env) && env.AUTH_GOOGLE_ID?.trim() && env.AUTH_GOOGLE_SECRET?.trim() &&
    env.AUTH_SECRET && Buffer.byteLength(env.AUTH_SECRET) >= 32 && env.ANALYTICS_READER_EMAILS?.trim());
}

/** Only pass a session verified by the auth library; never accept client claims. */
export function evaluateReader(session: unknown, env: Environment, now = Date.now()): ReaderAccess {
  if (!readerAuthReady(env)) return { status: 503 };
  const reader = (session as { reader?: Partial<ReaderIdentity> } | null)?.reader;
  if (!reader || typeof reader.email !== 'string' || typeof reader.subject !== 'string' || !reader.subject ||
    typeof reader.expiresAt !== 'number' || !Number.isFinite(reader.expiresAt) || reader.expiresAt <= now ||
    reader.expiresAt > now + READER_SESSION_SECONDS * 1000) return { status: 401 };
  if (!allowedReader(reader.email, env)) return { status: 403 };
  return { status: 200, reader: reader as ReaderIdentity };
}

export function readerDenied(status: 401 | 403 | 503): Response {
  const messages = {
    401: 'Tu sesión ha terminado. Inicia sesión para continuar.',
    403: 'Esta cuenta no tiene acceso a la analítica.',
    503: 'El acceso a la analítica no está configurado.',
  };
  return Response.json({ error: messages[status] }, { status, headers: READER_CACHE_HEADERS });
}

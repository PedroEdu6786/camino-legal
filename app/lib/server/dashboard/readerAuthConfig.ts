import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';
import { allowedReader, readerAuthReady, readerOrigin, READER_SESSION_SECONDS } from './readerPolicy.ts';

export function readerAuthConfig(env: Record<string, string | undefined>): NextAuthConfig {
  return {
    secret: env.AUTH_SECRET,
    trustHost: true, // AUTH_URL pins all redirects to the configured canonical origin.
    providers: [Google({ clientId: env.AUTH_GOOGLE_ID, clientSecret: env.AUTH_GOOGLE_SECRET, authorization: { params: { scope: 'openid email', prompt: 'select_account' } } })],
    session: { strategy: 'jwt', maxAge: READER_SESSION_SECONDS },
    pages: { signIn: '/admin/acceso', error: '/admin/acceso' },
    callbacks: {
      signIn({ account, profile }) {
        return readerAuthReady(env) && account?.provider === 'google' && profile?.email_verified === true &&
          typeof profile.sub === 'string' && Boolean(profile.sub) && allowedReader(profile.email, env);
      },
      jwt({ token, account, profile }) {
        if (account) {
          if (!readerAuthReady(env) || account.provider !== 'google' || profile?.email_verified !== true || typeof profile.sub !== 'string' || !profile.sub || !allowedReader(profile.email, env)) return null;
          // Retain identity only, never the Google OAuth access/refresh tokens.
          return { sub: profile.sub, email: profile.email, readerExpiresAt: Date.now() + READER_SESSION_SECONDS * 1000 };
        }
        if (typeof token.readerExpiresAt !== 'number' || !Number.isFinite(token.readerExpiresAt) ||
          token.readerExpiresAt <= Date.now() || token.readerExpiresAt > Date.now() + READER_SESSION_SECONDS * 1000) return null;
        return token; // Client session updates cannot change identity or extend the absolute expiry.
      },
      session({ session, token }) {
        session.reader = typeof token.email === 'string' && typeof token.sub === 'string' && typeof token.readerExpiresAt === 'number'
          ? { email: token.email, subject: token.sub, expiresAt: token.readerExpiresAt } : undefined;
        session.user.email = token.email ?? '';
        session.user.name = null;
        session.user.image = null;
        return session;
      },
      redirect({ url }) {
        const origin = readerOrigin(env);
        if (!origin) return '/admin/acceso';
        // No arbitrary callback URLs, including protocol-relative external destinations.
        try {
          const destination = new URL(url, origin);
          return destination.origin === origin && destination.pathname === '/admin/acceso'
            ? `${origin}/admin/acceso` : `${origin}/admin/analitica`;
        } catch { return `${origin}/admin/analitica`; }
      },
    },
    logger: { error() { console.error('[analytics-auth] Authentication failed.'); } },
  };
}

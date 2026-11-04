import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getReaderAccess } from '../../lib/server/dashboard/readerAccess';
import { readerAuthReady } from '../../lib/server/dashboard/readerPolicy';
import { loginReader, logoutReader } from './actions';
import styles from './page.module.css';

/* eslint-disable @next/next/no-html-link-for-pages -- A fresh document isolates public marketing SDKs from admin pages. */

export const metadata: Metadata = { title: 'Acceso a analítica | Camino Legal', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function ReaderLogin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const ready = readerAuthReady(process.env);
  const access = await getReaderAccess();
  if (access.status === 200) redirect('/admin/analitica');
  const denied = params.error === 'AccessDenied' || params.reason === 'denied' || access.status === 403;
  const message = !ready || access.status === 503
    ? 'El acceso a la analítica no está disponible. Contacta a la persona que administra el sitio.'
    : denied ? 'Esta cuenta no tiene acceso. Usa una cuenta autorizada o solicita acceso a la persona que administra el sitio.'
    : params.reason === 'expired' ? 'Tu sesión terminó. Inicia sesión de nuevo para continuar.'
    : params.error ? 'No fue posible iniciar sesión. Inténtalo de nuevo.' : null;
  return <main className={styles.page}>
    <section className={styles.panel} aria-labelledby="reader-login-title">
      <span className={styles.brand}>camino legal®</span>
      <h1 id="reader-login-title">Analítica del sitio</h1>
      <p>Consulta el rendimiento del sitio con tu cuenta autorizada.</p>
      {message && <p className={styles.message} role="status">{message}</p>}
      {ready && <form action={loginReader}><button type="submit">Continuar con Google</button></form>}
      {access.status === 403 && <form action={logoutReader}><button className={styles.secondary} type="submit">Cerrar sesión de esta cuenta</button></form>}
      <a href="/">Volver al sitio</a>
    </section>
  </main>;
}

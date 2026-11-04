'use server';

import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';
import { signIn, signOut } from '../../../auth';
import { readerAuthReady } from '../../lib/server/dashboard/readerPolicy';

export async function loginReader() {
  if (!readerAuthReady(process.env)) redirect('/admin/acceso?reason=unavailable');
  try { await signIn('google', { redirectTo: '/admin/analitica' }); }
  catch (error) {
    if (error instanceof AuthError) redirect('/admin/acceso?error=AccessDenied');
    throw error;
  }
}

export async function logoutReader() {
  await signOut({ redirectTo: '/admin/acceso' });
}

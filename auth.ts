import NextAuth from 'next-auth';
import { readerAuthConfig } from './app/lib/server/dashboard/readerAuthConfig';

export const { handlers, auth, signIn, signOut } = NextAuth(() => readerAuthConfig(process.env));

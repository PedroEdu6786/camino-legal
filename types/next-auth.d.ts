import 'next-auth';
import type { ReaderIdentity } from '../app/lib/server/dashboard/readerPolicy';

declare module 'next-auth' {
  interface Session { reader?: ReaderIdentity }
}

import { getReaderAccess } from '../../../../lib/server/dashboard/readerAccess';
import { readerDenied, READER_CACHE_HEADERS } from '../../../../lib/server/dashboard/readerPolicy';

export const dynamic = 'force-dynamic';
export async function GET() {
  const access = await getReaderAccess();
  return access.status === 200
    ? Response.json({ expiresAt: access.reader.expiresAt }, { headers: READER_CACHE_HEADERS })
    : readerDenied(access.status);
}

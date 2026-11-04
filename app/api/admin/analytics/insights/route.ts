import { readGoogleInsights } from '../../../../lib/server/dashboard/googleInsights';
import { getReaderAccess } from '../../../../lib/server/dashboard/readerAccess';
import { protectedReport } from '../../../../lib/server/dashboard/protectedReport';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = protectedReport(readGoogleInsights, getReaderAccess);

import { readGoogleSummary } from '../../../../lib/server/dashboard/googleSummary';
import { getReaderAccess } from '../../../../lib/server/dashboard/readerAccess';
import { protectedReport } from '../../../../lib/server/dashboard/protectedReport';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = protectedReport(readGoogleSummary, getReaderAccess);

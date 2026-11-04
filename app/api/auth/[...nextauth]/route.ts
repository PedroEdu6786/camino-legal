import { handlers } from '../../../../auth';
import type { NextRequest } from 'next/server';
import { readerAuthReady, readerDenied } from '../../../lib/server/dashboard/readerPolicy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!readerAuthReady(process.env)) return readerDenied(503);
  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  if (!readerAuthReady(process.env)) return readerDenied(503);
  return handlers.POST(request);
}

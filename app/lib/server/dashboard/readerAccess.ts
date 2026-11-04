import 'server-only';
import { auth } from '../../../../auth';
import { evaluateReader, readerAuthReady, type ReaderAccess } from './readerPolicy';

export async function getReaderAccess(): Promise<ReaderAccess> {
  if (!readerAuthReady(process.env)) return { status: 503 };
  try { return evaluateReader(await auth(), process.env); }
  catch { return { status: 503 }; }
}

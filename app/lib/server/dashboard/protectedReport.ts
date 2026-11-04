import { readerDenied, READER_CACHE_HEADERS, type ReaderAccess } from './readerPolicy.ts';

/** Authorization precedes parameter handling, cache reads and all provider calls. */
export function protectedReport(read: (params: URLSearchParams) => Promise<unknown>, authorize: () => Promise<ReaderAccess>) {
  return async (request: Request) => {
    const access = await authorize();
    if (access.status !== 200) return readerDenied(access.status);
    const params = new URL(request.url).searchParams;
    if ([...params.keys()].some(key => !['days', 'start', 'end'].includes(key) || params.getAll(key).length > 1)) {
      return Response.json({ error: 'Parámetros de consulta no válidos.' }, { status: 400, headers: READER_CACHE_HEADERS });
    }
    try { return Response.json(await read(params), { headers: READER_CACHE_HEADERS }); }
    catch { return Response.json({ error: 'Selecciona un rango válido de hasta 90 días completos, anterior a hoy.' }, { status: 400, headers: READER_CACHE_HEADERS }); }
  };
}

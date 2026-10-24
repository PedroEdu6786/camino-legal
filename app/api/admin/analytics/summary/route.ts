import { readGoogleSummary } from '../../../../lib/server/dashboard/googleSummary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const headers = { 'Cache-Control': 'private, no-store' };
  if ([...params.keys()].some(key => !['days', 'start', 'end'].includes(key)) || [...params.keys()].some(key => params.getAll(key).length > 1)) return Response.json({ error: 'Parámetros de consulta no válidos.' }, { status: 400, headers });
  try { return Response.json(await readGoogleSummary(params), { headers }); }
  catch { return Response.json({ error: 'Selecciona un rango válido de hasta 90 días completos, anterior a hoy.' }, { status: 400, headers }); }
}

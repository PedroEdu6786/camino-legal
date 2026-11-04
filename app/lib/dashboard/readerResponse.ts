/** Dispatch before processing a denied response so no stale report remains visible. */
export function checkReaderResponse(response: Response) {
  if ([401, 403, 503].includes(response.status)) {
    window.dispatchEvent(new CustomEvent('analytics-access-denied', { detail: response.status }));
    throw new Error('Inicia sesión para consultar la analítica.');
  }
}

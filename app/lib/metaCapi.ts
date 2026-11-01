// Server-only restricted matching lane. No user data or provider error bodies are logged.
export type MetaLead = { outcomeEventId: string; occurredAt: number; emailHash: string; phoneHash?: string; eventSourceUrl?: string; clientUserAgent?: string };
export type MetaOptions = {
  fetcher?: typeof fetch;
  endpoint?: string;
  deadlineMs?: number;
  pixelId?: string;
  accessToken?: string;
  apiVersion?: string;
};
export async function sendMetaLead(lead: MetaLead, options: MetaOptions = {}): Promise<boolean> {
  const pixelId = options.pixelId ?? process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = options.accessToken ?? process.env.META_ACCESS_TOKEN;
  // Explicit deployment verification is required; never silently choose a Graph version.
  const version = options.apiVersion ?? process.env.META_GRAPH_API_VERSION;
  if (!pixelId || !/^\d+$/.test(pixelId) || !accessToken || !version || !/^v\d+\.\d+$/.test(version)) return false;
  const fetcher = options.fetcher ?? fetch;
  try {
    const response = await fetcher(options.endpoint ?? `https://graph.facebook.com/${version}/${pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(options.deadlineMs ?? 2000),
      body: JSON.stringify({
        data: [{
          event_name: "Lead", event_time: Math.floor(lead.occurredAt / 1000), event_id: lead.outcomeEventId,
          action_source: "website",
          ...(lead.eventSourceUrl ? { event_source_url: lead.eventSourceUrl } : {}),
          user_data: { em: [lead.emailHash], ...(lead.phoneHash ? { ph: [lead.phoneHash] } : {}), ...(lead.clientUserAgent ? { client_user_agent: lead.clientUserAgent } : {}) },
        }],
        access_token: accessToken,
      }),
    });
    // A 2xx response is not sufficient when the provider rejects all events.
    if (!response.ok) return false;
    const payload = await response.json() as { events_received?: unknown };
    return typeof payload.events_received === "number" && payload.events_received >= 1;
  } catch { return false; }
}

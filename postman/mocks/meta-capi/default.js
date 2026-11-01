// Local contract stand-in; never forwards to Meta or accepts real credentials.
// Postman loads local mock handlers as CommonJS.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const http = require('node:http');
http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const path = new URL(req.url, 'http://localhost').pathname;
  if (req.method !== 'POST' || !/^\/v\d+\.0\/\d+\/events$/.test(path)) {
    res.writeHead(501);
    return res.end(JSON.stringify({ error: { message: 'Not modeled' } }));
  }
  // Postman interceptRequests parses the stream before invoking the handler.
  const body = req.body || {};
  const event = body.data?.[0];
  const valid = body.access_token === 'synthetic-test-token' && body.data?.length === 1 &&
    event?.event_name === 'Lead' && typeof event.event_id === 'string' &&
    Number.isInteger(event.event_time) && event.action_source === 'website' &&
    event.event_source_url === 'https://site.example.test/cotizaciones' &&
    event.user_data?.client_user_agent === 'Synthetic Browser/1.0' &&
    /^[a-f0-9]{64}$/.test(event.user_data?.em?.[0] ?? '') &&
    !JSON.stringify(event).includes('synthetic@example.test');
  if (!valid) {
    res.writeHead(400);
    return res.end(JSON.stringify({ error: { message: 'Invalid synthetic event', code: 100 } }));
  }
  res.end(JSON.stringify({ events_received: 1, messages: [], fbtrace_id: 'synthetic' }));
}).listen(process.env.PORT || 4900, '127.0.0.1');

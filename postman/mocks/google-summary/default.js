// Narrow local stand-in for Google's documented runReport contract. No forwarding.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const http = require('node:http');
http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const path = new URL(req.url, 'http://localhost').pathname;
  if (req.method !== 'POST' || path !== '/v1beta/properties/123456:runReport') {
    res.writeHead(501); return res.end(JSON.stringify({ error: { message: 'Not modeled' } }));
  }
  const body = req.body || {};
  const names = (body.metrics || []).map(metric => metric.name);
  const filters = JSON.stringify(body.dimensionFilter || {});
  const valid = names.length === 4 && ['totalUsers', 'screenPageViews', 'bounceRate', 'sessions'].every(name => names.includes(name)) &&
    Array.isArray(body.dateRanges) && body.dateRanges.length === 1 &&
    filters.includes('streamId') && filters.includes('789012') && filters.includes('platform') && /web/i.test(filters) &&
    (!body.dimensions || body.dimensions.length === 0);
  if (!valid) { res.writeHead(400); return res.end(JSON.stringify({ error: { message: 'Invalid summary report contract' } })); }
  const values = { totalUsers: '120', screenPageViews: '340', bounceRate: '0.375', sessions: '160' };
  res.end(JSON.stringify({
    dimensionHeaders: [], metricHeaders: names.map(name => ({ name, type: name === 'bounceRate' ? 'TYPE_FLOAT' : 'TYPE_INTEGER' })),
    rows: [{ metricValues: names.map(name => ({ value: values[name] })) }], rowCount: 1,
    metadata: { timeZone: 'America/Merida', currencyCode: 'MXN' }, kind: 'analyticsData#runReport',
  }));
}).listen(process.env.PORT || 4915, '127.0.0.1');

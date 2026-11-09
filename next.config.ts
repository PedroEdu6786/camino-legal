import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/servicios/paquete-web-legal',
        destination: '/servicios/marco-legal-digital',
        permanent: true,
      },
      {
        source: '/cotizaciones',
        has: [{ type: 'query', key: 'servicio', value: 'paquete-web-legal' }],
        destination: '/cotizaciones?servicio=marco-legal-digital',
        permanent: true,
      },
    ];
  },
  async headers() {
    const headers = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
    ];
    return ['/admin/:path*', '/api/admin/:path*', '/api/auth/:path*'].map(source => ({ source, headers }));
  },
};

export default nextConfig;

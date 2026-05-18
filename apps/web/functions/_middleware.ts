// Cloudflare Pages middleware — adds security headers + CORS

import type { PagesFunction } from '@cloudflare/workers-types';

export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();

  const headers = new Headers(response.headers);
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

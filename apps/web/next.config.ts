import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@procura/ui', '@procura/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'pub-*.r2.dev' },
    ],
  },
};

if (process.env.NODE_ENV === 'development') {
  import('@cloudflare/next-on-pages/next-dev').then((m) => m.setupDevPlatform());
}

export default nextConfig;

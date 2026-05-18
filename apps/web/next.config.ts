import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@procura/ui', '@procura/shared'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.clerk.com' },
    ],
  },
};

export default nextConfig;

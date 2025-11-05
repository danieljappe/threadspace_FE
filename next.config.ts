import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove 'export' output for server deployment (needed for WebSocket subscriptions)
  // output: 'export', // Only use for static export deployments
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: '.next', // Default Next.js build directory for server deployment
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/threadspace_FE' : '', // Not needed for Render
  /* config options here */
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    unoptimized: true,
    domains: ['localhost', 'via.placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
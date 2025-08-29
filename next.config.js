/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during builds  
  typescript: {
    ignoreBuildErrors: true,
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_APP_URL || '' : '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
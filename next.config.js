// next.config.js - COMPLETE WORKING VERSION
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic performance optimizations
  compress: true,
  swcMinify: true,
  
  // Image handling for Cloudflare
  images: {
    unoptimized: true, // Cloudflare doesn't support Next.js image optimization
  },
  
  // React strict mode (optional)
  reactStrictMode: true,
  
  // Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: false, // Set to true if you have TypeScript errors
  },
  
  // Disable ESLint during build  
  eslint: {
    ignoreDuringBuilds: false, // Set to true if you have ESLint errors
  },
  
  // Security headers (optional)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

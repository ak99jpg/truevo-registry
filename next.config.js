// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // REQUIRED for Cloudflare Pages
  images: {
    unoptimized: true, // REQUIRED for static export
  },
  // Optional: Add trailing slash for better compatibility
  trailingSlash: true,
}

module.exports = nextConfig


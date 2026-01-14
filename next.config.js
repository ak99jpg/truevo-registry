// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // This enables static export
  images: {
    unoptimized: true, // Required for static export
  },
  // Remove trailing slashes if needed
  trailingSlash: false,
}

module.exports = nextConfig

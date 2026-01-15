/** @type {import('next').NextConfig} */
const nextConfig = {
  // No output: 'export'
  // No output: 'standalone' (let Next.js decide)
  images: {
    unoptimized: true,
  },
  experimental: {
    // Optional: Enable if you have issues
    // outputFileTracingRoot: __dirname,
  }
}
module.exports = nextConfig

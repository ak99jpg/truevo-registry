// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Cloudflare
  trailingSlash: false
}

module.exports = nextConfig;


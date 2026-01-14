/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Disable experimental features that cause edge issues
  experimental: {
    serverComponentsExternalPackages: [],
  },
};

module.exports = nextConfig;


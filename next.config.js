// next.config.js
module.exports = {
  compress: true,
  swcMinify: true,
  experimental: {
    // Reduce bundle size
    optimizeCss: true,
    scrollRestoration: true,
  },
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

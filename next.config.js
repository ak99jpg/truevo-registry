// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Cloudflare
  trailingSlash: false
  images: {
    unoptimized: true,
    domains: ['https://glqrnmfzopwzmiiyvwst.supabase.co'],
  },
  // Disable test pages in production
  async redirects() {
    return [
      {
        source: '/test',
        destination: '/',
        permanent: false,
      },
      {
        source: '/auth-test',
        destination: '/',
        permanent: false,
      },
      {
        source: '/test-auth-fix',
        destination: '/',
        permanent: false,
      },
    ];
  },
};


module.exports = nextConfig;

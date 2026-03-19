/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});

const nextConfig = withMDX({
  pageExtensions: ['ts', 'tsx', 'mdx'],
  experimental: {
    largePageDataBytes: 256 * 1024,
  },
  async redirects() {
    return [
      { source: '/dispatches', destination: '/', permanent: false },
      { source: '/dispatches/:path*', destination: '/', permanent: false },
      { source: '/dispatch', destination: '/', permanent: false },
      { source: '/dispatch/:path*', destination: '/', permanent: false },
    ];
  },
});

module.exports = nextConfig;

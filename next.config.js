/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});

const nextConfig = withMDX({
  pageExtensions: ['ts', 'tsx', 'mdx'],
  experimental: {
    largePageDataBytes: 256 * 1024,
  },
});

module.exports = nextConfig;

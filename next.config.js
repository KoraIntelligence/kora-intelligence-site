/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});

const nextConfig = withMDX({
  pageExtensions: ['ts', 'tsx', 'mdx'],
  experimental: {
    largePageDataBytes: 256 * 1024, // 256kB limit
  },
});

const { withContentlayer } = require('next-contentlayer');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    largePageDataBytes: 256 * 1024,
  },
};

module.exports = withContentlayer(nextConfig);
module.exports = nextConfig;
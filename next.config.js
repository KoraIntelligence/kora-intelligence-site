/** @type {import('next').NextConfig} */
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});
const { withContentlayer } = require('next-contentlayer');

const nextConfig = withContentlayer(
  withMDX({
    pageExtensions: ['ts', 'tsx', 'mdx'],
    experimental: {
      largePageDataBytes: 256 * 1024, // 256kB limit
    },
  })
);

module.exports = nextConfig;
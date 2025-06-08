/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    largePageDataBytes: 256 * 1024, // 256kB limit
  },
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'customer-*.cloudflarestream.com',
      },
    ],
  },
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
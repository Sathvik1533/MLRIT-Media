import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudinary delivers all images from res.cloudinary.com
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
    // Cloudinary handles format negotiation (f_auto) — Next.js optimizer
    // sits on top and adds srcSet for responsive sizing
    formats: ["image/avif", "image/webp"],
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/media/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

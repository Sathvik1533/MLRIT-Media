import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudflare Images delivers from imagedelivery.net
    remotePatterns: [
      {
        protocol: "https",
        hostname: "imagedelivery.net",
        pathname: "/**",
      },
    ],
    // Let Cloudflare handle format negotiation — disable Next.js built-in optimizer
    // so we don't pay for double-processing
    unoptimized: false,
    // Serve modern formats — browsers that support avif/webp get them automatically
    formats: ["image/avif", "image/webp"],
  },
  // Security headers — required for Cloudflare Pages deployment
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
        // Aggressive caching for media assets served through /api/media or static
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

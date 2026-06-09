import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "wildspineuganda.com",
          },
        ],
        destination: "https://www.wildspineuganda.com/:path*",
        statusCode: 308,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
      {
        source: "/guide.pdf",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          {
            key: "Content-Disposition",
            value: 'attachment; filename="wild-spine-uganda-gorilla-trekking-guide-2026.pdf"',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

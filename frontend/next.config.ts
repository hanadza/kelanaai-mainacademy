import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: process.env.BACKEND_URL
          ? `${process.env.BACKEND_URL.replace(/\/$/, "")}/api/v1/:path*`
          : "http://localhost:8000/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;

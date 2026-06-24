import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/client",
    "@aurora/database",
    "@aurora/core",
    "@aurora/shared",
    "bcryptjs",
  ],
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "6rip9ut9.us-east.insforge.app",
      },
    ],
  },
};

export default nextConfig;

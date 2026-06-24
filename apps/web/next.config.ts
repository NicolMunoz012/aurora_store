import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Internal workspace packages must be transpiled by Next.js/Turbopack,
  // NOT externalized. Only true native Node.js packages go in serverExternalPackages.
  serverExternalPackages: [
    "@prisma/client",
    "bcryptjs",
    "pg",
  ],
  // Transpile internal workspace packages so Next.js bundles their TypeScript
  // source directly without requiring a separate compile step.
  transpilePackages: [
    "@aurora/core",
    "@aurora/database",
    "@aurora/shared",
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

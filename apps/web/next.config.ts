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
};

export default nextConfig;

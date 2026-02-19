import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["sequelize", "mysql2"],
  experimental: {
    serverComponentsExternalPackages: ["sequelize", "mysql2"],
  },
};

export default nextConfig;

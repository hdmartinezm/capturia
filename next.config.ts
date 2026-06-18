import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone para compatibilidad con AWS Amplify SSR
  output: "standalone",
  serverExternalPackages: ["@copilotkit/runtime"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Errores de TypeScript deben fallar en build
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite verificar el build sin pisarle el .next al dev server, que lo
  // deja sirviendo 500. `npm run build:check` setea esta variable.
  // distDir NO es un flag de CLI, solo se puede por config.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;

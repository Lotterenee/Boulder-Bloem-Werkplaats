import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  webpack: (config) => {
    // Konva's node-build vraagt om het optionele 'canvas'-pakket; de studio
    // draait alleen in de browser (ssr uitgeschakeld), dus sluit het uit.
    config.resolve.alias = { ...config.resolve.alias, canvas: false };
    return config;
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/cardano-treasury-donator",
  images: { unoptimized: true },
  // Use webpack instead of turbopack for WASM support
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
  turbopack: {},
};

export default nextConfig;

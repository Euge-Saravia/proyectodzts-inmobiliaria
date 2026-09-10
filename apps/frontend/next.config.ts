import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  reactCompiler: true,

  images: {
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "placehold.co" },
    ],
  },

  experimental: {
    turbopackFileSystemCacheForDev: true,
    optimizePackageImports: ["bootstrap-icons"],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove rewrites - we'll use direct API calls with CORS handled by backend
  output: 'standalone',
};

export default nextConfig;

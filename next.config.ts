import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/**',
      }
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb'
    }
  }
};

export default nextConfig;

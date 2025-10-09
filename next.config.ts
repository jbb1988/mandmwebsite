import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kuswlvbjplkgrqlmqtok.supabase.co',
      },
    ],
    qualities: [75, 90, 100],
  },
};

export default nextConfig;

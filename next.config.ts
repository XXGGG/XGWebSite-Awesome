import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rzbaojeyldwgqolgxcjy.supabase.co', // 你的 Supabase 项目域名
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from 'next';
import ClientBuildStatsPlugin from './scripts/client-build-stats.mjs';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { caseSensitiveRoutes: true },
  images: { disableStaticImages: true },
  env: {
    NEXT_PUBLIC_SERVER_LINK: process.env.NEXT_PUBLIC_SERVER_LINK ?? process.env.VITE_SERVER_LINK ?? '',
    NEXT_PUBLIC_PRODUCTION_SERVER_LINK: process.env.NEXT_PUBLIC_PRODUCTION_SERVER_LINK ?? process.env.VITE_PRODUCTION_SERVER_LINK ?? '',
    NEXT_PUBLIC_DEV_SERVER_LINK: process.env.NEXT_PUBLIC_DEV_SERVER_LINK ?? process.env.VITE_DEV_SERVER_LINK ?? '',
    NEXT_PUBLIC_MEET_SERVER_LINK: process.env.NEXT_PUBLIC_MEET_SERVER_LINK ?? process.env.VITE_MEET_SERVER_LINK ?? '',
  },
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.plugins.push(new ClientBuildStatsPlugin());
      if (!dev) {
        config.optimization.splitChunks.cacheGroups.appVendors = {
          test: /[\\/]node_modules[\\/].*\.[cm]?jsx?$/,
          chunks: (chunk: { name?: string }) => chunk.name === 'pages/_app',
          name: 'app-vendors',
          priority: 20,
          enforce: true,
          reuseExistingChunk: true,
        };
      }
    }
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg|webp|woff2?)$/i,
      type: 'asset/resource',
      generator: { filename: 'static/media/[name].[contenthash][ext]' },
    });
    return config;
  },
  async rewrites() {
    const backend = (process.env.CI_BACKEND_URL || process.env.BACKEND_URL)?.replace(/\/$/, '');
    if (!backend) {
      return [];
    }
    return ['/api/:path*', '/Admin/:path*', '/SoftAdmin/:path*', '/css/site.css', '/lib/bootstrap/dist/css/bootstrap.min.css', '/health', '/chatHub/:path*', '/directChatHub/:path*']
      .map((source) => ({ source, destination: `${backend}${source}` }));
  },
};

export default nextConfig;

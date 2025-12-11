import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    // Allow local images to be served
    unoptimized: true, // This helps with static image serving in some deployment environments
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  // Ensure static files are properly served
  output: 'standalone',
  // Experimental features for better static asset handling
  experimental: {
    outputFileTracing: true,
  },
};

export default nextConfig;
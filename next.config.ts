import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'instagram.fepa9-2.fna.fbcdn.net',
        port: '',
        pathname: '/**',
      }
    ],
  },
  output: 'export',
};

// Forcing a cache refresh - Change this value to force a refresh: 2
export default nextConfig;

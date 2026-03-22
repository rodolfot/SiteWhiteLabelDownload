/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
      // Add additional allowed image hosts here
      // { protocol: 'https', hostname: 'images.example.com' },
    ],
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize images
  images: {
    domains: ['novizitstorage.blob.core.windows.net', 'novizitcdn.azureedge.net'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Production optimizations
  poweredByHeader: false,
  compress: true,
  
  // Ensure proper port handling
  serverExternalPackages: [],
};

module.exports = nextConfig; 
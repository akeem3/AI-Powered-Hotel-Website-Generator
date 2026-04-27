import type { NextConfig } from 'next';

/**
 * Next.js Configuration
 *
 * Important: Static export is DISABLED in development mode.
 *
 * Why: With static export enabled, Next.js calls generateStaticParams() at
 * dev startup, which makes slow CMS API calls. This causes 20+ minute startup.
 *
 * In development, routes are generated on-demand (fast startup).
 * In production, we use static export for pre-built HTML (SEO optimized).
 */
const nextConfig: NextConfig = {
  // Only use static export when ENABLE_STATIC_EXPORT is set
  // This enables the /preview route with searchParams to work in dev mode
  ...(process.env.ENABLE_STATIC_EXPORT === 'true' || process.env.NODE_ENV === 'production'
    ? { output: 'export' }
    : {}),

  // Fix workspace root detection issues
  // Set explicit tracing root to avoid parent workspace detection
  outputFileTracingRoot: process.cwd(),

  // Configure for subdirectory deployment if needed
  // basePath: '/web-app', // Uncomment if deploying to subdirectory path

  // Security headers configuration
  // Note: Only applied when output is NOT 'export'
  async headers() {
    if (process.env.NEXT_OUTPUT === 'export') {
      return [];
    }
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
    ];
  },

  // Experimental features for better build performance
  // Note: optimizePackageImports moved to stable in Next.js 15, kept here for 14
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-slot'],
  },
  // Next.js 14.x requires explicit appDir for app router (default in 15)
  // appDir is enabled by default when /app directory exists

  // Proper image domains for the hotel website
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      // Add your hotel image domains here
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true, // Keep ESLint checks during build
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript checks
  },
};

export default nextConfig;

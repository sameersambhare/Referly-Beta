/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: false
    },
    // Enable modern build optimizations
    optimizeCss: true,
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  typescript: {
    // Temporarily ignore type errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily disable ESLint during build
    ignoreDuringBuilds: true,
  },
  // Add custom webpack config to handle specific issues
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      minimize: true,
    }
    
    // Handle module resolution issues
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        path: false,
      }
    }
    
    return config
  },
  // Add custom page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Ensure proper output directory
  distDir: '.next',
  // Add strict mode for better error catching
  reactStrictMode: true,
  // Improve static file serving
  poweredByHeader: false,
  generateEtags: false,
}

module.exports = nextConfig 
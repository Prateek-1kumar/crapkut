import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for serverless performance
  experimental: {
    serverMinification: true,
    serverSourceMaps: false,
  },
  
  // External packages for Puppeteer
  serverExternalPackages: ['puppeteer-core', 'puppeteer-extra', 'puppeteer-extra-plugin-stealth', '@sparticuz/chromium'],
  
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 3600, // Cache images for 1 hour
  },
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (isServer) {
      // External packages to reduce bundle size
      config.externals.push(
        'puppeteer-core',
        'puppeteer-extra', 
        'puppeteer-extra-plugin-stealth',
        '@sparticuz/chromium'
      );
    }
    
    // Optimize for production
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };
    
    return config;
  },
  
  // Enable output for self-hosting
  output: 'standalone',
};

export default nextConfig;

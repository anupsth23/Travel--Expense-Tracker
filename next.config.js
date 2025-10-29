/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable webpack configuration for Tesseract.js worker files
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // For GitHub Pages deployment
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
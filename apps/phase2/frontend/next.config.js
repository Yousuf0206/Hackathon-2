/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker deployment
  // This creates a minimal server.js file with all dependencies bundled
  output: 'standalone',
}

module.exports = nextConfig

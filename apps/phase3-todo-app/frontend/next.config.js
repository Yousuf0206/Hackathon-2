const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Set the correct root for monorepo structure
  outputFileTracingRoot: path.join(__dirname, './'),
}

module.exports = nextConfig

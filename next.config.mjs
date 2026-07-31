/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Prevent webpack from bundling heavy native Node.js packages.
  // pdf-parse loads pdf.js test fixtures into memory when bundled, causing crashes.
  serverExternalPackages: ['pdf-parse', 'mammoth'],
}

export default nextConfig

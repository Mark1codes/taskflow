/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Prevent webpack from bundling heavy native Node.js packages.
  // pdf-parse loads pdf.js test fixtures into memory when bundled, causing crashes.
  serverExternalPackages: ['pdf-parse', 'mammoth'],
  
  // OWASP A05: Security Misconfiguration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Prevents Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Prevents MIME-sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin', // Privacy
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()', // Disable unused APIs
          },
        ],
      },
    ]
  },
}

export default nextConfig

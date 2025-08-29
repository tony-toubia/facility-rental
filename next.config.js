/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ahzmfkjtiiyuipweaktx.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Keep domains for backward compatibility
    domains: [
      'images.unsplash.com', 
      'via.placeholder.com',
      'ahzmfkjtiiyuipweaktx.supabase.co'
    ],
  },
}

module.exports = nextConfig
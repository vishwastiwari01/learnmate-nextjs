/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'image.pollinations.ai',
    ],
  },
  // Needed for canvas in arena
  webpack: (config) => {
    config.externals = [...(config.externals || [])];
    return config;
  },
}
module.exports = nextConfig

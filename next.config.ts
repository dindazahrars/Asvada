import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    domains: [
      "images.unsplash.com",
      "lh3.googleusercontent.com",
      "img-global.cpcdn.com",
      "akcdn.detik.net.id",
      "images.pexels.com",
    ],
  },
};

export default nextConfig;

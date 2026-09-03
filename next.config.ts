import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 15+ defaults to "attachment", which hides <img> in some browsers / Simple Browser.
    contentDispositionType: "inline",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;

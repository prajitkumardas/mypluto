import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "www.google.com",
        pathname: "/s2/favicons",
        protocol: "https"
      }
    ]
  },
  reactStrictMode: true
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // Development only: `next dev` also prints a "Network" address (this PC's IP on the
  // local network/VPN). Next blocks its dev scripts on any host but localhost, which
  // made pages hang or crawl when opened that way, so allow that address too.
  allowedDevOrigins: ["10.2.0.2"],
  images: {
    // Posters and photos are links to other sites (TMDB, Wikimedia), already sized
    // for the web. The browser loads them straight from those CDNs: routing them
    // through our server's optimizer added a hop, and Wikimedia rate-limits (429)
    // a single server fetching many images, which made pages slow or broken.
    unoptimized: true,
    // Posters are links typed in by the admin, so allow any https host
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

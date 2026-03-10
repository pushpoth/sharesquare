import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dynamic routes (/groups/[id], /expenses/[id]/edit) require server rendering
  // at request time since IDs come from client-side IndexedDB.
  // Deploy to Vercel, Netlify, or any Next.js-compatible host.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

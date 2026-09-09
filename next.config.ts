import type { NextConfig } from "next";

// Vercel can import blank values from .env.example during the first project
// creation. NextAuth treats an empty NEXTAUTH_URL as a real URL and fails the
// production build, so blank optional values must behave exactly like missing
// values. The platform-provided VERCEL_URL is then used automatically.
for (const key of ["NEXTAUTH_URL", "NEXTAUTH_SECRET"] as const) {
  if (process.env[key] !== undefined && !process.env[key]?.trim()) {
    delete process.env[key];
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
};

export default nextConfig;

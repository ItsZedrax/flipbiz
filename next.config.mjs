import withPWAInit from "@ducanh2912/next-pwa";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : null;

const withPWA = withPWAInit({
  dest: "public",
  // Disable in dev to avoid HMR conflicts.
  disable: process.env.NODE_ENV === "development",
  // SW registers itself; no manual register call needed.
  register: true,
  // Don't cache anything Supabase or auth related.
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: ({ url }) =>
          url.pathname.startsWith("/_next/static") ||
          url.pathname.startsWith("/_next/image"),
        handler: "StaleWhileRevalidate",
        options: { cacheName: "next-static" },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default withPWA(nextConfig);

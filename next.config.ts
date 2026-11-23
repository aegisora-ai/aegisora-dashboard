import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs/config";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: { cpus: 2 },
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/privacy", destination: "/trust/privacy", permanent: false },
      { source: "/datenschutz", destination: "/trust/privacy", permanent: false },
      { source: "/agb", destination: "/terms", permanent: false },
      { source: "/en/privacy", destination: "/trust/privacy", permanent: false },
      { source: "/en/datenschutz", destination: "/trust/privacy", permanent: false },
      { source: "/en/agb", destination: "/terms", permanent: false },
      { source: "/de/privacy", destination: "/de/trust/privacy", permanent: false },
      { source: "/de/datenschutz", destination: "/de/trust/privacy", permanent: false },
      { source: "/de/agb", destination: "/de/terms", permanent: false },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.aegisora.org" }],
        destination: "https://aegisora.org/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy-Report-Only", value: "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.openai.com https://*.ingest.de.sentry.io; frame-src https://js.stripe.com https://hooks.stripe.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; report-uri /api/csp-report" },
        ],
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  org: "aegisora",
  project: "aegisora-dashboard",
  sentryUrl: "https://de.sentry.io",
  silent: !process.env.CI,
  telemetry: false,
});
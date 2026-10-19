import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
    {
        "key":  "X-Content-Type-Options",
        "value":  "nosniff"
    },
    {
        "key":  "X-Frame-Options",
        "value":  "DENY"
    },
    {
        "key":  "Referrer-Policy",
        "value":  "strict-origin-when-cross-origin"
    },
    {
        "key":  "Permissions-Policy",
        "value":  "camera=(), microphone=(self), geolocation=()"
    },
    {
        "key":  "Strict-Transport-Security",
        "value":  "max-age=63072000; includeSubDomains"
    },
    {
        "key":  "Content-Security-Policy",
        "value":  "frame-ancestors 'none'; base-uri 'self'; object-src 'none'"
    },
    {
        "key":  "Content-Security-Policy-Report-Only",
        "value":  "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.openai.com; frame-src https://js.stripe.com https://hooks.stripe.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'; report-uri /api/csp-report"
    }
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  experimental: { cpus: 2 },
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default withNextIntl(nextConfig);
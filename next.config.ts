import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs/config";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  experimental: { cpus: 2 },
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
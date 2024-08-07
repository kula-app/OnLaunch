/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // time in seconds of no pages generating during static
  // generation before timing out
  staticPageGenerationTimeout: 600,

  experimental: {
    // Enable the instrumentation hook for Sentry v8.x
    instrumentationHook: true,
  },

  async rewrites() {
    return [
      {
        source: "/api/docs",
        destination: "/api-doc",
      },
    ];
  },
};

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(nextConfig, {
  // -- SENTRY WEBPACK PLUGIN OPTIONS --
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: "kula-app",
  project: "onlaunch",

  // -- SENTRY SDK OPTIONS --
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: false,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
});

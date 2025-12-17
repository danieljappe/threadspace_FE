import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Reduce in production for better performance
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  
  // Enable session replay in production
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful debug information
  debug: false,

  // Filter out specific errors
  ignoreErrors: [
    // Common browser extensions and third-party errors
    "ResizeObserver loop limit exceeded",
    "Network request failed",
  ],

  environment: process.env.NODE_ENV,
});

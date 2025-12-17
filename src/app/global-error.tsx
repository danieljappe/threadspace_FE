"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">💥</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              An unexpected error occurred. Our team has been notified.
            </p>
            {error.digest && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}



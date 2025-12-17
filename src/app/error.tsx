"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-2">
            An unexpected error occurred. Our team has been notified.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mb-6 font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/main'}
              leftIcon={<Home className="h-4 w-4" />}
            >
              Go Home
            </Button>
            <Button
              onClick={() => reset()}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



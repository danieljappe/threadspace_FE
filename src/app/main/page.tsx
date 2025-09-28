'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MainPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle any routing logic here if needed
    // For now, this will serve as the main page
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          ThreadSpace
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to the main page. Dynamic routes will be handled client-side.
        </p>
      </div>
    </div>
  );
}
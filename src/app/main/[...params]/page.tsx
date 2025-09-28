'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import PostPage from '../post/[id]/page';
import TopicPage from '../topic/[slug]/page';
import UserProfilePage from '../user/[username]/page';

export default function DynamicRoutePage() {
  const params = useParams();
  const router = useRouter();
  const routeParams = params.params as string[];

  useEffect(() => {
    // This will be handled by the individual page components
  }, [routeParams]);

  // Route to the appropriate page based on the first parameter
  if (routeParams?.length >= 1) {
    const firstParam = routeParams[0];
    
    if (firstParam === 'post' && routeParams[1]) {
      return <PostPage />;
    }
    
    if (firstParam === 'topic' && routeParams[1]) {
      return <TopicPage />;
    }
    
    if (firstParam === 'user' && routeParams[1]) {
      return <UserProfilePage />;
    }
  }

  // Fallback to 404
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    </div>
  );
}

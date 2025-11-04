'use client';

import { Suspense } from 'react';
import { PostPageClient } from './[id]/PostPageClient';
import { useSearchParams } from 'next/navigation';

function PostPageContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get('id');

  if (!postId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Post ID not found</p>
        </div>
      </div>
    );
  }

  return <PostPageClient postId={postId} />;
}

export default function PostPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <PostPageContent />
    </Suspense>
  );
}

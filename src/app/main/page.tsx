'use client';

import React from 'react';
import { PostList } from '@/components/posts/PostList';
import { PostOrder } from '@/lib/constants';

export default function MainPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Feed
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Posts from topics and users you follow
        </p>
      </div>

      <PostList orderBy={PostOrder.NEWEST} />
    </div>
  );
}

'use client';

import React from 'react';
import { CreatePostForm } from '@/components/posts/CreatePostForm';

export default function CreatePostPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Post
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your thoughts and start a meaningful discussion
        </p>
      </div>

      <CreatePostForm />
    </div>
  );
}

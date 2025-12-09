'use client';

import React, { useState } from 'react';
import { PostList } from '@/components/posts/PostList';
import { PostOrder } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Clock, Trophy } from 'lucide-react';

type SortOption = {
  value: PostOrder;
  label: string;
  icon: React.ReactNode;
};

const sortOptions: SortOption[] = [
  { value: PostOrder.NEWEST, label: 'New', icon: <Clock className="w-4 h-4" /> },
  { value: PostOrder.TOP, label: 'Top', icon: <Trophy className="w-4 h-4" /> },
  { value: PostOrder.OLDEST, label: 'Old', icon: <Clock className="w-4 h-4 rotate-180" /> },
];

export default function MainPage() {
  const [orderBy, setOrderBy] = useState<PostOrder>(PostOrder.NEWEST);

  return (
    <div className="space-y-6">
      {/* Header with sort options */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Feed
        </h1>
        
        {/* Sort tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setOrderBy(option.value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${orderBy === option.value
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              {option.icon}
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Posts list with infinite scroll */}
      <PostList orderBy={orderBy} />
    </div>
  );
}

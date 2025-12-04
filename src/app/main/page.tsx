'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PostList } from '@/components/posts/PostList';
import { PostOrder } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Flame, Clock, TrendingUp, Trophy } from 'lucide-react';

type SortOption = {
  value: PostOrder;
  label: string;
  icon: React.ReactNode;
};

const sortOptions: SortOption[] = [
  { value: PostOrder.NEWEST, label: 'New', icon: <Clock className="w-4 h-4" /> },
  { value: PostOrder.TRENDING, label: 'Trending', icon: <Flame className="w-4 h-4" /> },
  { value: PostOrder.TOP, label: 'Top', icon: <Trophy className="w-4 h-4" /> },
  { value: PostOrder.OLDEST, label: 'Old', icon: <TrendingUp className="w-4 h-4" /> },
];

function MainPageContent() {
  const searchParams = useSearchParams();
  const [orderBy, setOrderBy] = useState<PostOrder>(PostOrder.NEWEST);
  
  // Get search from URL params if present
  const search = searchParams.get('search') || undefined;

  return (
    <div className="space-y-6">
      {/* Header with sort options */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {search ? `Results for "${search}"` : 'Feed'}
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
      <PostList 
        orderBy={orderBy} 
        search={search}
      />
    </div>
  );
}

export default function MainPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    }>
      <MainPageContent />
    </Suspense>
  );
}
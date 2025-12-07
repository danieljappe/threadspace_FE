'use client';

import React, { useState, useCallback } from 'react';
import { useQuery, NetworkStatus } from '@apollo/client';
import { Post, PostOrder } from '@/types';
import { PostCard } from '@/components/posts/PostCard';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { GET_BOOKMARKED_POSTS } from '@/graphql/queries';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2, AlertCircle, Bookmark, Clock, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

const POSTS_PER_PAGE = 10;

type SortOption = {
  value: PostOrder;
  label: string;
  icon: React.ReactNode;
};

const sortOptions: SortOption[] = [
  { value: PostOrder.NEWEST, label: 'Recent', icon: <Clock className="w-4 h-4" /> },
  { value: PostOrder.OLDEST, label: 'Oldest', icon: <Clock className="w-4 h-4 rotate-180" /> },
  { value: PostOrder.TOP, label: 'Top', icon: <Trophy className="w-4 h-4" /> },
];

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const [orderBy, setOrderBy] = useState<PostOrder>(PostOrder.NEWEST);

  const { data, loading, error, fetchMore, networkStatus, refetch } = useQuery(GET_BOOKMARKED_POSTS, {
    variables: {
      orderBy,
      first: POSTS_PER_PAGE
    },
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all',
    skip: !user // Skip query if not logged in
  });

  const isFetchingMore = networkStatus === NetworkStatus.fetchMore;
  const isInitialLoading = loading && !isFetchingMore;

  // Extract posts and pagination info
  const posts: Post[] = data?.bookmarkedPosts?.edges?.map((edge: { node: Post }) => edge.node) || [];
  const hasNextPage = data?.bookmarkedPosts?.pageInfo?.hasNextPage ?? false;
  const endCursor = data?.bookmarkedPosts?.pageInfo?.endCursor;
  const totalCount = data?.bookmarkedPosts?.totalCount ?? 0;

  // Load more handler
  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isFetchingMore || !endCursor) return;

    fetchMore({
      variables: {
        after: endCursor,
        first: POSTS_PER_PAGE
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prevResult;

        return {
          bookmarkedPosts: {
            __typename: 'PostConnection',
            edges: [
              ...prevResult.bookmarkedPosts.edges,
              ...fetchMoreResult.bookmarkedPosts.edges
            ],
            pageInfo: fetchMoreResult.bookmarkedPosts.pageInfo,
            totalCount: fetchMoreResult.bookmarkedPosts.totalCount
          }
        };
      }
    });
  }, [hasNextPage, isFetchingMore, endCursor, fetchMore]);

  // Infinite scroll
  const { lastElementRef } = useInfiniteScroll({
    hasNextPage,
    loading: isFetchingMore,
    onLoadMore: handleLoadMore
  });

  // Handle unbookmark - refetch to update the list
  const handleBookmarkChange = useCallback((postId: string, bookmarked: boolean) => {
    if (!bookmarked) {
      // Post was unbookmarked, refetch the list
      refetch();
    }
  }, [refetch]);

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bookmark className="w-6 h-6" />
          Bookmarks
        </h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bookmark className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Sign in to view bookmarks
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Save posts to read later by bookmarking them.
            </p>
            <Link
              href={ROUTES.LOGIN}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Initial loading
  if (isInitialLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6" />
            Bookmarks
          </h1>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && posts.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bookmark className="w-6 h-6" />
          Bookmarks
        </h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to load bookmarks
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              {error.message}
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (!isInitialLoading && posts.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bookmark className="w-6 h-6" />
          Bookmarks
        </h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bookmark className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No bookmarks yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Save interesting posts to read later by clicking the bookmark button.
            </p>
            <Link
              href={ROUTES.HOME}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Posts
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6" />
            Bookmarks
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {totalCount} saved {totalCount === 1 ? 'post' : 'posts'}
          </p>
        </div>

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

      {/* Posts list */}
      <div className="space-y-4">
        {posts.map((post: Post, index: number) => (
          <div
            key={post.id}
            ref={index === posts.length - 1 ? lastElementRef : null}
          >
            <PostCard 
              post={post} 
              onBookmark={handleBookmarkChange}
            />
          </div>
        ))}

        {/* Loading more indicator */}
        {isFetchingMore && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">Loading more...</span>
            </CardContent>
          </Card>
        )}

        {/* End of list */}
        {!hasNextPage && posts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You&apos;ve seen all your bookmarks
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


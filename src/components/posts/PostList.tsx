'use client';

import React, { useCallback } from 'react';
import { useQuery, NetworkStatus } from '@apollo/client';
import { Post, PostOrder } from '@/types';
import { PostCard } from './PostCard';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { GET_POSTS } from '@/graphql/queries';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2, AlertCircle } from 'lucide-react';

const POSTS_PER_PAGE = 10;

interface PostListProps {
  orderBy?: PostOrder;
  className?: string;
}

export const PostList: React.FC<PostListProps> = ({
  orderBy = PostOrder.NEWEST,
  className
}) => {
  // GraphQL query with cursor-based pagination
  const { data, loading, error, fetchMore, networkStatus } = useQuery(GET_POSTS, {
    variables: {
      orderBy,
      first: POSTS_PER_PAGE
    },
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all'
  });

  const isFetchingMore = networkStatus === NetworkStatus.fetchMore;
  const isInitialLoading = loading && !isFetchingMore;
  
  // Extract posts and pagination info from data
  const posts: Post[] = data?.posts?.edges?.map((edge: { node: Post }) => edge.node) || [];
  const hasNextPage = data?.posts?.pageInfo?.hasNextPage ?? false;
  const endCursor = data?.posts?.pageInfo?.endCursor;

  // Load more posts handler
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
          posts: {
            __typename: 'PostConnection',
            edges: [
              ...prevResult.posts.edges,
              ...fetchMoreResult.posts.edges
            ],
            pageInfo: fetchMoreResult.posts.pageInfo,
            totalCount: fetchMoreResult.posts.totalCount
          }
        };
      }
    });
  }, [hasNextPage, isFetchingMore, endCursor, fetchMore]);

  // Infinite scroll hook
  const { lastElementRef } = useInfiniteScroll({
    hasNextPage,
    loading: isFetchingMore,
    onLoadMore: handleLoadMore
  });

  // Loading skeleton for initial load
  if (isInitialLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(5)].map((_, i) => (
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
    );
  }

  // Error state
  if (error && posts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load posts
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
            {error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!isInitialLoading && posts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No posts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            No posts available yet. Be the first to create one!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {posts.map((post: Post, index: number) => (
        <div
          key={post.id}
          ref={index === posts.length - 1 ? lastElementRef : null}
        >
          <PostCard post={post} />
        </div>
      ))}
      
      {/* Loading more indicator */}
      {isFetchingMore && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">Loading more posts...</span>
          </CardContent>
        </Card>
      )}

      {/* End of list indicator */}
      {!hasNextPage && posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You&apos;ve reached the end
          </p>
        </div>
      )}
    </div>
  );
};

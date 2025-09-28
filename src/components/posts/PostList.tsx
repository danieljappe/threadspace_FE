'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { Post, PostOrder } from '@/types';
import { PostCard } from './PostCard';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { GET_POSTS } from '@/graphql/queries';
import { useMockData } from '@/lib/mock-provider';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2, AlertCircle } from 'lucide-react';

interface PostListProps {
  topicId?: string;
  authorId?: string;
  search?: string;
  orderBy?: PostOrder;
  className?: string;
}

export const PostList: React.FC<PostListProps> = ({
  topicId,
  authorId,
  search,
  orderBy = PostOrder.NEWEST,
  className
}) => {
  const mockData = useMockData();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);

  // Try GraphQL query first
  const { data, loading: graphqlLoading, error: graphqlError } = useQuery(GET_POSTS, {
    variables: {
      topicId,
      authorId,
      search,
      orderBy,
      first: 20
    },
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all'
  });

  useEffect(() => {
    if (graphqlError) {
      // If GraphQL fails, use mock data
      console.log('GraphQL failed, using mock data:', graphqlError.message);
      setUseMock(true);
      const mockPosts = mockData.getPosts({
        topicId,
        authorId,
        search,
        orderBy,
        limit: 20
      });
      setPosts(mockPosts);
      setLoading(false);
    } else if (data?.posts?.edges) {
      // Use real data
      setUseMock(false);
      const realPosts = data.posts.edges.map((edge: { node: Post }) => edge.node);
      setPosts(realPosts);
      setLoading(false);
    } else if (!graphqlLoading) {
      // If no data and not loading, use mock data
      setUseMock(true);
      const mockPosts = mockData.getPosts({
        topicId,
        authorId,
        search,
        orderBy,
        limit: 20
      });
      setPosts(mockPosts);
      setLoading(false);
    }
  }, [data, graphqlError, graphqlLoading, topicId, authorId, search, orderBy, mockData]);

  const hasNextPage = false; // Mock data doesn&apos;t support pagination for now

  const { lastElementRef } = useInfiniteScroll({
    hasNextPage,
    loading,
    onLoadMore: () => {
      // Mock data doesn&apos;t support pagination
    }
  });

  if (loading && posts.length === 0) {
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

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load posts
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
            {error}
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

  if (posts.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No posts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            {search 
              ? `No posts match "${search}"`
              : topicId
              ? 'No posts in this topic yet'
              : authorId
              ? 'This user hasn\'t posted anything yet'
              : 'No posts available'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {useMock && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📡 Using mock data - GraphQL API is not available
          </p>
        </div>
      )}
      
      {posts.map((post: Post, index: number) => (
        <div
          key={post.id}
          ref={index === posts.length - 1 ? lastElementRef : null}
        >
          <PostCard post={post} />
        </div>
      ))}
      
      {loading && posts.length > 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">Loading more posts...</span>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'next/navigation';
import { GET_POST } from '@/graphql/queries';
import { useMockData } from '@/lib/mock-provider';
import { PostCard } from '@/components/posts/PostCard';
import { CommentTree } from '@/components/comments/CommentTree';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2, AlertCircle } from 'lucide-react';
import { Post } from '@/types';

export default function PostPage() {
  const params = useParams();
  const postId = params.id as string;
  const mockData = useMockData();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);

  // Try GraphQL query first
  const { data, loading: graphqlLoading, error: graphqlError } = useQuery(GET_POST, {
    variables: { id: postId },
    errorPolicy: 'all'
  });

  useEffect(() => {
    if (graphqlError) {
      // If GraphQL fails, use mock data
      console.log('GraphQL failed, using mock data for post:', graphqlError.message);
      setUseMock(true);
      const mockPost = mockData.getPost(postId);
      if (mockPost) {
        setPost(mockPost);
      } else {
        setError('Post not found');
      }
      setLoading(false);
    } else if (data?.post) {
      // Use real data
      setUseMock(false);
      setPost(data.post);
      setLoading(false);
    } else if (!graphqlLoading) {
      // If no data and not loading, use mock data
      setUseMock(true);
      const mockPost = mockData.getPost(postId);
      if (mockPost) {
        setPost(mockPost);
      } else {
        setError('Post not found');
      }
      setLoading(false);
    }
  }, [data, graphqlError, graphqlLoading, postId, mockData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">Loading post...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load post
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

  if (!post) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Post not found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            The post you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mock Data Notice */}
      {useMock && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📡 Using mock data - GraphQL API is not available
          </p>
        </div>
      )}

      {/* Post */}
      <PostCard 
        post={post} 
        showFullContent={true}
      />

      {/* Comments */}
      <CommentTree postId={postId} />
    </div>
  );
}
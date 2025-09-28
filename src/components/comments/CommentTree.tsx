'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useSubscription } from '@apollo/client/react';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { useAuth } from '@/hooks/useAuth';
import { useMockData } from '@/lib/mock-provider';
import { GET_COMMENTS } from '@/graphql/queries';
import { COMMENT_ADDED } from '@/graphql/subscriptions';
import { Comment } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2, AlertCircle } from 'lucide-react';

interface CommentTreeProps {
  postId: string;
  parentId?: string;
  className?: string;
}

export const CommentTree: React.FC<CommentTreeProps> = ({
  postId,
  parentId,
  className
}) => {
  const { user } = useAuth();
  const mockData = useMockData();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);

  // Try GraphQL query first
  const { data, loading: graphqlLoading, error: graphqlError, refetch } = useQuery(GET_COMMENTS, {
    variables: {
      postId,
      parentId: parentId || null,
      first: 50
    },
    errorPolicy: 'all'
  });

  // Subscribe to real-time comment updates
  const { data: subscriptionData } = useSubscription(COMMENT_ADDED, {
    variables: { postId },
    skip: useMock, // Skip if using mock data
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData?.data?.commentAdded) {
        const newComment = subscriptionData.data.commentAdded;
        
        // Only add the comment if it matches the current parentId filter
        if ((!parentId && !newComment.parent) || (parentId && newComment.parent?.id === parentId)) {
          setComments(prev => {
            // Check if comment already exists to avoid duplicates
            const exists = prev.some(comment => comment.id === newComment.id);
            if (!exists) {
              return [newComment, ...prev];
            }
            return prev;
          });
        }
      }
    }
  });

  useEffect(() => {
    if (graphqlError) {
      // If GraphQL fails, use mock data
      console.log('GraphQL failed, using mock data for comments:', graphqlError.message);
      setUseMock(true);
      const mockComments = mockData.getComments(postId);
      setComments(mockComments);
      setLoading(false);
    } else if (data?.comments?.edges) {
      // Use real data
      setUseMock(false);
      const realComments = data.comments.edges.map((edge: { node: Comment }) => edge.node);
      setComments(realComments);
      setLoading(false);
    } else if (!graphqlLoading) {
      // If no data and not loading, use mock data
      setUseMock(true);
      const mockComments = mockData.getComments(postId);
      setComments(mockComments);
      setLoading(false);
    }
  }, [data, graphqlError, graphqlLoading, postId, parentId, mockData]);

  const handleCommentAdded = (newComment: Comment) => {
    setComments(prev => [newComment, ...prev]);
  };

  const handleCommentUpdated = (commentId: string) => {
    // For now, just refetch comments
    // In a real app, you might want to update the specific comment
    console.log('Comment updated:', commentId);
  };

  const handleCommentDeleted = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">Loading comments...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Failed to load comments
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Mock Data Notice */}
      {useMock && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            📡 Using mock data for comments
          </p>
        </div>
      )}

      {/* Comment Form */}
      {user && !parentId && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <CommentForm
              postId={postId}
              parentId={parentId}
              onSuccess={async () => {
                // Refetch comments to show the new comment immediately
                if (!useMock && refetch) {
                  try {
                    await refetch();
                  } catch (error) {
                    console.error('Failed to refetch comments:', error);
                  }
                }
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="text-4xl mb-2">💬</div>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                {parentId ? 'No replies yet' : 'No comments yet'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Be the first to {parentId ? 'reply' : 'comment'}!
              </p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment: Comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onEdit={handleCommentUpdated}
              onDelete={handleCommentDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
};
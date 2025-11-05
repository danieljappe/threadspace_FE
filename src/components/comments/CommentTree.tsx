'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@apollo/client/react';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { useAuth } from '@/hooks/useAuth';
import { useMockData } from '@/lib/mock-provider';
import { usePostSSE } from '@/hooks/usePostSSE';
import { GET_COMMENTS } from '@/graphql/queries';
import { Comment, VoteType, User, Post, ThreadType } from '@/types';
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

  // Handle new comments from SSE
  const handleCommentAdded = useCallback((commentData: {
    id: string;
    content: string;
    author: { id: string; username: string; avatarUrl?: string };
    postId: string;
    parentId?: string | null;
    depth?: number;
    createdAt: string;
  }) => {
    console.log('[CommentTree] Comment added via SSE:', commentData);
    
    // Only add the comment if it matches the current parentId filter
    const commentParentId = commentData.parentId || null;
    if ((!parentId && !commentParentId) || (parentId && commentParentId === parentId)) {
      // Convert SSE comment format to Comment type
      // Create a complete User object for the author
      const authorUser: User = {
        id: commentData.author.id,
        username: commentData.author.username,
        avatarUrl: commentData.author.avatarUrl,
        email: '', // Not provided by SSE
        reputation: 0, // Not provided by SSE
        isVerified: false, // Not provided by SSE
        createdAt: '',
        updatedAt: '',
      };

      // Create a minimal Post object for the comment
      const postForComment: Post = {
        id: commentData.postId,
        title: '',
        content: '',
        author: authorUser,
        threadType: ThreadType.DISCUSSION,
        views: 0,
        topics: [],
        comments: { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 },
        voteCount: 0,
        bookmarked: false,
        isPinned: false,
        isLocked: false,
        createdAt: '',
        updatedAt: '',
      };

      const newComment: Comment = {
        id: commentData.id,
        content: commentData.content,
        author: authorUser,
        post: postForComment,
        parent: commentParentId ? {
          id: commentParentId,
          content: '',
          author: authorUser,
          depth: 0,
          post: postForComment,
          replies: { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 },
          voteCount: 0,
          isEdited: false,
          createdAt: '',
          updatedAt: '',
        } : undefined,
        depth: commentData.depth ?? (commentParentId ? 1 : 0),
        voteCount: 0,
        userVote: undefined,
        isEdited: false,
        createdAt: commentData.createdAt,
        updatedAt: commentData.createdAt,
        replies: {
          edges: [],
          pageInfo: { hasNextPage: false, hasPreviousPage: false },
          totalCount: 0,
        },
      };
      
      setComments(prev => {
        // Check if comment already exists to avoid duplicates
        const exists = prev.some(comment => comment.id === newComment.id);
        if (!exists) {
          console.log('[CommentTree] Adding new comment to list:', newComment.id);
          return [newComment, ...prev];
        }
        console.log('[CommentTree] Comment already exists, skipping:', newComment.id);
        return prev;
      });
    } else {
      console.log('[CommentTree] Comment filtered out (wrong parent):', {
        commentParentId,
        currentParentId: parentId
      });
    }
  }, [parentId]);

  // Handle comment deletions from SSE
  const handleCommentDeleted = useCallback((commentData: { id: string; postId: string; parentId?: string | null }) => {
    console.log('[CommentTree] Comment deleted via SSE:', commentData);
    
    // Only remove if it matches the current parentId filter
    const commentParentId = commentData.parentId || null;
    if ((!parentId && !commentParentId) || (parentId && commentParentId === parentId)) {
      setComments(prev => {
        const filtered = prev.filter(comment => comment.id !== commentData.id);
        if (filtered.length !== prev.length) {
          console.log('[CommentTree] Removed deleted comment:', commentData.id);
        }
        return filtered;
      });
    } else {
      console.log('[CommentTree] Comment deletion filtered out (wrong parent):', {
        commentParentId,
        currentParentId: parentId
      });
    }
  }, [parentId]);

  // Handle comment votes from SSE
  const handleCommentVoteUpdate = useCallback((update: { targetId: string; targetType: string; voteCount: number; userVote?: 'UPVOTE' | 'DOWNVOTE' | null }) => {
    console.log('[CommentTree] Comment vote update received via SSE:', update);
    
    // Only update if it's a comment vote
    if (update.targetType === 'comment') {
      setComments(prev => prev.map(comment => {
        if (comment.id === update.targetId) {
          // Only update voteCount from SSE (like post voting does)
          // userVote is managed by the mutation response, not SSE
          return { ...comment, voteCount: update.voteCount };
        }
        return comment;
      }));
    }
  }, []);

  // Connect to SSE for live comment updates (only for top-level comments or matching parent)
  usePostSSE({
    postId,
    onCommentAdded: handleCommentAdded,
    onCommentDeleted: handleCommentDeleted,
    onVoteUpdate: handleCommentVoteUpdate,
    enabled: !useMock && !!postId, // Only enable if not using mock data
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

  const handleCommentUpdated = (commentId: string) => {
    // For now, just refetch comments
    // In a real app, you might want to update the specific comment
    console.log('Comment updated:', commentId);
  };

  const handleLocalCommentDeleted = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  };

  const handleCommentVote = (commentId: string, voteType: VoteType | null) => {
    // Update the comment's userVote locally when user votes
    setComments(prev => prev.map(comment => 
      comment.id === commentId
        ? { ...comment, userVote: voteType || undefined }
        : comment
    ));
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
              onVote={handleCommentVote}
              onEdit={handleCommentUpdated}
              onDelete={handleLocalCommentDeleted}
            />
          ))
        )}
      </div>
    </div>
  );
};
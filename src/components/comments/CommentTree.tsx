'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { CommentItem } from './CommentItem';
import { CommentForm } from './CommentForm';
import { useAuth } from '@/hooks/useAuth';
import { usePostSSE } from '@/hooks/usePostSSE';
import { GET_COMMENTS } from '@/graphql/queries';
import { Comment, VoteType, User, Post, CommentEdge } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2, AlertCircle, MessageSquare } from 'lucide-react';

interface CommentTreeProps {
  postId: string;
  className?: string;
}

// Filter to only get root-level comments (depth 0 or no parent)
function getRootComments(comments: Comment[]): Comment[] {
  return comments.filter(comment => comment.depth === 0 || !comment.parent?.id);
}

// Helper to find if a parent exists in the tree (recursive search)
function findCommentInTree(comments: Comment[], targetId: string): boolean {
  for (const comment of comments) {
    if (comment.id === targetId) return true;
    if (comment.replies?.edges) {
      if (findCommentInTree(comment.replies.edges.map(e => e.node), targetId)) {
        return true;
      }
    }
  }
  return false;
}

// Helper to add a new comment to the tree
function addCommentToTree(comments: Comment[], newComment: Comment): Comment[] {
  // If it's a root comment, add to the beginning
  if (!newComment.parent?.id || newComment.depth === 0) {
    return [newComment, ...comments];
  }

  // Otherwise, find the parent and add as a reply
  return comments.map(comment => {
    // Check if this comment is the parent
    if (comment.id === newComment.parent?.id) {
      return {
        ...comment,
        replies: {
          edges: [...(comment.replies?.edges || []), { node: newComment, cursor: newComment.id }],
          pageInfo: comment.replies?.pageInfo || { hasNextPage: false, hasPreviousPage: false },
          totalCount: (comment.replies?.totalCount || 0) + 1
        }
      };
    }
    
    // Always check nested replies (even if currently empty, parent might be deeper)
    if (comment.replies?.edges) {
      const updatedEdges = comment.replies.edges.map(edge => ({
        ...edge,
        node: addCommentToTree([edge.node], newComment)[0]
      }));
      
      return {
        ...comment,
        replies: {
          ...comment.replies,
          edges: updatedEdges
        }
      };
    }
    
    return comment;
  });
}

// Helper to remove a comment from the tree
function removeCommentFromTree(comments: Comment[], commentId: string): Comment[] {
  return comments
    .filter(comment => comment.id !== commentId)
    .map(comment => {
      if (!comment.replies?.edges || comment.replies.edges.length === 0) {
        return comment;
      }
      const filteredEdges = comment.replies.edges
        .filter(edge => edge.node.id !== commentId)
        .map(edge => ({
          ...edge,
          node: removeCommentFromTree([edge.node], commentId)[0]
        }))
        .filter(edge => edge.node);
      
      return {
        ...comment,
        replies: {
          ...comment.replies,
          edges: filteredEdges,
          totalCount: filteredEdges.length
        }
      };
    });
}

// Helper to update vote count in tree
function updateVoteInTree(comments: Comment[], targetId: string, voteCount: number, userVote?: 'UPVOTE' | 'DOWNVOTE' | null): Comment[] {
  return comments.map(comment => {
    if (comment.id === targetId) {
      return { 
        ...comment, 
        voteCount,
        userVote: userVote !== undefined ? (userVote || undefined) : comment.userVote
      };
    }
    if (comment.replies?.edges && comment.replies.edges.length > 0) {
      return {
        ...comment,
        replies: {
          ...comment.replies,
          edges: comment.replies.edges.map(edge => ({
            ...edge,
            node: updateVoteInTree([edge.node], targetId, voteCount, userVote)[0]
          }))
        }
      };
    }
    return comment;
  });
}

export const CommentTree: React.FC<CommentTreeProps> = ({
  postId,
  className
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);

  // GraphQL query
  const { data, loading: graphqlLoading, error: graphqlError, refetch } = useQuery(GET_COMMENTS, {
    variables: {
      postId,
      first: 100
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
    
    // Create a complete User object for the author
    const authorUser: User = {
      id: commentData.author.id,
      username: commentData.author.username,
      avatarUrl: commentData.author.avatarUrl,
      email: '',
      reputation: 0,
      isVerified: false,
      createdAt: '',
      updatedAt: '',
    };

    // Create a minimal Post object for the comment
    const postForComment: Post = {
      id: commentData.postId,
      title: '',
      content: '',
      author: authorUser,
      comments: { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false }, totalCount: 0 },
      voteCount: 0,
      bookmarked: false,
      createdAt: '',
      updatedAt: '',
    };

    const newComment: Comment = {
      id: commentData.id,
      content: commentData.content,
      author: authorUser,
      post: postForComment,
      parent: commentData.parentId ? {
        id: commentData.parentId,
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
      depth: commentData.depth ?? (commentData.parentId ? 1 : 0),
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
      const exists = findCommentInTree(prev, newComment.id);
      
      if (!exists) {
        console.log('[CommentTree] Adding new comment to tree:', newComment.id, 'depth:', newComment.depth);
        return addCommentToTree(prev, newComment);
      }
      console.log('[CommentTree] Comment already exists, skipping:', newComment.id);
      return prev;
    });
  }, []);

  // Handle comment deletions from SSE
  const handleCommentDeleted = useCallback((commentData: { id: string; postId: string; parentId?: string | null }) => {
    console.log('[CommentTree] Comment deleted via SSE:', commentData);
    setComments(prev => removeCommentFromTree(prev, commentData.id));
  }, []);

  // Handle comment votes from SSE
  const handleCommentVoteUpdate = useCallback((update: { targetId: string; targetType: string; voteCount: number; userVote?: 'UPVOTE' | 'DOWNVOTE' | null }) => {
    console.log('[CommentTree] Comment vote update received via SSE:', update);
    
    if (update.targetType === 'comment') {
      setComments(prev => updateVoteInTree(prev, update.targetId, update.voteCount, update.userVote));
    }
  }, []);

  // Connect to SSE for live comment updates
  usePostSSE({
    postId,
    onCommentAdded: handleCommentAdded,
    onCommentDeleted: handleCommentDeleted,
    onVoteUpdate: handleCommentVoteUpdate,
    enabled: !!postId,
  });

  useEffect(() => {
    if (graphqlError) {
      console.error('GraphQL error loading comments:', graphqlError.message);
      setError('Failed to load comments');
      setLoading(false);
    } else if (data?.comments?.edges) {
      const allComments = data.comments.edges.map((edge: CommentEdge) => edge.node);
      setComments(getRootComments(allComments));
      setLoading(false);
    } else if (!graphqlLoading) {
      setComments([]);
      setLoading(false);
    }
  }, [data, graphqlError, graphqlLoading]);

  const handleLocalCommentDeleted = (commentId: string) => {
    setComments(prev => removeCommentFromTree(prev, commentId));
  };

  const handleCommentVote = (commentId: string, voteType: VoteType | null, voteCount?: number) => {
    const updateVote = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          return { 
            ...comment, 
            userVote: voteType || undefined,
            voteCount: voteCount !== undefined ? voteCount : comment.voteCount
          };
        }
        if (comment.replies?.edges && comment.replies.edges.length > 0) {
          return {
            ...comment,
            replies: {
              ...comment.replies,
              edges: comment.replies.edges.map(edge => ({
                ...edge,
                node: updateVote([edge.node])[0]
              }))
            }
          };
        }
        return comment;
      });
    };
    setComments(prev => updateVote(prev));
  };

  const handleReplyStart = (commentId: string) => {
    setReplyingToId(commentId);
  };

  const handleReplyCancel = () => {
    setReplyingToId(null);
  };

  const handleReplySuccess = async (parentId: string) => {
    setReplyingToId(null);
    if (refetch) {
      try {
        await refetch();
      } catch (error) {
        console.error('Failed to refetch comments:', error);
      }
    }
  };

  const handleTopLevelCommentSuccess = async () => {
    if (refetch) {
      try {
        await refetch();
      } catch (error) {
        console.error('Failed to refetch comments:', error);
      }
    }
  };

  // Count total comments including nested
  const totalCommentCount = useMemo(() => {
    const countNested = (comments: Comment[]): number => {
      return comments.reduce((acc, comment) => {
        const repliesCount = comment.replies?.edges 
          ? countNested(comment.replies.edges.map(e => e.node)) 
          : 0;
        return acc + 1 + repliesCount;
      }, 0);
    };
    return countNested(comments);
  }, [comments]);

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
      {/* Header with comment count */}
      <div className="flex items-center space-x-2 mb-6">
        <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {totalCommentCount} {totalCommentCount === 1 ? 'Comment' : 'Comments'}
        </h3>
      </div>

      {/* Top-level Comment Form */}
      {user && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <CommentForm
              postId={postId}
              onSuccess={handleTopLevelCommentSuccess}
              placeholder="Join the discussion..."
            />
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-5xl mb-4">💬</div>
              <p className="text-gray-600 dark:text-gray-400 text-center text-lg">
                No comments yet
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Be the first to share your thoughts!
              </p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment: Comment) => (
            <Card key={comment.id} padding="none" className="overflow-visible">
              <CardContent className="px-4 py-2">
                <CommentItem
                  comment={comment}
                  postId={postId}
                  onVote={handleCommentVote}
                  onDelete={handleLocalCommentDeleted}
                  onReplySuccess={handleReplySuccess}
                  replyingToId={replyingToId}
                  onReplyStart={handleReplyStart}
                  onReplyCancel={handleReplyCancel}
                  maxDepth={5}
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

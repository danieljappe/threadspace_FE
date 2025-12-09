'use client';

import React, { useState, useCallback } from 'react';
import { useMutation, useLazyQuery } from '@apollo/client/react';
import { Comment, VoteType, CommentEdge } from '@/types';
import { VoteButtons } from '@/components/ui/VoteButtons';
import { Avatar } from '@/components/ui/Avatar';
import { CommentForm } from './CommentForm';
import { useAuth } from '@/hooks/useAuth';
import { VOTE, REMOVE_VOTE, DELETE_COMMENT } from '@/graphql/mutations';
import { GET_COMMENT_REPLIES } from '@/graphql/queries';
import { formatDate, formatNumber } from '@/lib/utils';
import { 
  Trash2, 
  Reply,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onVote?: (commentId: string, voteType: VoteType | null) => void;
  onReplySuccess?: (parentId: string) => void;
  onDelete?: (commentId: string) => void;
  replyingToId?: string | null;
  onReplyStart?: (commentId: string) => void;
  onReplyCancel?: () => void;
  className?: string;
  maxDepth?: number;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postId,
  onVote,
  onReplySuccess,
  onDelete,
  replyingToId,
  onReplyStart,
  onReplyCancel,
  className,
  maxDepth = 5
}) => {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  
  // Pagination state for replies
  const [additionalReplies, setAdditionalReplies] = useState<CommentEdge[]>([]);
  const [currentEndCursor, setCurrentEndCursor] = useState<string | null>(null);
  const [loadedAll, setLoadedAll] = useState(false);

  const [voteMutation] = useMutation(VOTE);
  const [removeVoteMutation] = useMutation(REMOVE_VOTE);
  const [deleteComment, { loading: deleting }] = useMutation(DELETE_COMMENT);
  
  // Lazy query for loading more replies
  const [fetchMoreReplies, { loading: loadingMoreReplies }] = useLazyQuery(GET_COMMENT_REPLIES, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.comment?.replies?.edges) {
        const newReplies = data.comment.replies.edges;
        setAdditionalReplies(prev => [...prev, ...newReplies]);
        setCurrentEndCursor(data.comment.replies.pageInfo.endCursor);
        if (!data.comment.replies.pageInfo.hasNextPage) {
          setLoadedAll(true);
        }
      }
    }
  });

  // Check if current user is the author
  const isAuthor = user?.id === comment.author.id;
  const isReplyingToThis = replyingToId === comment.id;
  
  // Combine original replies with additionally loaded replies
  const originalReplies = comment.replies?.edges || [];
  const allReplies = [...originalReplies, ...additionalReplies];
  const hasReplies = allReplies.length > 0;
  const replyCount = comment.replies?.totalCount || 0;
  const displayedCount = allReplies.length;
  const remainingCount = Math.max(0, replyCount - displayedCount);
  const canReply = comment.depth < maxDepth;
  
  // Determine if there are more replies to load
  const initialHasMore = comment.replies?.pageInfo?.hasNextPage ?? false;
  const hasMoreBasedOnCount = remainingCount > 0;
  const canLoadMore = !loadedAll && (initialHasMore || hasMoreBasedOnCount);
  
  // Get the cursor for loading more
  const cursorForLoadMore = currentEndCursor || comment.replies?.pageInfo?.endCursor || null;
  
  // Handler for loading more replies
  const handleLoadMoreReplies = useCallback(() => {
    fetchMoreReplies({
      variables: {
        commentId: comment.id,
        first: 3,
        after: cursorForLoadMore
      }
    });
  }, [comment.id, cursorForLoadMore, fetchMoreReplies]);

  const handleVote = async (voteType: VoteType) => {
    try {
      const currentVote = comment.userVote;
      
      // If clicking the same vote type, remove the vote
      if (currentVote === voteType) {
        await removeVoteMutation({
          variables: {
            targetId: comment.id,
            targetType: 'COMMENT'
          }
        });
        onVote?.(comment.id, null);
      } else {
        // Otherwise, cast/update the vote
        const result = await voteMutation({
          variables: {
            targetId: comment.id,
            targetType: 'COMMENT',
            voteType
          }
        });
        
        if (result.data?.vote && onVote) {
          onVote(comment.id, voteType);
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const graphQLError = (error as { graphQLErrors?: Array<{ message?: string }> })?.graphQLErrors?.[0]?.message;
      if (errorMessage?.includes('not found') || graphQLError?.includes('not found')) {
        console.log('[CommentItem] Vote not found (may be race condition), SSE will sync state');
      } else {
        console.error('Vote failed:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteComment({
        variables: { id: comment.id }
      });
      onDelete?.(comment.id);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReply = () => {
    if (onReplyStart) {
      onReplyStart(comment.id);
    }
  };

  const handleReplySuccess = () => {
    onReplyCancel?.();
    onReplySuccess?.(comment.id);
    setShowReplies(true);
  };

  return (
    <div className={`${className}`}>
      {/* Main comment */}
      <div className="space-y-2">
        <div className="flex items-start space-x-3">
          <Avatar user={comment.author} size="sm" className="flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1">
              <span className="font-medium text-gray-900 dark:text-white">
                {comment.author.username}
              </span>
              {comment.author.isVerified && (
                <span className="text-blue-500" title="Verified user">
                  ✓
                </span>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  (edited)
                </span>
              )}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                • {formatNumber(comment.author.reputation)} rep
              </span>
              {comment.depth > 0 && comment.parent?.author && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  → replying to <span className="text-blue-600 dark:text-blue-400">{comment.parent.author.username}</span>
                </span>
              )}
            </div>

            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: comment.content }} />
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-4">
                <VoteButtons
                  voteCount={comment.voteCount}
                  userVote={comment.userVote}
                  onVote={handleVote}
                  size="sm"
                  orientation="horizontal"
                />
                
                {canReply && user && (
                  <button
                    onClick={handleReply}
                    className={`flex items-center space-x-1 transition-colors ${
                      isReplyingToThis 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                    }`}
                  >
                    <Reply className="h-4 w-4" />
                    <span className="text-sm">Reply</span>
                  </button>
                )}

                {hasReplies && (
                  <button
                    onClick={() => setShowReplies(!showReplies)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    {showReplies ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="text-sm">
                      {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                    </span>
                  </button>
                )}
              </div>
              
              {isAuthor && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Inline Reply Form */}
        {isReplyingToThis && (
          <div className="ml-10 mt-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Replying to <span className="font-medium text-gray-900 dark:text-white">{comment.author.username}</span>
            </div>
            <CommentForm
              postId={postId}
              parentId={comment.id}
              onSuccess={handleReplySuccess}
              onCancel={onReplyCancel}
              placeholder={`Reply to ${comment.author.username}...`}
            />
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {hasReplies && showReplies && (
        <div className="mt-3 space-y-3">
          {allReplies.map((edge) => (
            <div 
              key={edge.node.id}
              className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 ml-4"
            >
              <CommentItem
                comment={edge.node}
                postId={postId}
                onVote={onVote}
                onReplySuccess={onReplySuccess}
                onDelete={onDelete}
                replyingToId={replyingToId}
                onReplyStart={onReplyStart}
                onReplyCancel={onReplyCancel}
                maxDepth={maxDepth}
              />
            </div>
          ))}
          
          {/* Load More Replies Button */}
          {canLoadMore && (
            <div className="ml-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
              <button
                onClick={handleLoadMoreReplies}
                disabled={loadingMoreReplies}
                className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
              >
                {loadingMoreReplies ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>
                      {remainingCount > 0 
                        ? `Load ${Math.min(remainingCount, 3)} more ${remainingCount === 1 ? 'reply' : 'replies'}${remainingCount > 3 ? ` (${remainingCount} remaining)` : ''}`
                        : 'Load more replies'
                      }
                    </span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { Comment, VoteType } from '@/types';
import { VoteButtons } from '@/components/ui/VoteButtons';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { CommentForm } from './CommentForm';
import { useAuth } from '@/hooks/useAuth';
import { VOTE, REMOVE_VOTE, UPDATE_COMMENT, DELETE_COMMENT } from '@/graphql/mutations';
import { formatDate, formatNumber } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Reply,
  Check,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  onVote?: (commentId: string, voteType: VoteType) => void;
  onReplySuccess?: (parentId: string) => void;
  onEdit?: (commentId: string) => void;
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
  onEdit,
  onDelete,
  replyingToId,
  onReplyStart,
  onReplyCancel,
  className,
  maxDepth = 5
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const [voteMutation] = useMutation(VOTE);
  const [removeVoteMutation] = useMutation(REMOVE_VOTE);
  const [updateComment, { loading: updating }] = useMutation(UPDATE_COMMENT);
  const [deleteComment, { loading: deleting }] = useMutation(DELETE_COMMENT);

  // Check if current user is the author
  const isAuthor = user?.id === comment.author.id;
  const isReplyingToThis = replyingToId === comment.id;
  const replies = comment.replies?.edges || [];
  const hasReplies = replies.length > 0;
  const replyCount = comment.replies?.totalCount || replies.length || 0;
  const canReply = comment.depth < maxDepth;

  const handleVote = async (voteType: VoteType) => {
    try {
      const currentVote = comment.userVote;
      
      // If clicking the same vote type, remove the vote
      if (currentVote === voteType) {
        const result = await removeVoteMutation({
          variables: {
            targetId: comment.id,
            targetType: 'COMMENT'
          }
        });
      } else {
        // Otherwise, cast/update the vote
        const result = await voteMutation({
          variables: {
            targetId: comment.id,
            targetType: 'COMMENT',
            voteType
          }
        });
        
        // Update local comment state if mutation returned data
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
    setShowActions(false);
  };

  const handleSaveEdit = async () => {
    if (editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }

    try {
      await updateComment({
        variables: {
          id: comment.id,
          content: editContent.trim()
        }
      });
      setIsEditing(false);
      onEdit?.(comment.id);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
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
    setShowActions(false);
  };

  const handleReplySuccess = () => {
    onReplyCancel?.();
    onReplySuccess?.(comment.id);
    setShowReplies(true); // Make sure replies are visible after posting
  };

  // Calculate indentation based on depth (max 5 levels of visual indentation)
  const indentClass = comment.depth > 0 ? `ml-${Math.min(comment.depth * 4, 16)}` : '';

  return (
    <div className={`${className}`}>
      {/* Main comment */}
      <div className="space-y-2">
        <div className="flex items-start space-x-3">
          <Link href={ROUTES.USER(comment.author.username)}>
            <Avatar user={comment.author} size="sm" className="cursor-pointer flex-shrink-0" />
          </Link>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mb-1">
              <Link 
                href={ROUTES.USER(comment.author.username)}
                className="font-medium text-gray-900 dark:text-white hover:underline"
              >
                {comment.author.username}
              </Link>
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

            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  rows={3}
                  disabled={updating}
                />
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    loading={updating}
                    disabled={!editContent.trim() || editContent.trim() === comment.content}
                    leftIcon={<Check className="h-4 w-4" />}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={updating}
                    leftIcon={<X className="h-4 w-4" />}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: comment.content }} />
              </div>
            )}

            {!isEditing && (
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
                  <div className="relative">
                    <button
                      onClick={() => setShowActions(!showActions)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    
                    {showActions && (
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                        <button
                          onClick={handleEdit}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Edit className="h-4 w-4 mr-3" />
                          Edit
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={deleting}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4 mr-3" />
                          {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
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
          {replies.map((edge) => (
            <div 
              key={edge.node.id}
              className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 ml-4"
            >
              <CommentItem
                comment={edge.node}
                postId={postId}
                onVote={onVote}
                onReplySuccess={onReplySuccess}
                onEdit={onEdit}
                onDelete={onDelete}
                replyingToId={replyingToId}
                onReplyStart={onReplyStart}
                onReplyCancel={onReplyCancel}
                maxDepth={maxDepth}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

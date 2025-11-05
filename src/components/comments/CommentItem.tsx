'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { Comment, VoteType } from '@/types';
import { VoteButtons } from '@/components/ui/VoteButtons';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
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
  X
} from 'lucide-react';
import Link from 'next/link';

interface CommentItemProps {
  comment: Comment;
  onVote?: (commentId: string, voteType: VoteType) => void;
  onReply?: (parentId: string) => void;
  onEdit?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  className?: string;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onVote,
  onReply,
  onEdit,
  onDelete,
  className
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const [voteMutation] = useMutation(VOTE);
  const [removeVoteMutation] = useMutation(REMOVE_VOTE);
  const [updateComment, { loading: updating }] = useMutation(UPDATE_COMMENT);
  const [deleteComment, { loading: deleting }] = useMutation(DELETE_COMMENT);

  // Check if current user is the author
  const isAuthor = user?.id === comment.author.id;

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
        // Update local comment state
        if (onVote) {
          // Let parent know vote was removed (SSE will update voteCount)
          // Note: onVote doesn't accept null, but vote removal is handled by SSE
        }
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
      // If vote not found error when removing, it might have already been removed
      // This can happen with race conditions - SSE will sync the state
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
    onReply?.(comment.id);
    setShowActions(false);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-start space-x-3">
        <Link href={ROUTES.USER(comment.author.username)}>
          <Avatar user={comment.author} size="sm" className="cursor-pointer" />
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
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
              • {formatNumber(comment.author.reputation)} reputation
            </span>
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
              <VoteButtons
                voteCount={comment.voteCount}
                userVote={comment.userVote}
                onVote={handleVote}
                size="sm"
                orientation="horizontal"
              />
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleReply}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <Reply className="h-4 w-4" />
                  <span className="text-sm">Reply</span>
                </button>
                
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

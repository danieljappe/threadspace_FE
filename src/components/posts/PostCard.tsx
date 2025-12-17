'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/client/react';
import { Post, VoteType } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VoteButtons } from '@/components/ui/VoteButtons';
import { Avatar } from '@/components/ui/Avatar';
import { MarkdownRenderer } from '@/components/ui/MarkdownRenderer';
import { Modal } from '@/components/ui/Modal';
import { Input, Textarea } from '@/components/ui/Input';
import { VOTE, BOOKMARK_POST, UNBOOKMARK_POST, EDIT_POST } from '@/graphql/mutations';
import { usePostSSE } from '@/hooks/usePostSSE';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatNumber, truncateText, getErrorMessage } from '@/lib/utils';
import { ROUTES, MAX_LENGTHS } from '@/lib/constants';
import { 
  MessageCircle, 
  Bookmark, 
  BookmarkCheck,
  Edit2,
  Type
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  showFullContent?: boolean;
  onVote?: (postId: string, voteType: VoteType) => void;
  onBookmark?: (postId: string, bookmarked: boolean) => void;
  className?: string;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  showFullContent = false,
  onVote,
  onBookmark,
  className
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(showFullContent);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [voteCount, setVoteCount] = useState(post.voteCount);
  const [userVote, setUserVote] = useState(post.userVote);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content);
  const [editError, setEditError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [voteMutation] = useMutation(VOTE);
  const [bookmarkMutation] = useMutation(BOOKMARK_POST);
  const [unbookmarkMutation] = useMutation(UNBOOKMARK_POST);
  const [editPost, { loading: isEditingPost }] = useMutation(EDIT_POST);

  // Check if current user is the author
  const isAuthor = user?.id === post.author.id;

  // Handle real-time vote updates via SSE
  const handleVoteUpdate = useCallback((update: { voteCount: number; userVote?: 'UPVOTE' | 'DOWNVOTE' | null }) => {
    setVoteCount(update.voteCount);
    if (update.userVote !== undefined && update.userVote !== null) {
      setUserVote(update.userVote as VoteType);
    } else if (update.userVote === null) {
      setUserVote(undefined);
    }
  }, []);

  // Subscribe to real-time vote updates for this post via SSE
  usePostSSE({
    postId: post.id,
    onVoteUpdate: handleVoteUpdate,
    enabled: true,
  });

  const handleVote = async (voteType: VoteType) => {
    try {
      await voteMutation({
        variables: {
          targetId: post.id,
          targetType: 'POST',
          voteType
        }
      });
      onVote?.(post.id, voteType);
    } catch (error) {
      console.error('Vote failed:', error);
    }
  };

  const handleBookmark = async () => {
    if (isBookmarking) return;
    
    setIsBookmarking(true);
    try {
      if (post.bookmarked) {
        await unbookmarkMutation({
          variables: { postId: post.id }
        });
        onBookmark?.(post.id, false);
      } else {
        await bookmarkMutation({
          variables: { postId: post.id }
        });
        onBookmark?.(post.id, true);
      }
    } catch (error) {
      console.error('Bookmark failed:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

  const handleEdit = () => {
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditError('');
    setValidationErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditError('');
    setValidationErrors({});
  };

  const validateEdit = (): boolean => {
    const errors: Record<string, string> = {};

    if (!editTitle.trim()) {
      errors.title = 'Title is required';
    } else if (editTitle.length > MAX_LENGTHS.POST_TITLE) {
      errors.title = `Title must be ${MAX_LENGTHS.POST_TITLE} characters or less`;
    }

    if (!editContent.trim()) {
      errors.content = 'Content is required';
    } else if (editContent.length > MAX_LENGTHS.POST_CONTENT) {
      errors.content = `Content must be ${MAX_LENGTHS.POST_CONTENT} characters or less`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = async () => {
    if (!validateEdit()) {
      return;
    }

    try {
      const { data } = await editPost({
        variables: {
          input: {
            id: post.id,
            title: editTitle.trim(),
            content: editContent.trim()
          }
        }
      });

      if (data?.editPost) {
        setIsEditing(false);
        // The post will be updated via Apollo cache
        window.location.reload(); // Simple refresh to show updated content
      }
    } catch (error) {
      setEditError(getErrorMessage(error));
    }
  };

  const content = isExpanded ? post.content : truncateText(post.content, 200);
  const shouldShowReadMore = !isExpanded && post.content.length > 200;

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar user={post.author} size="md" className="cursor-pointer" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {post.author.username}
                </span>
                {post.author.isVerified && (
                  <span className="text-blue-500" title="Verified user">
                    ✓
                  </span>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(post.createdAt)}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatNumber(post.author.reputation)} reputation
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isAuthor && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                leftIcon={<Edit2 className="h-4 w-4" />}
              >
                Edit
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              loading={isBookmarking}
              leftIcon={
                post.bookmarked ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )
              }
            >
              {post.bookmarked ? 'Saved' : 'Save'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Link href={ROUTES.POST(post.id)}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {post.title}
          </h2>
        </Link>
        
        <MarkdownRenderer content={content} proseSize="sm" />
        
        {shouldShowReadMore && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium mt-2"
          >
            Read more
          </button>
        )}
      </CardContent>

      <CardFooter>
        <div className="flex items-center justify-between w-full">
          <VoteButtons
            voteCount={voteCount}
            userVote={userVote}
            onVote={handleVote}
            size="md"
            orientation="horizontal"
          />
          
          <Link
            href={ROUTES.POST(post.id)}
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm">
              {post.comments?.totalCount !== undefined 
                ? `${formatNumber(post.comments.totalCount)} ${post.comments.totalCount === 1 ? 'comment' : 'comments'}`
                : 'View comments'}
            </span>
          </Link>
        </div>
      </CardFooter>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditing}
        onClose={handleCancelEdit}
        title="Edit Post"
        size="lg"
      >
        <div className="space-y-4">
          {editError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
              {editError}
            </div>
          )}

          <Input
            type="text"
            label="Title"
            placeholder="What's your post about?"
            value={editTitle}
            onChange={(e) => {
              setEditTitle(e.target.value);
              if (validationErrors.title) {
                setValidationErrors(prev => ({ ...prev, title: '' }));
              }
            }}
            leftIcon={<Type className="h-4 w-4" />}
            error={validationErrors.title}
            helperText={`${editTitle.length}/${MAX_LENGTHS.POST_TITLE} characters`}
            required
            disabled={isEditingPost}
          />

          <Textarea
            label="Content"
            placeholder="Share your thoughts, ideas, or questions..."
            value={editContent}
            onChange={(e) => {
              setEditContent(e.target.value);
              if (validationErrors.content) {
                setValidationErrors(prev => ({ ...prev, content: '' }));
              }
            }}
            rows={8}
            error={validationErrors.content}
            helperText={`${editContent.length}/${MAX_LENGTHS.POST_CONTENT} characters`}
            required
            disabled={isEditingPost}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isEditingPost}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              loading={isEditingPost}
              disabled={isEditingPost || !editTitle.trim() || !editContent.trim()}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

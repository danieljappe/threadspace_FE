'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/client/react';
import { Post, VoteType } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VoteButtons } from '@/components/ui/VoteButtons';
import { Avatar } from '@/components/ui/Avatar';
import { VOTE, BOOKMARK_POST, UNBOOKMARK_POST } from '@/graphql/mutations';
import { usePostSSE } from '@/hooks/usePostSSE';
import { formatDate, formatNumber, truncateText } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import { 
  MessageCircle, 
  Eye, 
  Bookmark, 
  BookmarkCheck, 
  MoreHorizontal,
  Pin,
  Lock
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
  const [isExpanded, setIsExpanded] = useState(showFullContent);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [voteCount, setVoteCount] = useState(post.voteCount);
  const [userVote, setUserVote] = useState(post.userVote);

  const [voteMutation] = useMutation(VOTE);
  const [bookmarkMutation] = useMutation(BOOKMARK_POST);
  const [unbookmarkMutation] = useMutation(UNBOOKMARK_POST);

  // Handle real-time vote updates via SSE
  const handleVoteUpdate = useCallback((update: { voteCount: number; userVote?: 'UPVOTE' | 'DOWNVOTE' | null }) => {
    setVoteCount(update.voteCount);
    // Only update userVote if it's provided (SSE updates for other users' votes won't include userVote)
    // Convert string literals to VoteType enum and null to undefined
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

  const content = isExpanded ? post.content : truncateText(post.content, 200);
  const shouldShowReadMore = !isExpanded && post.content.length > 200;

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Link href={ROUTES.USER(post.author.username)}>
              <Avatar user={post.author} size="md" className="cursor-pointer" />
            </Link>
            <div>
              <div className="flex items-center space-x-2">
                <Link 
                  href={ROUTES.USER(post.author.username)}
                  className="font-semibold text-gray-900 dark:text-white hover:underline"
                >
                  {post.author.username}
                </Link>
                {post.author.isVerified && (
                  <span className="text-blue-500" title="Verified user">
                    ✓
                  </span>
                )}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(post.createdAt)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{formatNumber(post.author.reputation)} reputation</span>
                {post.isPinned && (
                  <span className="flex items-center text-blue-600 dark:text-blue-400">
                    <Pin className="h-3 w-3 mr-1" />
                    Pinned
                  </span>
                )}
                {post.isLocked && (
                  <span className="flex items-center text-red-600 dark:text-red-400">
                    <Lock className="h-3 w-3 mr-1" />
                    Locked
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
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
            
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Topics */}
        {post.topics && post.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.topics.map((topic) => (
              <Link
                key={topic.id}
                href={ROUTES.TOPIC(topic.slug)}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white hover:opacity-80 transition-opacity"
                style={{ backgroundColor: topic.color || '#6B7280' }}
              >
                #{topic.name}
              </Link>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Link href={ROUTES.POST(post.id)}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {post.title}
          </h2>
        </Link>
        
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
        
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
          
          <div className="flex items-center space-x-4">
            <Link
              href={ROUTES.POST(post.id)}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm">
                {post.comments.pageInfo.hasNextPage ? 'View comments' : 'No comments'}
              </span>
            </Link>
            
            <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
              <Eye className="h-4 w-4" />
              <span className="text-sm">{formatNumber(post.views)}</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

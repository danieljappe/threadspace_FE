'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_POST } from '@/graphql/queries';
import { VOTE, REMOVE_VOTE, BOOKMARK_POST, UNBOOKMARK_POST } from '@/graphql/mutations';
import { Post, VoteType } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { CommentTree } from '@/components/comments/CommentTree';
import { VoteButtons } from '@/components/ui/VoteButtons';
import { Avatar } from '@/components/ui/Avatar';
import { Loader2, AlertCircle, ArrowLeft, Bookmark, Eye, Calendar } from 'lucide-react';
import { ROUTES, ERROR_MESSAGES } from '@/lib/constants';
import { usePostSSE } from '@/hooks/usePostSSE';
import Link from 'next/link';

interface PostPageClientProps {
  postId: string;
}

export function PostPageClient({ postId }: PostPageClientProps) {
  const router = useRouter();
  const [voteCount, setVoteCount] = useState<number | null>(null);
  const [userVote, setUserVote] = useState<VoteType | null | undefined>(undefined);
  const [isBookmarked, setIsBookmarked] = useState<boolean | null>(null);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const { data, loading, error, refetch } = useQuery<{ post: Post }>(GET_POST, {
    variables: { id: postId },
    errorPolicy: 'all',
  });

  const [voteMutation] = useMutation(VOTE);
  const [removeVoteMutation] = useMutation(REMOVE_VOTE);
  const [bookmarkMutation] = useMutation(BOOKMARK_POST);
  const [unbookmarkMutation] = useMutation(UNBOOKMARK_POST);

  // Set initial state from query data
  useEffect(() => {
    if (data?.post) {
      if (voteCount === null) {
        setVoteCount(data.post.voteCount);
      }
      if (userVote === undefined) {
        setUserVote(data.post.userVote);
      }
      if (isBookmarked === null) {
        setIsBookmarked(data.post.bookmarked);
      }
    }
  }, [data?.post, voteCount, userVote, isBookmarked]);

  // Handle bookmark toggle
  const handleBookmark = async () => {
    if (isBookmarking) return;
    
    setIsBookmarking(true);
    try {
      const currentlyBookmarked = isBookmarked ?? data?.post?.bookmarked ?? false;
      
      if (currentlyBookmarked) {
        await unbookmarkMutation({
          variables: { postId }
        });
        setIsBookmarked(false);
      } else {
        await bookmarkMutation({
          variables: { postId }
        });
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Bookmark failed:', error);
    } finally {
      setIsBookmarking(false);
    }
  };

  // Memoize callbacks to prevent unnecessary re-renders and connection drops
  const handleVoteUpdate = useCallback((update: { voteCount: number }) => {
    console.log('[PostPageClient] Vote update received via SSE:', update);
    setVoteCount(update.voteCount);
    // Note: SSE updates don't include the current user's vote, so we don't update userVote from SSE
    // The userVote will be updated when the user themselves votes
  }, []);

  const handleCommentAdded = useCallback((comment: { id: string; content: string; author: { id: string; username: string; avatarUrl?: string }; postId: string; parentId?: string | null; depth?: number; createdAt: string }) => {
    console.log('[PostPageClient] Comment added via SSE:', comment);
    // Refetch the post to update comment count
    // The CommentTree component will handle adding the comment to the list
    refetch().catch(err => {
      console.error('[PostPageClient] Failed to refetch post after comment:', err);
    });
  }, [refetch]);

  const handleCommentDeleted = useCallback((comment: { id: string; postId: string; parentId?: string | null }) => {
    console.log('[PostPageClient] Comment deleted via SSE:', comment);
    // Refetch the post to update comment count
    refetch().catch(err => {
      console.error('[PostPageClient] Failed to refetch post after comment deletion:', err);
    });
  }, [refetch]);

  const handleSSEError = useCallback((error: Error) => {
    console.error('[PostPageClient] SSE error:', error);
  }, []);

  // Connect to SSE for live updates (votes, comments)
  // Enable SSE as soon as we have a postId, don't wait for data to load
  usePostSSE({
    postId,
    onVoteUpdate: handleVoteUpdate,
    onCommentAdded: handleCommentAdded,
    onCommentDeleted: handleCommentDeleted,
    onError: handleSSEError,
    enabled: !!postId, // Enable as long as we have a postId
  });

  useEffect(() => {
    if (error && error.message.includes('not found')) {
      // Redirect to not found page after a short delay
      setTimeout(() => {
        router.push('/not-found');
      }, 2000);
    }
  }, [error, router]);

  if (!postId) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Invalid post ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {error?.message || ERROR_MESSAGES.NOT_FOUND}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error?.message?.includes('not found') 
                ? 'This post may have been deleted or does not exist.' 
                : 'Unable to load the post. Please try again.'}
            </p>
            <Link
              href={ROUTES.HOME}
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go back home</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const post = data.post as Post;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to posts</span>
        </Link>

        {/* Post Card */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar
                  src={post.author.avatarUrl}
                  alt={post.author.username}
                  size="md"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={ROUTES.USER(post.author.username)}
                      className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {post.author.username}
                    </Link>
                    {post.author.isVerified && (
                      <span className="text-blue-600 dark:text-blue-400" title="Verified">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(post.createdAt)}</span>
                    {post.updatedAt !== post.createdAt && (
                      <span className="text-xs">(edited)</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                  {post.threadType}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>

            {/* Topics */}
            {post.topics && post.topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.topics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={ROUTES.TOPIC(topic.slug)}
                    className="px-3 py-1 text-sm font-medium rounded-full"
                    style={{
                      backgroundColor: topic.color ? `${topic.color}20` : '#e5e7eb',
                      color: topic.color || '#374151',
                    }}
                  >
                    {topic.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert mb-6">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <VoteButtons
                voteCount={voteCount ?? post.voteCount}
                userVote={userVote !== undefined ? (userVote ?? undefined) : post.userVote}
                onVote={async (voteType) => {
                  try {
                    const currentVote = userVote !== undefined ? (userVote ?? undefined) : post.userVote;
                    
                    // If clicking the same vote type, remove the vote
                    if (currentVote === voteType) {
                      await removeVoteMutation({
                        variables: {
                          targetId: post.id,
                          targetType: 'POST',
                        },
                      });
                      setUserVote(undefined);
                      // SSE will update the vote count automatically
                    } else {
                      // Otherwise, cast the vote
                      const result = await voteMutation({
                        variables: {
                          targetId: post.id,
                          targetType: 'POST',
                          voteType,
                        },
                      });
                      
                      if (result.data?.vote) {
                        setVoteCount(result.data.vote.voteCount);
                        setUserVote(result.data.vote.userVote);
                      }
                    }
                  } catch (error) {
                    console.error('Vote failed:', error);
                  }
                }}
                size="lg"
                orientation="horizontal"
              />

              <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">{formatNumber(post.views)}</span>
                </div>
                <button
                  onClick={handleBookmark}
                  disabled={isBookmarking}
                  className={`flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 ${
                    (isBookmarked ?? post.bookmarked) ? 'text-blue-600 dark:text-blue-400' : ''
                  }`}
                >
                  <Bookmark className={`h-4 w-4 ${(isBookmarked ?? post.bookmarked) ? 'fill-current' : ''}`} />
                  <span className="text-sm">
                    {isBookmarking ? 'Saving...' : (isBookmarked ?? post.bookmarked) ? 'Saved' : 'Bookmark'}
                  </span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Comments ({post.comments?.totalCount || 0})
            </h2>
          </CardHeader>
          <CardContent>
            <CommentTree postId={post.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


'use client';

import React from 'react';
import { VoteType } from '@/types';
import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  voteCount: number;
  userVote?: VoteType;
  onVote: (voteType: VoteType) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
}

const sizeClasses = {
  sm: {
    button: 'h-6 w-6',
    icon: 'h-3 w-3',
    text: 'text-xs'
  },
  md: {
    button: 'h-8 w-8',
    icon: 'h-4 w-4',
    text: 'text-sm'
  },
  lg: {
    button: 'h-10 w-10',
    icon: 'h-5 w-5',
    text: 'text-base'
  }
};

export const VoteButtons: React.FC<VoteButtonsProps> = ({
  voteCount,
  userVote,
  onVote,
  disabled = false,
  size = 'md',
  orientation = 'vertical'
}) => {
  const handleUpvote = () => {
    if (disabled) return;
    onVote(VoteType.UPVOTE);
  };

  const handleDownvote = () => {
    if (disabled) return;
    onVote(VoteType.DOWNVOTE);
  };

  const isUpvoted = userVote === VoteType.UPVOTE;
  const isDownvoted = userVote === VoteType.DOWNVOTE;

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        orientation === 'vertical' ? 'flex-col' : 'flex-row'
      )}
    >
      {/* Upvote Button */}
      <button
        onClick={handleUpvote}
        disabled={disabled}
        className={cn(
          'flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
          sizeClasses[size].button,
          isUpvoted
            ? 'bg-green-100 text-green-600 hover:bg-green-200 focus:ring-green-500'
            : 'text-gray-400 hover:text-green-600 hover:bg-green-50 focus:ring-green-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        title="Upvote"
      >
        <svg
          className={sizeClasses[size].icon}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Vote Count */}
      <span
        className={cn(
          'font-medium text-gray-700 dark:text-gray-300 min-w-[1.5rem] text-center',
          sizeClasses[size].text,
          isUpvoted && 'text-green-600',
          isDownvoted && 'text-red-600'
        )}
      >
        {voteCount}
      </span>

      {/* Downvote Button */}
      <button
        onClick={handleDownvote}
        disabled={disabled}
        className={cn(
          'flex items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
          sizeClasses[size].button,
          isDownvoted
            ? 'bg-red-100 text-red-600 hover:bg-red-200 focus:ring-red-500'
            : 'text-gray-400 hover:text-red-600 hover:bg-red-50 focus:ring-red-500',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        title="Downvote"
      >
        <svg
          className={sizeClasses[size].icon}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};
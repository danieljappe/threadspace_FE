'use client';

import React from 'react';
import { User } from '@/types';
import { cn } from '@/lib/utils';

interface AvatarProps {
  user?: User;
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg'
};

export const Avatar: React.FC<AvatarProps> = ({
  user,
  src,
  alt,
  size = 'md',
  className,
  onClick
}) => {
  const avatarSrc = src || user?.avatarUrl;
  const displayName = alt || user?.username || 'User';
  const initials = displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium select-none',
        sizeClasses[size],
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={displayName}
          className="h-full w-full rounded-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = initials;
            }
          }}
        />
      ) : (
        <span className="font-semibold">{initials}</span>
      )}
    </div>
  );
};

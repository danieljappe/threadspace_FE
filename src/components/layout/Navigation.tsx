'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Hash, TrendingUp, Users, Bookmark, Bell } from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  disabled?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Home',
    href: '/main',
    icon: Home,
  },
  {
    name: 'Topics',
    href: '/main/topics',
    icon: Hash,
    disabled: true,
  },
  {
    name: 'Trending',
    href: '/main/trending',
    icon: TrendingUp,
    disabled: true,
  },
  {
    name: 'People',
    href: '/main/people',
    icon: Users,
    disabled: true,
  },
  {
    name: 'Bookmarks',
    href: '/main/bookmarks',
    icon: Bookmark,
  },
  {
    name: 'Notifications',
    href: '/main/notifications',
    icon: Bell,
    disabled: true,
  },
];

interface NavigationProps {
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const pathname = usePathname();

  return (
    <nav className={cn('space-y-1', className)}>
      {navigationItems.map((item) => {
        const isActive = pathname === item.href || 
          (item.href !== '/main' && pathname.startsWith(item.href));
        
        if (item.disabled) {
          return (
            <div
              key={item.name}
              className="group flex items-center px-3 py-2 text-sm font-medium rounded-lg cursor-not-allowed opacity-50"
            >
              <item.icon
                className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400"
              />
              <span className="flex-1 text-gray-500 dark:text-gray-500">{item.name}</span>
              <span className="ml-2 text-[10px] font-medium text-gray-400 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                Soon
              </span>
            </div>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
              isActive
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
            )}
          >
            <item.icon
              className={cn(
                'mr-3 h-5 w-5 flex-shrink-0',
                isActive
                  ? 'text-blue-500 dark:text-blue-400'
                  : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
              )}
            />
            <span className="flex-1">{item.name}</span>
            {item.count && item.count > 0 && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                {item.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

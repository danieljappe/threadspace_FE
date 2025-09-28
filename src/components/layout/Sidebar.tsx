'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from './Navigation';
import { GET_TOPICS } from '@/graphql/queries';
import { useMockData } from '@/lib/mock-provider';
import { Topic } from '@/types';
import { cn } from '@/lib/utils';
import { Hash, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  className, 
  isOpen = true, 
  onClose 
}) => {
  const { user } = useAuth();
  const mockData = useMockData();
  const [searchQuery, setSearchQuery] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);

  // Try GraphQL query first
  const { data, loading: graphqlLoading, error: graphqlError } = useQuery(GET_TOPICS, {
    variables: {
      search: searchQuery || undefined,
      first: 20
    },
    skip: !user // Only fetch if user is logged in
  });

  useEffect(() => {
    if (graphqlError) {
      // If GraphQL fails, use mock data
      console.log('GraphQL failed, using mock data for topics:', graphqlError.message);
      setUseMock(true);
      const mockTopics = mockData.getTopics(searchQuery);
      setTopics(mockTopics);
      setLoading(false);
    } else if (data?.topics?.edges) {
      // Use real data
      setUseMock(false);
      const realTopics = data.topics.edges.map((edge: { node: Topic }) => edge.node);
      setTopics(realTopics);
      setLoading(false);
    } else if (!graphqlLoading && user) {
      // If no data and not loading, use mock data
      setUseMock(true);
      const mockTopics = mockData.getTopics(searchQuery);
      setTopics(mockTopics);
      setLoading(false);
    } else if (!user) {
      setLoading(false);
    }
  }, [data, graphqlError, graphqlLoading, searchQuery, user, mockData]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Menu
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <Navigation />
          </div>

          {/* Topics Section */}
          {user && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Popular Topics
                </h3>
                
                {/* Search Topics */}
                <div className="mb-3">
                  <Input
                    type="search"
                    placeholder="Search topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<Search className="h-4 w-4" />}
                  />
                </div>

                {/* Topics List */}
                <div className="space-y-1">
                  {loading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="animate-pulse flex items-center space-x-3"
                        >
                          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      {useMock && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 mb-2">
                          <p className="text-xs text-blue-800 dark:text-blue-200">
                            📡 Using mock data
                          </p>
                        </div>
                      )}
                      {topics.map((topic: Topic, index: number) => (
                        <a
                          key={topic.id}
                          href={`/main/topic/${topic.slug}`}
                          className="group flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="h-3 w-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: topic.color || '#6B7280' }}
                            />
                            <span className="truncate">#{topic.name}</span>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {Number(topic.subscriberCount) || 0}
                          </span>
                        </a>
                      ))}
                    </>
                  )}
                </div>

                {!loading && topics.length === 0 && searchQuery && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No topics found for &quot;{searchQuery}&quot;
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
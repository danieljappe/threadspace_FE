'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'next/navigation';
import { GET_TOPIC } from '@/graphql/queries';
import { useMockData } from '@/lib/mock-provider';
import { PostList } from '@/components/posts/PostList';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, AlertCircle, Hash, Users, Plus } from 'lucide-react';
import { ROUTES, PostOrder } from '@/lib/constants';
import { Topic } from '@/types';

export default function TopicPage() {
  const params = useParams();
  const slug = params.slug as string;
  const mockData = useMockData();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);
  const [orderBy, setOrderBy] = useState<PostOrder>(PostOrder.NEWEST);

  // Try GraphQL query first
  const { data, loading: graphqlLoading, error: graphqlError } = useQuery(GET_TOPIC, {
    variables: { slug },
    errorPolicy: 'all'
  });

  useEffect(() => {
    if (graphqlError) {
      // If GraphQL fails, use mock data
      console.log('GraphQL failed, using mock data for topic:', graphqlError.message);
      setUseMock(true);
      const mockTopic = mockData.getTopic(slug);
      if (mockTopic) {
        setTopic(mockTopic);
      } else {
        setError('Topic not found');
      }
      setLoading(false);
    } else if (data?.topic) {
      // Use real data
      setUseMock(false);
      setTopic(data.topic);
      setLoading(false);
    } else if (!graphqlLoading) {
      // If no data and not loading, use mock data
      setUseMock(true);
      const mockTopic = mockData.getTopic(slug);
      if (mockTopic) {
        setTopic(mockTopic);
      } else {
        setError('Topic not found');
      }
      setLoading(false);
    }
  }, [data, graphqlError, graphqlLoading, slug, mockData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">Loading topic...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Failed to load topic
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!topic) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">#</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Topic not found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            The topic you&apos;re looking for doesn&apos;t exist.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mock Data Notice */}
      {useMock && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📡 Using mock data - GraphQL API is not available
          </p>
        </div>
      )}

      {/* Topic Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                style={{ backgroundColor: topic.color || '#6B7280' }}
              >
                <Hash className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  #{topic.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {topic.description}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{topic.subscriberCount || 0} subscribers</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={topic.isSubscribed ? "primary" : "outline"}
                size="sm"
              >
                {topic.isSubscribed ? 'Subscribed' : 'Subscribe'}
              </Button>
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                size="sm"
                onClick={() => window.location.href = ROUTES.CREATE_POST}
              >
                Create Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Posts in #{topic.name}
            </h2>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value as PostOrder)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={PostOrder.NEWEST}>Newest</option>
              <option value={PostOrder.TRENDING}>Trending</option>
              <option value={PostOrder.TOP}>Top</option>
              <option value={PostOrder.OLDEST}>Oldest</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <PostList
        topicId={topic.id}
        orderBy={orderBy}
      />
    </div>
  );
}
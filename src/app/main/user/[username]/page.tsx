'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'next/navigation';
import { GET_USER } from '@/graphql/queries';
import { useMockData } from '@/lib/mock-provider';
import { PostList } from '@/components/posts/PostList';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Loader2, AlertCircle, User, Calendar, Award, MessageSquare } from 'lucide-react';
import { PostOrder } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const mockData = useMockData();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);
  const [orderBy, setOrderBy] = useState<PostOrder>(PostOrder.NEWEST);

  // Try GraphQL query first
  const { data, loading: graphqlLoading, error: graphqlError } = useQuery(GET_USER, {
    variables: { username },
    errorPolicy: 'all'
  });

  useEffect(() => {
    if (graphqlError) {
      // If GraphQL fails, use mock data
      console.log('GraphQL failed, using mock data for user:', graphqlError.message);
      setUseMock(true);
      const mockUser = mockData.getUser(username);
      if (mockUser) {
        setUser(mockUser);
      } else {
        setError('User not found');
      }
      setLoading(false);
    } else if (data?.user) {
      // Use real data
      setUseMock(false);
      setUser(data.user);
      setLoading(false);
    } else if (!graphqlLoading) {
      // If no data and not loading, use mock data
      setUseMock(true);
      const mockUser = mockData.getUser(username);
      if (mockUser) {
        setUser(mockUser);
      } else {
        setError('User not found');
      }
      setLoading(false);
    }
  }, [data, graphqlError, graphqlLoading, username, mockData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">Loading profile...</span>
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
            Failed to load profile
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

  if (!user) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            User not found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            The user you're looking for doesn't exist.
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

      {/* User Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <Avatar
              src={user.avatarUrl}
              alt={user.username}
              size="lg"
              className="flex-shrink-0"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.username}
                  </h1>
                  {user.isVerified && (
                    <div className="flex items-center space-x-1 mt-1">
                      <Award className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Verified User
                      </span>
                    </div>
                  )}
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {user.bio || 'No bio available'}
                  </p>
                </div>
                
                <Button variant="outline" size="sm">
                  Follow
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span>{user.reputation || 0} reputation</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4" />
                  <span>0 posts</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Posts by {user.username}
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
        authorId={user.id}
        orderBy={orderBy}
      />
    </div>
  );
}
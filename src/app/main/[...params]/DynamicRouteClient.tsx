'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { GET_POST, GET_TOPIC, GET_USER } from '@/graphql/queries';
import { useMockData } from '@/lib/mock-provider';
import { PostCard } from '@/components/posts/PostCard';
import { PostList } from '@/components/posts/PostList';
import { CommentTree } from '@/components/comments/CommentTree';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Loader2, AlertCircle, Calendar, Award, Hash, Users, Plus } from 'lucide-react';
import { PostOrder } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { Post, Topic, User } from '@/types';

export function DynamicRouteClient() {
  const params = useParams();
  const routeParams = params.params as string[];
  const mockData = useMockData();

  // Determine the route type and ID
  const routeType = routeParams?.[0];
  const routeId = routeParams?.[1];

  if (routeType === 'post' && routeId) {
    return <PostPage postId={routeId} mockData={mockData} />;
  }
  
  if (routeType === 'topic' && routeId) {
    return <TopicPage slug={routeId} mockData={mockData} />;
  }
  
  if (routeType === 'user' && routeId) {
    return <UserProfilePage username={routeId} mockData={mockData} />;
  }

  // Fallback to 404
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    </div>
  );
}

// Post Page Component
function PostPage({ postId, mockData }: { postId: string; mockData: { getPost: (id: string) => Post | undefined } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);

  const { data, loading: graphqlLoading, error: graphqlError } = useQuery(GET_POST, {
    variables: { id: postId },
    errorPolicy: 'all'
  });

  useEffect(() => {
    if (graphqlError) {
      console.log('GraphQL failed, using mock data for post:', graphqlError.message);
      setUseMock(true);
      const mockPost = mockData.getPost(postId);
      if (mockPost) {
        setPost(mockPost);
      } else {
        setError('Post not found');
      }
      setLoading(false);
    } else if (data?.post) {
      setUseMock(false);
      setPost(data.post);
      setLoading(false);
    } else if (!graphqlLoading) {
      setUseMock(true);
      const mockPost = mockData.getPost(postId);
      if (mockPost) {
        setPost(mockPost);
      } else {
        setError('Post not found');
      }
      setLoading(false);
    }
  }, [data, graphqlError, graphqlLoading, postId, mockData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
              <span className="text-gray-600 dark:text-gray-400">Loading post...</span>
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
            Failed to load post
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

  if (!post) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Post not found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            The post you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {useMock && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📡 Using mock data - GraphQL API is not available
          </p>
        </div>
      )}
      <PostCard post={post} showFullContent={true} />
      <CommentTree postId={postId} />
    </div>
  );
}

// Topic Page Component
function TopicPage({ slug, mockData }: { slug: string; mockData: { getTopic: (slug: string) => Topic | undefined } }) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);
  const [orderBy] = useState<PostOrder>(PostOrder.NEWEST);

  const { data, loading: graphqlLoading, error: graphqlError } = useQuery(GET_TOPIC, {
    variables: { slug },
    errorPolicy: 'all'
  });

  useEffect(() => {
    if (graphqlError) {
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
      setUseMock(false);
      setTopic(data.topic);
      setLoading(false);
    } else if (!graphqlLoading) {
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
      {useMock && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📡 Using mock data - GraphQL API is not available
          </p>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Hash className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  #{topic.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {topic.description || 'No description available'}
                </p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{topic.subscriberCount} subscribers</span>
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
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <PostList topicId={topic.id} orderBy={orderBy} />
    </div>
  );
}

// User Profile Page Component
function UserProfilePage({ username, mockData }: { username: string; mockData: { getUser: (username: string) => User | undefined } }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(false);
  const [orderBy] = useState<PostOrder>(PostOrder.NEWEST);

  const { data, loading: graphqlLoading, error: graphqlError } = useQuery(GET_USER, {
    variables: { username },
    errorPolicy: 'all'
  });

  useEffect(() => {
    if (graphqlError) {
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
      setUseMock(false);
      setUser(data.user);
      setLoading(false);
    } else if (!graphqlLoading) {
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
              <span className="text-gray-600 dark:text-gray-400">Loading user...</span>
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
            Failed to load user
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
            The user you&apos;re looking for doesn&apos;t exist.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {useMock && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            📡 Using mock data - GraphQL API is not available
          </p>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar
                src={user.avatarUrl}
                alt={user.username}
                size="lg"
              />
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
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="h-4 w-4" />
                    <span>{user.reputation} reputation</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button variant="outline" size="sm">
              Follow
            </Button>
          </div>
        </CardContent>
      </Card>

      <PostList authorId={user.id} orderBy={orderBy} />
    </div>
  );
}

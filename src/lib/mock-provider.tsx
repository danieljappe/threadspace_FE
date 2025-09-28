'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { 
  mockPosts, 
  mockTopics, 
  mockUsers, 
  mockComments,
  getMockPosts,
  getMockTopics,
  getMockUser,
  getMockPost,
  getMockComments
} from './mock-data';
import { Post, Topic, User, Comment, PostOrder } from '@/types';

interface MockDataContextType {
  // Posts
  getPosts: (filters?: {
    topicId?: string;
    authorId?: string;
    search?: string;
    orderBy?: PostOrder;
    limit?: number;
  }) => Post[];
  getPost: (id: string) => Post | undefined;
  
  // Topics
  getTopics: (search?: string) => Topic[];
  getTopic: (slug: string) => Topic | undefined;
  
  // Users
  getUser: (username: string) => User | undefined;
  
  // Comments
  getComments: (postId: string) => Comment[];
  
  // Auth
  getCurrentUser: () => User | undefined;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const getPosts = (filters?: {
    topicId?: string;
    authorId?: string;
    search?: string;
    orderBy?: PostOrder;
    limit?: number;
  }) => {
    return getMockPosts(filters);
  };

  const getPost = (id: string) => {
    return getMockPost(id);
  };

  const getTopics = (search?: string) => {
    return getMockTopics(search);
  };

  const getTopic = (slug: string) => {
    return mockTopics.find(topic => topic.slug === slug);
  };

  const getUser = (username: string) => {
    return getMockUser(username);
  };

  const getComments = (postId: string) => {
    return getMockComments(postId);
  };

  const getCurrentUser = () => {
    // Return the first user as the "current" user for demo purposes
    return mockUsers[0];
  };

  const value: MockDataContextType = {
    getPosts,
    getPost,
    getTopics,
    getTopic,
    getUser,
    getComments,
    getCurrentUser
  };

  return (
    <MockDataContext.Provider value={value}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData(): MockDataContextType {
  const context = useContext(MockDataContext);
  if (context === undefined) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
}

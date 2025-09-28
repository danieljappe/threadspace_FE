import { User, Post, Topic, Comment, PostOrder, ThreadType, VoteType } from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'johndoe',
    email: 'john@example.com',
    bio: 'Full-stack developer passionate about React and Node.js',
    avatarUrl: 'https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=JD',
    reputation: 1250,
    isVerified: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    username: 'sarahsmith',
    email: 'sarah@example.com',
    bio: 'UI/UX Designer with a love for beautiful interfaces',
    avatarUrl: 'https://via.placeholder.com/40x40/10B981/FFFFFF?text=SS',
    reputation: 890,
    isVerified: false,
    createdAt: '2024-01-20T14:15:00Z',
    updatedAt: '2024-01-20T14:15:00Z'
  },
  {
    id: '3',
    username: 'mikechen',
    email: 'mike@example.com',
    bio: 'DevOps engineer and cloud architecture enthusiast',
    avatarUrl: 'https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=MC',
    reputation: 2100,
    isVerified: true,
    createdAt: '2024-01-10T09:45:00Z',
    updatedAt: '2024-01-10T09:45:00Z'
  }
];

// Mock Topics
export const mockTopics: Topic[] = [
  {
    id: '1',
    name: 'React',
    slug: 'react',
    description: 'Everything about React development',
    color: '#61DAFB',
    subscriberCount: 1250,
    isSubscribed: true,
    posts: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  },
  {
    id: '2',
    name: 'TypeScript',
    slug: 'typescript',
    description: 'TypeScript discussions and best practices',
    color: '#3178C6',
    subscriberCount: 890,
    isSubscribed: false,
    posts: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  },
  {
    id: '3',
    name: 'Next.js',
    slug: 'nextjs',
    description: 'Next.js framework discussions',
    color: '#000000',
    subscriberCount: 2100,
    isSubscribed: true,
    posts: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  },
  {
    id: '4',
    name: 'GraphQL',
    slug: 'graphql',
    description: 'GraphQL API development and best practices',
    color: '#E10098',
    subscriberCount: 750,
    isSubscribed: false,
    posts: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    }
  }
];

// Mock Posts
export const mockPosts: Post[] = [
  {
    id: '1',
    author: mockUsers[0],
    title: 'Building Scalable React Applications with TypeScript',
    content: `# Introduction

Building scalable React applications requires careful planning and the right tools. In this post, I'll share my experience using TypeScript with React to create maintainable and type-safe applications.

## Key Benefits

1. **Type Safety**: Catch errors at compile time
2. **Better IDE Support**: Enhanced autocomplete and refactoring
3. **Improved Developer Experience**: Self-documenting code
4. **Easier Refactoring**: Confident code changes

## Best Practices

- Use strict TypeScript configuration
- Define proper interfaces for props and state
- Leverage generic types for reusable components
- Use proper error boundaries

What are your thoughts on using TypeScript with React? Share your experiences below!`,
    threadType: ThreadType.DISCUSSION,
    views: 1250,
    topics: [mockTopics[0], mockTopics[1]],
    comments: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    },
    voteCount: 45,
    userVote: VoteType.UPVOTE,
    bookmarked: true,
    isPinned: false,
    isLocked: false,
    createdAt: '2024-01-25T10:30:00Z',
    updatedAt: '2024-01-25T10:30:00Z'
  },
  {
    id: '2',
    author: mockUsers[1],
    title: 'The Future of Web Development: What to Expect in 2024',
    content: `# The Future of Web Development

As we move through 2024, several trends are shaping the future of web development:

## Emerging Technologies

- **WebAssembly**: Bringing near-native performance to the web
- **Edge Computing**: Faster, more responsive applications
- **AI Integration**: Smarter user experiences
- **Progressive Web Apps**: Better mobile experiences

## Framework Evolution

React, Vue, and Angular continue to evolve with new features and performance improvements. The focus is on:

- Better developer experience
- Improved performance
- Enhanced accessibility
- Better TypeScript support

What technologies are you most excited about? Let's discuss!`,
    threadType: ThreadType.DISCUSSION,
    views: 890,
    topics: [mockTopics[2]],
    comments: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    },
    voteCount: 32,
    userVote: undefined,
    bookmarked: false,
    isPinned: true,
    isLocked: false,
    createdAt: '2024-01-24T15:45:00Z',
    updatedAt: '2024-01-24T15:45:00Z'
  },
  {
    id: '3',
    author: mockUsers[2],
    title: 'How to Optimize GraphQL Queries for Better Performance',
    content: `# GraphQL Performance Optimization

GraphQL is powerful, but without proper optimization, it can lead to performance issues. Here are some strategies:

## Query Optimization

1. **Use DataLoader**: Batch and cache database queries
2. **Implement Pagination**: Avoid loading too much data
3. **Use Field Selection**: Only request needed fields
4. **Implement Caching**: Reduce redundant requests

## Schema Design

- Design efficient resolvers
- Use proper data types
- Implement proper error handling
- Consider query complexity

## Monitoring

- Track query performance
- Monitor resolver execution time
- Use query analysis tools
- Set up alerts for slow queries

Have you encountered any specific GraphQL performance challenges?`,
    threadType: ThreadType.QUESTION,
    views: 2100,
    topics: [mockTopics[3], mockTopics[1]],
    comments: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    },
    voteCount: 67,
    userVote: VoteType.UPVOTE,
    bookmarked: true,
    isPinned: false,
    isLocked: false,
    createdAt: '2024-01-23T08:20:00Z',
    updatedAt: '2024-01-23T08:20:00Z'
  },
  {
    id: '4',
    author: mockUsers[0],
    title: 'Next.js 15: New Features and Breaking Changes',
    content: `# Next.js 15 Release

Next.js 15 brings several exciting new features and some breaking changes:

## New Features

- **Turbopack**: Faster builds and development
- **Improved TypeScript Support**: Better type inference
- **Enhanced Performance**: Optimized rendering
- **New App Router Features**: Better routing capabilities

## Breaking Changes

- Updated React requirements
- Modified API routes behavior
- Changed build output structure

## Migration Guide

1. Update dependencies
2. Review breaking changes
3. Test thoroughly
4. Update deployment configuration

What's your experience with Next.js 15? Any issues during migration?`,
    threadType: ThreadType.ANNOUNCEMENT,
    views: 3200,
    topics: [mockTopics[2], mockTopics[1]],
    comments: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    },
    voteCount: 89,
    userVote: undefined,
    bookmarked: false,
    isPinned: false,
    isLocked: false,
    createdAt: '2024-01-22T12:10:00Z',
    updatedAt: '2024-01-22T12:10:00Z'
  },
  {
    id: '5',
    author: mockUsers[1],
    title: 'Best Practices for React Component Design',
    content: `# React Component Design Best Practices

Designing reusable and maintainable React components is crucial for scalable applications:

## Component Structure

- Single Responsibility Principle
- Proper prop interfaces
- Clear component hierarchy
- Consistent naming conventions

## Performance Considerations

- Use React.memo for expensive components
- Implement proper key props
- Avoid unnecessary re-renders
- Use useCallback and useMemo wisely

## Testing

- Write unit tests for components
- Test user interactions
- Mock external dependencies
- Maintain good test coverage

What are your favorite React component patterns?`,
    threadType: ThreadType.DISCUSSION,
    views: 1500,
    topics: [mockTopics[0]],
    comments: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    },
    voteCount: 23,
    userVote: VoteType.DOWNVOTE,
    bookmarked: false,
    isPinned: false,
    isLocked: false,
    createdAt: '2024-01-21T16:30:00Z',
    updatedAt: '2024-01-21T16:30:00Z'
  }
];

// Mock Comments - defined after posts to avoid circular dependency
export const mockComments: Comment[] = [
  {
    id: '1',
    post: mockPosts[0],
    parent: undefined,
    author: mockUsers[1],
    content: 'Great post! I completely agree with your points about TypeScript. It has significantly improved our development workflow.',
    depth: 0,
    replies: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    },
    voteCount: 12,
    userVote: VoteType.UPVOTE,
    isEdited: false,
    createdAt: '2024-01-25T11:00:00Z',
    updatedAt: '2024-01-25T11:00:00Z'
  },
  {
    id: '2',
    post: mockPosts[0],
    parent: undefined, // Will be set after initialization
    author: mockUsers[2],
    content: 'I have a question about error boundaries. Do you have any specific recommendations for handling async errors?',
    depth: 1,
    replies: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    },
    voteCount: 5,
    userVote: undefined,
    isEdited: false,
    createdAt: '2024-01-25T11:30:00Z',
    updatedAt: '2024-01-25T11:30:00Z'
  },
  {
    id: '3',
    post: mockPosts[1],
    author: mockUsers[0],
    parent: undefined,
    content: 'WebAssembly is definitely something to watch. The performance improvements are incredible!',
    depth: 0,
    replies: {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false
      }
    },
    voteCount: 8,
    userVote: VoteType.UPVOTE,
    isEdited: false,
    createdAt: '2024-01-24T16:00:00Z',
    updatedAt: '2024-01-24T16:00:00Z'
  }
];

// Set up the parent-child relationship after initialization
mockComments[1].parent = mockComments[0];

// Helper functions
export const getMockPosts = (filters?: {
  topicId?: string;
  authorId?: string;
  search?: string;
  orderBy?: PostOrder;
  limit?: number;
}): Post[] => {
  let posts = [...mockPosts];

  if (filters?.topicId) {
    posts = posts.filter(post => 
      post.topics?.some(topic => topic.id === filters.topicId)
    );
  }

  if (filters?.authorId) {
    posts = posts.filter(post => post.author.id === filters.authorId);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    posts = posts.filter(post => 
      post.title.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower) ||
      post.author.username.toLowerCase().includes(searchLower)
    );
  }

  if (filters?.orderBy) {
    switch (filters.orderBy) {
      case PostOrder.NEWEST:
        posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case PostOrder.OLDEST:
        posts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case PostOrder.TRENDING:
        posts.sort((a, b) => b.voteCount - a.voteCount);
        break;
      case PostOrder.TOP:
        posts.sort((a, b) => (b.voteCount + b.views) - (a.voteCount + a.views));
        break;
    }
  }

  if (filters?.limit) {
    posts = posts.slice(0, filters.limit);
  }

  return posts;
};

export const getMockTopics = (search?: string): Topic[] => {
  let topics = [...mockTopics];

  if (search) {
    const searchLower = search.toLowerCase();
    topics = topics.filter(topic => 
      topic.name.toLowerCase().includes(searchLower) ||
      topic.description?.toLowerCase().includes(searchLower)
    );
  }

  return topics;
};

export const getMockUser = (username: string): User | undefined => {
  return mockUsers.find(user => user.username === username);
};

export const getMockPost = (id: string): Post | undefined => {
  return mockPosts.find(post => post.id === id);
};

export const getMockComments = (postId: string): Comment[] => {
  return mockComments.filter(comment => comment.post.id === postId);
};

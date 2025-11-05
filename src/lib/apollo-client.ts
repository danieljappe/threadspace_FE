'use client';

import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { API_ENDPOINTS, STORAGE_KEYS } from './constants';

// HTTP Link for all GraphQL operations (queries and mutations)
// Real-time updates use SSE via usePostSSE hook instead of WebSocket subscriptions
const httpLink = createHttpLink({
  uri: API_ENDPOINTS.GRAPHQL,
  credentials: 'include',
});

// Auth Link
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error Link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    // Handle 401 errors by clearing auth tokens
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      window.location.href = '/auth/login';
    }
  }
});

// Cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        posts: {
          keyArgs: ['topicId', 'authorId', 'search', 'orderBy'],
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;
            
            const { after } = args || {};
            if (after) {
              // Pagination - append to existing
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            } else {
              // New query - replace
              return incoming;
            }
          },
        },
        comments: {
          keyArgs: ['postId', 'parentId', 'orderBy'],
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;
            
            const { after } = args || {};
            if (after) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            } else {
              return incoming;
            }
          },
        },
        users: {
          keyArgs: ['search'],
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;
            
            const { after } = args || {};
            if (after) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            } else {
              return incoming;
            }
          },
        },
        topics: {
          keyArgs: ['search'],
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;
            
            const { after } = args || {};
            if (after) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            } else {
              return incoming;
            }
          },
        },
      },
    },
    Post: {
      fields: {
        comments: {
          keyArgs: ['orderBy'],
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;
            
            const { after } = args || {};
            if (after) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            } else {
              return incoming;
            }
          },
        },
      },
    },
    User: {
      fields: {
        posts: {
          keyArgs: ['orderBy'],
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;
            
            const { after } = args || {};
            if (after) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            } else {
              return incoming;
            }
          },
        },
        followers: {
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;
            
            const { after } = args || {};
            if (after) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            } else {
              return incoming;
            }
          },
        },
        following: {
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;
            
            const { after } = args || {};
            if (after) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            } else {
              return incoming;
            }
          },
        },
      },
    },
    Topic: {
      fields: {
        posts: {
          keyArgs: ['orderBy'],
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;
            
            const { after } = args || {};
            if (after) {
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            } else {
              return incoming;
            }
          },
        },
      },
    },
  },
});

// Create Apollo Client
// Note: Subscriptions are handled via SSE (Server-Sent Events) using usePostSSE hook
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

// Helper function to clear cache
export const clearApolloCache = () => {
  apolloClient.clearStore();
};

// Helper function to reset store
export const resetApolloStore = () => {
  apolloClient.resetStore();
};
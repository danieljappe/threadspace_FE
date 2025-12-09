export const APP_NAME = 'ThreadSpace';
export const APP_DESCRIPTION = 'A modern discussion platform for long-form conversations';

export const API_ENDPOINTS = {
  GRAPHQL: process.env.NEXT_PUBLIC_GRAPHQL_URI || 'http://localhost:4000/graphql',
} as const;

export const PAGINATION = {
  POSTS_PER_PAGE: 20,
  COMMENTS_PER_PAGE: 20,
} as const;

export const MAX_LENGTHS = {
  POST_TITLE: 300,
  POST_CONTENT: 10000,
  COMMENT_CONTENT: 2000,
  USER_BIO: 500,
  USERNAME: 30,
} as const;

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  EMAIL_MAX_LENGTH: 255,
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'threadspace_auth_token',
  REFRESH_TOKEN: 'threadspace_refresh_token',
} as const;

export const VOTE_TYPES = {
  UPVOTE: 'UPVOTE',
  DOWNVOTE: 'DOWNVOTE',
} as const;

export const POST_ORDERS = {
  NEWEST: 'NEWEST',
  OLDEST: 'OLDEST',
  TOP: 'TOP',
} as const;

export { PostOrder } from '@/types';

export const COMMENT_ORDERS = {
  NEWEST: 'NEWEST',
  OLDEST: 'OLDEST',
  TOP: 'TOP',
} as const;

export const ROUTES = {
  HOME: '/main',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  CREATE_POST: '/main/create',
  POST: (id: string) => `/main/post?id=${id}`,
  BOOKMARKS: '/main/bookmarks',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You must be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  USERNAME_ALREADY_EXISTS: 'This username is already taken.',
  WEAK_PASSWORD: 'Password must be at least 8 characters long.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_USERNAME: 'Username must be 3-30 characters and contain only letters, numbers, and underscores.',
} as const;

export const SUCCESS_MESSAGES = {
  POST_CREATED: 'Post created successfully!',
  POST_DELETED: 'Post deleted successfully!',
  COMMENT_CREATED: 'Comment posted successfully!',
  COMMENT_DELETED: 'Comment deleted successfully!',
  LOGGED_OUT: 'Logged out successfully!',
} as const;

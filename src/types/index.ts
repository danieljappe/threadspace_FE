// Core Types
export interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  reputation: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  author: User;
  title: string;
  content: string;
  threadType: ThreadType;
  views: number;
  topics?: Topic[];
  comments: CommentConnection;
  voteCount: number;
  userVote?: VoteType;
  bookmarked: boolean;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  post: Post;
  parent?: Comment;
  author: User;
  content: string;
  depth: number;
  replies: CommentConnection;
  voteCount: number;
  userVote?: VoteType;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  subscriberCount: number;
  posts: PostConnection;
  isSubscribed: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

// Enums
export enum ThreadType {
  DISCUSSION = 'DISCUSSION',
  QUESTION = 'QUESTION',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  POLL = 'POLL'
}

export enum VoteType {
  UPVOTE = 'UPVOTE',
  DOWNVOTE = 'DOWNVOTE'
}

export enum PostOrder {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  TRENDING = 'TRENDING',
  TOP = 'TOP'
}

export enum CommentOrder {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  TOP = 'TOP'
}

export enum SearchType {
  POSTS = 'POSTS',
  USERS = 'USERS',
  TOPICS = 'TOPICS',
  ALL = 'ALL'
}

// Connection Types
export interface PostConnection {
  edges: PostEdge[];
  pageInfo: PageInfo;
}

export interface PostEdge {
  node: Post;
  cursor: string;
}

export interface CommentConnection {
  edges: CommentEdge[];
  pageInfo: PageInfo;
}

export interface CommentEdge {
  node: Comment;
  cursor: string;
}

export interface UserConnection {
  edges: UserEdge[];
  pageInfo: PageInfo;
}

export interface UserEdge {
  node: User;
  cursor: string;
}

export interface TopicConnection {
  edges: TopicEdge[];
  pageInfo: PageInfo;
}

export interface TopicEdge {
  node: Topic;
  cursor: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

// Input Types
export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  username?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
  threadType?: ThreadType;
  topicIds?: string[];
}

export interface UpdatePostInput {
  title?: string;
  content?: string;
  threadType?: ThreadType;
  topicIds?: string[];
}

export interface CreateCommentInput {
  postId: string;
  parentId?: string;
  content: string;
}

// Response Types
export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface VotePayload {
  success: boolean;
  voteCount: number;
  userVote?: VoteType;
}

export interface SearchResults {
  posts: Post[];
  users: User[];
  topics: Topic[];
}

// Context Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<AuthPayload>;
  register: (input: RegisterInput) => Promise<AuthPayload>;
  logout: () => void;
  refreshToken: () => Promise<AuthPayload>;
}

// Component Props
export interface ThreadCardProps {
  post: Post;
  expanded?: boolean;
  onVote: (voteType: VoteType) => void;
}

export interface VoteButtonsProps {
  voteCount: number;
  userVote?: VoteType;
  onVote: (voteType: VoteType) => void;
  disabled?: boolean;
}

export interface CommentItemProps {
  comment: Comment;
  onVote: (voteType: VoteType) => void;
  onReply: (parentId: string) => void;
}

export interface PostEditorProps {
  post?: Post;
  onSubmit: (input: CreatePostInput | UpdatePostInput) => void;
  loading?: boolean;
}

// Utility Types
export interface TypingIndicator {
  userId: string;
  username: string;
  postId: string;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code: string;
  field?: string;
}

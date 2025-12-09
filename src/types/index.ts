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
  comments: CommentConnection;
  voteCount: number;
  userVote?: VoteType;
  bookmarked: boolean;
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

// Enums
export enum VoteType {
  UPVOTE = 'UPVOTE',
  DOWNVOTE = 'DOWNVOTE'
}

export enum PostOrder {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  TOP = 'TOP'
}

export enum CommentOrder {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  TOP = 'TOP'
}

// Connection Types
export interface PostConnection {
  edges: PostEdge[];
  pageInfo: PageInfo;
  totalCount?: number;
}

export interface PostEdge {
  node: Post;
  cursor: string;
}

export interface CommentConnection {
  edges: CommentEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

export interface CommentEdge {
  node: Comment;
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

export interface CreatePostInput {
  title: string;
  content: string;
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

// Component Props
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
  onCommentUpdated?: (updatedComment: Comment) => void;
  onCommentDeleted?: (commentId: string) => void;
}

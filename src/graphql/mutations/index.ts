import { gql } from '@apollo/client';

// Authentication Mutations
export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      user {
        id
        username
        email
        bio
        avatarUrl
        reputation
        isVerified
        createdAt
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        id
        username
        email
        bio
        avatarUrl
        reputation
        isVerified
        createdAt
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      accessToken
      refreshToken
      user {
        id
        username
        email
        bio
        avatarUrl
        reputation
        isVerified
        createdAt
      }
    }
  }
`;

// Post Mutations
export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      voteCount
      userVote
      bookmarked
      createdAt
      updatedAt
      author {
        id
        username
        avatarUrl
        reputation
        isVerified
      }
      comments(first: 0) {
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`;

export const EDIT_POST = gql`
  mutation EditPost($input: UpdatePostInput!) {
    editPost(input: $input) {
      id
      title
      content
      voteCount
      userVote
      bookmarked
      createdAt
      updatedAt
      author {
        id
        username
        avatarUrl
        reputation
        isVerified
      }
      comments(first: 0) {
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`;

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

// Comment Mutations
export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      content
      depth
      voteCount
      userVote
      isEdited
      createdAt
      updatedAt
      author {
        id
        username
        avatarUrl
        reputation
        isVerified
      }
      post {
        id
        title
      }
      parent {
        id
        content
        author {
          id
          username
        }
      }
      replies(first: 0) {
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`;

export const EDIT_COMMENT = gql`
  mutation EditComment($input: UpdateCommentInput!) {
    editComment(input: $input) {
      id
      content
      depth
      voteCount
      userVote
      isEdited
      createdAt
      updatedAt
      author {
        id
        username
        avatarUrl
        reputation
        isVerified
      }
      post {
        id
        title
      }
      parent {
        id
        content
        author {
          id
          username
        }
      }
      replies(first: 0) {
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: ID!) {
    deleteComment(id: $id)
  }
`;

// Voting Mutations
export const VOTE = gql`
  mutation Vote($targetId: ID!, $targetType: VotableType!, $voteType: VoteType!) {
    vote(targetId: $targetId, targetType: $targetType, voteType: $voteType) {
      success
      voteCount
      userVote
    }
  }
`;

export const REMOVE_VOTE = gql`
  mutation RemoveVote($targetId: ID!, $targetType: VotableType!) {
    removeVote(targetId: $targetId, targetType: $targetType)
  }
`;

// Bookmark Mutations
export const BOOKMARK_POST = gql`
  mutation BookmarkPost($postId: ID!) {
    bookmarkPost(postId: $postId) {
      id
      title
      bookmarked
    }
  }
`;

export const UNBOOKMARK_POST = gql`
  mutation UnbookmarkPost($postId: ID!) {
    unbookmarkPost(postId: $postId)
  }
`;

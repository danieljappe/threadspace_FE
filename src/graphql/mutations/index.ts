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

// User Mutations
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      username
      bio
      avatarUrl
      reputation
      isVerified
      createdAt
      updatedAt
    }
  }
`;

export const FOLLOW_USER = gql`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) {
      id
      username
      bio
      avatarUrl
      reputation
      isVerified
      followers(first: 1) {
        edges {
          node {
            id
          }
        }
      }
    }
  }
`;

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId) {
      id
      username
      bio
      avatarUrl
      reputation
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
      threadType
      views
      voteCount
      userVote
      bookmarked
      isPinned
      isLocked
      createdAt
      updatedAt
      author {
        id
        username
        bio
        avatarUrl
        reputation
        isVerified
      }
      topics {
        id
        name
        slug
        color
      }
      comments(first: 0) {
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      title
      content
      threadType
      views
      voteCount
      userVote
      bookmarked
      isPinned
      isLocked
      createdAt
      updatedAt
      author {
        id
        username
        bio
        avatarUrl
        reputation
        isVerified
      }
      topics {
        id
        name
        slug
        color
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
        bio
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

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: ID!, $content: String!) {
    updateComment(id: $id, content: $content) {
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
        bio
        avatarUrl
        reputation
        isVerified
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

// Topic Mutations
export const SUBSCRIBE_TOPIC = gql`
  mutation SubscribeTopic($topicId: ID!) {
    subscribeTopic(topicId: $topicId) {
      id
      name
      slug
      description
      color
      subscriberCount
      isSubscribed
    }
  }
`;

export const UNSUBSCRIBE_TOPIC = gql`
  mutation UnsubscribeTopic($topicId: ID!) {
    unsubscribeTopic(topicId: $topicId)
  }
`;

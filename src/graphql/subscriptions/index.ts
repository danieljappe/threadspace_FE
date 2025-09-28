import { gql } from '@apollo/client';

// Real-time Subscriptions
export const COMMENT_ADDED = gql`
  subscription CommentAdded($postId: ID!) {
    commentAdded(postId: $postId) {
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

export const POST_UPDATED = gql`
  subscription PostUpdated($postId: ID!) {
    postUpdated(postId: $postId) {
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

export const POST_CREATED = gql`
  subscription PostCreated($topicId: ID) {
    postCreated(topicId: $topicId) {
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

export const NOTIFICATION_RECEIVED = gql`
  subscription NotificationReceived {
    notificationReceived {
      id
      type
      data
      isRead
      createdAt
    }
  }
`;

export const USER_TYPING = gql`
  subscription UserTyping($postId: ID!) {
    userTyping(postId: $postId) {
      userId
      username
      postId
      timestamp
    }
  }
`;

export const VOTE_UPDATED = gql`
  subscription VoteUpdated($postId: ID, $commentId: ID) {
    voteUpdated(postId: $postId, commentId: $commentId) {
      success
      voteCount
      userVote
    }
  }
`;
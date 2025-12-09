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

export const VOTE_UPDATED = gql`
  subscription VoteUpdated($postId: ID, $commentId: ID) {
    voteUpdated(postId: $postId, commentId: $commentId) {
      success
      voteCount
      userVote
    }
  }
`;

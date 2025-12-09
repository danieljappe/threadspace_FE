import { gql } from '@apollo/client';

// User Queries
export const GET_ME = gql`
  query GetMe {
    me {
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
`;

// Post Queries
export const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
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
      comments(first: 20, orderBy: NEWEST) {
        edges {
          node {
            id
            content
            depth
            voteCount
            userVote
            isEdited
            createdAt
            author {
              id
              username
              avatarUrl
              reputation
            }
            replies(first: 3) {
              edges {
                node {
                  id
                  content
                  depth
                  voteCount
                  userVote
                  isEdited
                  createdAt
                  author {
                    id
                    username
                    avatarUrl
                    reputation
                    isVerified
                  }
                  parent {
                    id
                    author {
                      id
                      username
                    }
                  }
                  replies(first: 3) {
                    edges {
                      node {
                        id
                        content
                        depth
                        voteCount
                        userVote
                        isEdited
                        createdAt
                        author {
                          id
                          username
                          avatarUrl
                          reputation
                          isVerified
                        }
                        parent {
                          id
                          author {
                            id
                            username
                          }
                        }
                      }
                    }
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                    totalCount
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
              totalCount
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
        totalCount
      }
    }
  }
`;

export const GET_POSTS = gql`
  query GetPosts(
    $orderBy: PostOrder
    $first: Int
    $after: String
  ) {
    posts(
      orderBy: $orderBy
      first: $first
      after: $after
    ) {
      edges {
        node {
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
            totalCount
            pageInfo {
              hasNextPage
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

// Bookmarked Posts Query
export const GET_BOOKMARKED_POSTS = gql`
  query GetBookmarkedPosts($first: Int, $after: String, $orderBy: PostOrder) {
    bookmarkedPosts(first: $first, after: $after, orderBy: $orderBy) {
      edges {
        node {
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
            totalCount
            pageInfo {
              hasNextPage
            }
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

// Comment Queries
export const GET_COMMENTS = gql`
  query GetComments($postId: ID!, $first: Int, $after: String, $orderBy: CommentOrder) {
    comments(postId: $postId, first: $first, after: $after, orderBy: $orderBy) {
      edges {
        node {
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
          replies(first: 3) {
            edges {
              node {
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
                parent {
                  id
                  author {
                    id
                    username
                  }
                }
                replies(first: 3) {
                  edges {
                    node {
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
                      parent {
                        id
                        author {
                          id
                          username
                        }
                      }
                      replies(first: 3) {
                        edges {
                          node {
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
                            parent {
                              id
                              author {
                                id
                                username
                              }
                            }
                            replies(first: 0) {
                              edges {
                                node {
                                  id
                                }
                              }
                              pageInfo {
                                hasNextPage
                                endCursor
                              }
                              totalCount
                            }
                          }
                        }
                        pageInfo {
                          hasNextPage
                          endCursor
                        }
                        totalCount
                      }
                    }
                  }
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                  totalCount
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
            totalCount
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

// Query to fetch more replies for a specific comment
export const GET_COMMENT_REPLIES = gql`
  query GetCommentReplies($commentId: ID!, $first: Int, $after: String) {
    comment(id: $commentId) {
      id
      replies(first: $first, after: $after) {
        edges {
          node {
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
            parent {
              id
              author {
                id
                username
              }
            }
            replies(first: 3) {
              edges {
                node {
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
                  parent {
                    id
                    author {
                      id
                      username
                    }
                  }
                  replies(first: 0) {
                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                    totalCount
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
              totalCount
            }
          }
          cursor
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        totalCount
      }
    }
  }
`;

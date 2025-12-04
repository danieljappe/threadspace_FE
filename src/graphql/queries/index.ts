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

export const GET_USER = gql`
  query GetUser($username: String!) {
    user(username: $username) {
      id
      username
      bio
      avatarUrl
      reputation
      isVerified
      createdAt
      posts(first: 10) {
        edges {
          node {
            id
            title
            createdAt
            voteCount
            commentCount
          }
        }
      }
      followers(first: 10) {
        edges {
          node {
            id
            username
            avatarUrl
          }
        }
      }
      following(first: 10) {
        edges {
          node {
            id
            username
            avatarUrl
          }
        }
      }
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($search: String!, $first: Int, $after: String) {
    users(search: $search, first: $first, after: $after) {
      edges {
        node {
          id
          username
          bio
          avatarUrl
          reputation
          isVerified
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
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
            replies(first: 10) {
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
                }
              }
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
    $topicId: ID
    $authorId: ID
    $search: String
    $orderBy: PostOrder
    $first: Int
    $after: String
  ) {
    posts(
      topicId: $topicId
      authorId: $authorId
      search: $search
      orderBy: $orderBy
      first: $first
      after: $after
    ) {
      edges {
        node {
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
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_TRENDING_POSTS = gql`
  query GetTrendingPosts($first: Int!) {
    trendingPosts(first: $first) {
      id
      title
      content
      threadType
      views
      voteCount
      userVote
      bookmarked
      isPinned
      createdAt
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

// Topic Queries
export const GET_TOPIC = gql`
  query GetTopic($slug: String!) {
    topic(slug: $slug) {
      id
      name
      slug
      description
      color
      subscriberCount
      isSubscribed
      posts(first: 20, orderBy: NEWEST) {
        edges {
          node {
            id
            title
            content
            threadType
            views
            voteCount
            userVote
            bookmarked
            isPinned
            createdAt
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
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }
  }
`;

export const GET_TOPICS = gql`
  query GetTopics($search: String, $first: Int, $after: String) {
    topics(search: $search, first: $first, after: $after) {
      edges {
        node {
          id
          name
          slug
          description
          color
          subscriberCount
          isSubscribed
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

// Comment Queries
export const GET_COMMENT = gql`
  query GetComment($id: ID!) {
    comment(id: $id) {
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
      replies(first: 10) {
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
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  }
`;

// Fragment for nested replies (to avoid repetition)
const REPLY_FIELDS = `
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
`;

// Comments Query with deep nesting support
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
          replies(first: 20) {
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
                replies(first: 20) {
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
                      replies(first: 20) {
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
                            replies(first: 20) {
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
                                    totalCount
                                  }
                                }
                              }
                              pageInfo {
                                hasNextPage
                              }
                              totalCount
                            }
                          }
                        }
                        pageInfo {
                          hasNextPage
                        }
                        totalCount
                      }
                    }
                  }
                  pageInfo {
                    hasNextPage
                  }
                  totalCount
                }
              }
            }
            pageInfo {
              hasNextPage
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

// Search Query
export const SEARCH = gql`
  query Search($query: String!, $type: SearchType) {
    search(query: $query, type: $type) {
      posts {
        id
        title
        content
        threadType
        views
        voteCount
        createdAt
        author {
          id
          username
          avatarUrl
          reputation
        }
        topics {
          id
          name
          slug
          color
        }
      }
      users {
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
        description
        color
        subscriberCount
      }
    }
  }
`;

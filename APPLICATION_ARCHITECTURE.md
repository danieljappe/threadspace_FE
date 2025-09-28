# ThreadSpace Application Architecture Documentation

## Overview

ThreadSpace is a modern, full-stack discussion platform built with Next.js 15, React 19, and Apollo GraphQL. It provides a comprehensive forum-like experience with real-time features, user authentication, and a mobile-first responsive design.

## Table of Contents

1. [Application Architecture](#application-architecture)
2. [Single-Page Application (SPA)](#single-page-application-spa)
3. [Caching and Data Management](#caching-and-data-management)
4. [Error Handling](#error-handling)
5. [Routing System](#routing-system)
6. [Logging Service](#logging-service)
7. [State Management](#state-management)
8. [CSS Styling and Design System](#css-styling-and-design-system)
9. [Testing Strategy](#testing-strategy)
10. [Security Measures](#security-measures)
11. [Responsive Design](#responsive-design)
12. [Sitemap](#sitemap)
13. [User Experience Design](#user-experience-design)
14. [UI Prototypes](#ui-prototypes)

---

## Application Architecture

### Component-Based Architecture

ThreadSpace follows a well-structured component-based architecture using React 19 with TypeScript:

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── main/              # Protected main application
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── comments/          # Comment system components
│   ├── layout/            # Layout components (Header, Sidebar, Footer)
│   ├── posts/             # Post-related components
│   └── ui/                # Base UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries and configurations
├── types/                 # TypeScript type definitions
└── graphql/               # GraphQL queries, mutations, and subscriptions
```

### Key Architectural Patterns

1. **Provider Pattern**: Context providers for authentication and mock data
2. **Custom Hooks**: Encapsulated logic for auth, debouncing, infinite scroll
3. **Component Composition**: Reusable UI components with variant systems
4. **Separation of Concerns**: Clear separation between UI, business logic, and data fetching

---

## Single-Page Application (SPA)

### Next.js App Router Implementation

ThreadSpace uses Next.js 15's App Router for client-side routing:

- **File-based Routing**: Routes defined by folder structure
- **Client-side Navigation**: Smooth transitions without page reloads
- **Layout Nesting**: Hierarchical layouts for different sections
- **Dynamic Routes**: Support for dynamic segments like `[id]` and `[slug]`

### Route Structure

```
/                          # Home page (public)
/auth/
  ├── login/              # Login page
  └── register/           # Registration page
/main/                    # Protected routes
  ├── create/             # Create post
  ├── post/[id]/          # Individual post view
  ├── topic/[slug]/       # Topic-specific posts
  └── user/[username]/    # User profile
```

### SPA Features

- **Client-side State Management**: React Context and Apollo Client
- **Dynamic Imports**: Code splitting for better performance
- **Progressive Enhancement**: Works without JavaScript for basic functionality
- **SEO Optimization**: Server-side rendering for public pages

---

## Caching and Data Management

### Apollo Client Caching Strategy

ThreadSpace implements sophisticated caching using Apollo Client:

#### Cache Configuration
```typescript
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        posts: {
          keyArgs: ['topicId', 'authorId', 'search', 'orderBy'],
          merge(existing, incoming, { args }) {
            // Custom merge logic for pagination
          }
        }
      }
    }
  }
});
```

#### Cache Features

1. **Normalized Caching**: Automatic normalization of GraphQL responses
2. **Pagination Support**: Custom merge functions for infinite scroll
3. **Cache Persistence**: Automatic cache updates on mutations
4. **Stale-While-Revalidate**: Background refetching for fresh data
5. **Cache Invalidation**: Smart cache updates after mutations

#### Cache Policies

- **cache-first**: For user data and static content
- **cache-and-network**: For real-time data like posts
- **network-only**: For critical operations like authentication

### Request Retries

Apollo Client handles retries automatically:
- **Network Error Retries**: Automatic retry on network failures
- **Exponential Backoff**: Increasing delay between retries
- **Error Boundaries**: Graceful fallback to mock data

---

## Error Handling

### Multi-layered Error Handling Strategy

#### 1. GraphQL Error Handling
```typescript
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: ${message}`);
    });
  }
  
  if (networkError) {
    // Handle 401 errors by clearing auth tokens
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      window.location.href = '/auth/login';
    }
  }
});
```

#### 2. Component-level Error Handling
- **Error Boundaries**: Catch and display errors gracefully
- **Fallback UI**: Mock data fallback when GraphQL fails
- **User-friendly Messages**: Clear error messages for users
- **Retry Mechanisms**: "Try Again" buttons for failed operations

#### 3. Form Validation
- **Client-side Validation**: Real-time validation feedback
- **Server-side Error Handling**: Display server validation errors
- **Input Sanitization**: XSS protection for user inputs

---

## Routing System

### Next.js App Router Implementation

#### Public Routes
- `/` - Home page with post listings
- `/auth/login` - User login
- `/auth/register` - User registration

#### Protected Routes
- `/main/*` - All main application routes require authentication
- Protected by `ProtectedRoute` component wrapper

#### Route Protection
```typescript
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true
}) => {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [user, loading, requireAuth]);
  
  // Render children or fallback UI
};
```

#### Error Pages
- **404 Page**: Custom not-found.tsx for missing routes
- **Access Denied**: For unauthorized access attempts
- **Loading States**: Skeleton loaders during route transitions

---

## Logging Service

### Current Implementation

ThreadSpace uses console-based logging with structured error messages:

```typescript
// GraphQL errors
console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);

// Network errors
console.error(`[Network error]: ${networkError}`);

// Authentication errors
console.error('Auth check failed:', error);
```

### Recommended Logging Service Integration

For production deployment, integrate with **Sentry.io**:

```typescript
import * as Sentry from "@sentry/nextjs";

// Initialize Sentry
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Error reporting
Sentry.captureException(error);
Sentry.captureMessage('User action performed');
```

### Logging Strategy

1. **Error Tracking**: Automatic error capture and reporting
2. **Performance Monitoring**: Track page load times and API calls
3. **User Analytics**: Track user interactions and feature usage
4. **Debug Information**: Detailed logs for development

---

## State Management

### Multi-layered State Management

#### 1. React Context (Global State)
```typescript
// Authentication Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Auth methods: login, register, logout, refreshToken
}
```

#### 2. Apollo Client (Server State)
- **GraphQL Queries**: Server data fetching and caching
- **Mutations**: Data updates and optimistic responses
- **Subscriptions**: Real-time data updates (WebSocket support)

#### 3. Local Component State
- **useState**: Component-specific state
- **useReducer**: Complex state logic
- **Custom Hooks**: Reusable stateful logic

#### 4. Local Storage
```typescript
// Persistent user preferences
const STORAGE_KEYS = {
  AUTH_TOKEN: 'threadspace_auth_token',
  REFRESH_TOKEN: 'threadspace_refresh_token',
  USER_PREFERENCES: 'threadspace_user_preferences',
  THEME: 'threadspace_theme',
};
```

### State Management Patterns

1. **Props Drilling Prevention**: Context for deeply nested data
2. **Optimistic Updates**: Immediate UI updates with rollback on failure
3. **State Normalization**: Consistent data structure across components
4. **Immutable Updates**: Using spread operators and immutable patterns

---

## CSS Styling and Design System

### Tailwind CSS Implementation

ThreadSpace uses Tailwind CSS with a custom design system:

#### 1. Design Tokens
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... more tokens */
}
```

#### 2. Component Variants
```typescript
const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
  outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
  ghost: 'hover:bg-gray-100 text-gray-700',
  danger: 'bg-red-600 hover:bg-red-700 text-white'
};
```

#### 3. Dark Mode Support
- **Class-based Dark Mode**: `dark:` prefix for dark theme styles
- **System Preference Detection**: Automatic theme switching
- **Persistent Theme**: User preference stored in localStorage

#### 4. Responsive Design
- **Mobile-first Approach**: Base styles for mobile, enhanced for larger screens
- **Breakpoint System**: `sm:`, `md:`, `lg:`, `xl:` prefixes
- **Flexible Grid**: CSS Grid and Flexbox for layouts

### Styled Components Pattern

While using Tailwind, the app follows styled component patterns:

```typescript
// Utility function for class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Component with variant system
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) => {
  return (
    <button
      className={cn(
        'base-styles',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
};
```

---

## Testing Strategy

### Current Testing Status

**Note**: The application currently does not have implemented test files. The following outlines the recommended testing strategy:

#### 1. Unit Testing (Jest + React Testing Library)
```typescript
// Example test structure
describe('Button Component', () => {
  it('renders with correct variant', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
  });
});
```

#### 2. Integration Testing
- **Component Integration**: Test component interactions
- **Hook Testing**: Test custom hooks in isolation
- **Context Testing**: Test context providers and consumers

#### 3. End-to-End Testing (Cypress)
```typescript
// Example E2E test
describe('User Authentication', () => {
  it('allows user to login and access protected routes', () => {
    cy.visit('/auth/login');
    cy.get('[data-testid="email-input"]').type('user@example.com');
    cy.get('[data-testid="password-input"]').type('password');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/main');
  });
});
```

#### 4. Visual Regression Testing
- **Storybook Integration**: Component story testing
- **Screenshot Testing**: Visual regression detection
- **Cross-browser Testing**: Ensure consistency across browsers

### Recommended Testing Setup

1. **Jest Configuration**: Unit and integration tests
2. **Cypress Setup**: E2E testing framework
3. **Testing Library**: React component testing utilities
4. **MSW (Mock Service Worker)**: API mocking for tests
5. **Coverage Reporting**: Code coverage analysis

---

## Security Measures

### Authentication Security

#### 1. JWT Token Management
```typescript
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch {
    return true;
  }
};
```

#### 2. Token Storage Security
- **localStorage**: For persistent token storage
- **Automatic Cleanup**: Clear tokens on expiration
- **Refresh Token Rotation**: Secure token refresh mechanism

### XSS (Cross-Site Scripting) Protection

#### 1. Input Sanitization
```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize user content before rendering
const sanitizedContent = DOMPurify.sanitize(userContent);
```

#### 2. Content Security Policy
- **CSP Headers**: Prevent inline script execution
- **Content Sanitization**: Clean user-generated content
- **Safe HTML Rendering**: Use `dangerouslySetInnerHTML` with sanitized content

### CSRF (Cross-Site Request Forgery) Protection

#### 1. SameSite Cookies
```typescript
// Apollo Client configuration
const httpLink = createHttpLink({
  uri: API_ENDPOINTS.GRAPHQL,
  credentials: 'include', // Include cookies for CSRF protection
});
```

#### 2. CSRF Tokens
- **Token Validation**: Server-side CSRF token validation
- **Origin Checking**: Verify request origin
- **Double Submit Cookies**: Additional CSRF protection layer

### Session Hijacking Prevention

#### 1. Secure Token Storage
- **HttpOnly Cookies**: For sensitive tokens (recommended for production)
- **Secure Flags**: HTTPS-only cookie transmission
- **SameSite Attributes**: Prevent cross-site cookie usage

#### 2. Session Management
```typescript
export const clearAuthTokens = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  // Clear Apollo cache
  apolloClient.clearStore();
};
```

### Input Validation

#### 1. Client-side Validation
```typescript
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
}
```

#### 2. Server-side Validation
- **GraphQL Schema Validation**: Type-safe input validation
- **Length Limits**: Enforced character limits
- **Format Validation**: Email, username, password format checks

---

## Responsive Design

### Mobile-First Approach

ThreadSpace implements a mobile-first responsive design strategy:

#### 1. Breakpoint System
```css
/* Mobile first - base styles */
.container {
  padding: 1rem;
}

/* Small screens and up */
@media (min-width: 640px) {
  .container {
    padding: 1.5rem;
  }
}

/* Medium screens and up */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
  }
}
```

#### 2. Responsive Components

**Header Component**:
- **Mobile**: Collapsible menu with hamburger icon
- **Desktop**: Full navigation with search bar

**Sidebar Component**:
- **Mobile**: Overlay sidebar with backdrop
- **Desktop**: Fixed sidebar with topic navigation

**Post Cards**:
- **Mobile**: Single column layout
- **Desktop**: Multi-column grid layout

#### 3. Touch-Friendly Design
- **Minimum Touch Targets**: 44px minimum for interactive elements
- **Gesture Support**: Swipe gestures for mobile navigation
- **Optimized Forms**: Mobile-friendly input fields and buttons

#### 4. Performance Optimization
- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Component and image lazy loading

---

## Sitemap

### Application Structure

```
ThreadSpace Application
├── Public Routes
│   ├── / (Home)
│   ├── /auth/login
│   ├── /auth/register
│   └── /not-found (404)
│
├── Protected Routes (/main/*)
│   ├── /main (Dashboard)
│   ├── /main/create (Create Post)
│   ├── /main/post/[id] (Post Detail)
│   ├── /main/topic/[slug] (Topic Posts)
│   ├── /main/user/[username] (User Profile)
│   ├── /main/profile (User Settings)
│   ├── /main/settings (Account Settings)
│   └── /main/notifications (Notifications)
│
└── API Routes
    ├── /api/auth/* (Authentication)
    ├── /api/posts/* (Post Management)
    ├── /api/comments/* (Comment System)
    └── /api/users/* (User Management)
```

### SEO Optimization

1. **Meta Tags**: Dynamic meta tags for each page
2. **Open Graph**: Social media sharing optimization
3. **Structured Data**: JSON-LD for search engines
4. **Sitemap Generation**: Automatic sitemap.xml generation
5. **Robots.txt**: Search engine crawling directives

---

## User Experience Design

### Design Principles

#### 1. Accessibility
- **WCAG 2.1 Compliance**: AA level accessibility standards
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: ARIA labels and semantic HTML
- **Color Contrast**: Sufficient contrast ratios
- **Focus Management**: Clear focus indicators

#### 2. Performance
- **Fast Loading**: Optimized bundle sizes and lazy loading
- **Smooth Animations**: 60fps animations with CSS transforms
- **Progressive Enhancement**: Works without JavaScript
- **Offline Support**: Service worker for offline functionality

#### 3. Usability
- **Intuitive Navigation**: Clear information architecture
- **Consistent Design**: Unified design language
- **Error Prevention**: Validation and confirmation dialogs
- **Feedback Systems**: Loading states and success messages

### User Journey Optimization

#### 1. Onboarding Flow
```
New User → Registration → Email Verification → Profile Setup → First Post
```

#### 2. Content Discovery
- **Search Functionality**: Global search with filters
- **Topic Navigation**: Categorized content browsing
- **Trending Content**: Algorithm-based content recommendations
- **User Following**: Social features for content discovery

#### 3. Content Creation
- **Rich Text Editor**: Markdown support with live preview
- **Draft Saving**: Auto-save functionality
- **Topic Tagging**: Easy topic selection and creation
- **Media Support**: Image and file upload capabilities

---

## UI Prototypes

### Design System Components

#### 1. Atomic Design Structure
```
Atoms
├── Button
├── Input
├── Avatar
├── Icon
└── Badge

Molecules
├── SearchBar
├── VoteButtons
├── UserCard
└── TopicTag

Organisms
├── Header
├── Sidebar
├── PostCard
├── CommentTree
└── PostList

Templates
├── AuthLayout
├── MainLayout
└── PostLayout

Pages
├── HomePage
├── LoginPage
├── PostDetailPage
└── UserProfilePage
```

#### 2. Component Variants

**Button Component**:
- Variants: primary, secondary, outline, ghost, danger
- Sizes: sm, md, lg
- States: default, loading, disabled
- Icons: left, right, loading spinner

**Card Component**:
- Variants: default, elevated, outlined
- Padding: none, sm, md, lg
- Interactive: hover effects, click handlers

#### 3. Layout System

**Grid System**:
- 12-column responsive grid
- Breakpoint-based column spans
- Flexible gutters and margins

**Spacing Scale**:
- Consistent spacing using Tailwind's spacing scale
- 4px base unit (0.25rem)
- Responsive spacing adjustments

### Recommended Prototyping Tools

1. **Figma**: For high-fidelity designs and component libraries
2. **Storybook**: For component documentation and testing
3. **Framer Motion**: For interactive prototypes and animations
4. **Design Tokens**: Consistent design system implementation

---

## Conclusion

ThreadSpace represents a modern, scalable discussion platform built with industry best practices. The application demonstrates:

- **Robust Architecture**: Well-structured component hierarchy and separation of concerns
- **Modern Technologies**: Next.js 15, React 19, Apollo GraphQL, and TypeScript
- **Security-First Approach**: Comprehensive security measures and input validation
- **Mobile-First Design**: Responsive, accessible, and performant user experience
- **Scalable State Management**: Multi-layered state management with proper caching
- **Developer Experience**: Type safety, error handling, and maintainable code structure

The application is production-ready with room for enhancement in testing coverage, logging services, and advanced features like real-time notifications and advanced search capabilities.

---

*This documentation serves as a comprehensive guide to understanding ThreadSpace's architecture and implementation. For specific implementation details, refer to the source code and inline comments.*
